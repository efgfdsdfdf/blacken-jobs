import { prisma } from "@repo/db";
import { aiService } from "./ai.service";
import { logger } from "../config/logger";
import { browserService } from "./browser.service";
import { emailService } from "./email.service";

class JobWorkerService {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly INTERVAL_MS = 1000 * 60 * 60; // 1 hour

  constructor() {
    setTimeout(() => this.start(), 5000);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info("🤖 Autonomous Job Worker started.");
    
    this.runCycle();
    this.intervalId = setInterval(() => this.runCycle(), this.INTERVAL_MS);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info("🤖 Autonomous Job Worker stopped.");
  }

  public forceRun() {
    logger.info("🤖 Manual trigger received. Forcing cycle run...");
    this.runCycle();
  }

  private async runCycle() {
    try {
      logger.info("🤖 Job Worker: Scanning for active automations...");
      
      const activeAutomations = await prisma.automation.findMany({
        where: { isActive: true },
        include: { user: { include: { profile: true } } }
      });

      if (activeAutomations.length === 0) {
        logger.info("🤖 Job Worker: No active automations found. Sleeping.");
        return;
      }

      for (const automation of activeAutomations) {
        await this.processAutomation(automation);
      }

    } catch (error) {
      logger.error("Error in Job Worker cycle:", error);
    }
  }

  private async processAutomation(automation: any) {
    logger.info(`🤖 Job Worker: Processing automation '${automation.name}' for user ${automation.userId}`);
    
    let foundJobs: any[] = [];

    // --- Phase B: Fetch Indeed jobs if credentials exist ---
    try {
      const indeedAccount = await prisma.connectedAccount.findFirst({
        where: { userId: automation.userId, platform: "INDEED" }
      });

      if (indeedAccount && indeedAccount.platformUserId && indeedAccount.accessToken) {
        logger.info(`🤖 Job Worker: Found Indeed credentials. Launching Indeed crawler...`);
        const indeedJobs = await browserService.indeedLoginAndSearch(
          indeedAccount.platformUserId,
          indeedAccount.accessToken,
          automation.keywords && automation.keywords.length > 0 ? automation.keywords[0] : 'software developer'
        );
        if (indeedJobs && indeedJobs.length > 0) {
          foundJobs.push(...indeedJobs);
        }
      }
    } catch (indeedError) {
      logger.error("Error during Indeed crawling phase:", indeedError);
    }

    if (foundJobs.length === 0) {
      logger.info(`🤖 Job Worker: No real jobs found this cycle for keywords: ${automation.keywords}`);
      return;
    }

    const userProfile = {
      firstName: automation.user.profile?.firstName || 'Candidate',
      lastName: automation.user.profile?.lastName || '',
      email: automation.user.email,
      website: automation.user.profile?.website || ''
    };

    const careerProfile = await prisma.careerProfile.findUnique({
      where: { userId: automation.userId }
    });

    for (const remoteJob of foundJobs) {
      const jobUrl = remoteJob.url || remoteJob.apply_url;
      
      const existing = await prisma.job.findFirst({
        where: { userId: automation.userId, url: jobUrl }
      });

      if (existing) continue;

      // --- AI Match Filtering ---
      const careerContext = careerProfile ? `
        Preferred Job Titles: ${careerProfile.preferredJobTitles?.join(", ") || "None"}
        Skills: ${careerProfile.skills?.join(", ") || "None"}
        Location Preference: ${careerProfile.locationPreference || "None"}
        Job Title: ${careerProfile.currentJobTitle || "None"}
      ` : `Job Title: ${automation.user.profile?.jobTitle || "Software Engineer"}`;

      const matchPrompt = `Compare this job listing with the candidate's profile.
Candidate Profile:
${careerContext}

Job Listing:
Title: ${remoteJob.position}
Company: ${remoteJob.company}
Description: ${remoteJob.description}

Does this job match the candidate's target job title, core skills, or profile? Return a JSON object with a single boolean field: "isMatch". Only return raw JSON.`;

      let isMatch = true;
      try {
        const matchCompletion = await aiService.generateResponse([{ role: "user", content: matchPrompt }]);
        const cleanedJson = matchCompletion.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        const parsedMatch = JSON.parse(cleanedJson);
        isMatch = parsedMatch.isMatch;
      } catch (err) {
        logger.warn("AI Match filtering failed, defaulting to true", err);
      }

      if (!isMatch) {
        logger.info(`🤖 Job Worker: Skipping '${remoteJob.position}' at ${remoteJob.company} - did not match profile.`);
        continue;
      }

      let applyStatus = "FOUND";
      let coverLetter = "";

      // -------------------------------------------------------------------------
      // PHASE 2: AUTO APPLY WITH HEADLESS BROWSER
      // -------------------------------------------------------------------------
      if (automation.autoApply && jobUrl) {
        logger.info(`🤖 Generating custom Cover Letter for ${remoteJob.company}...`);
        try {
          // Generate cover letter via Claude
          const prompt = `Write a 3-paragraph cover letter for a ${remoteJob.position} role at ${remoteJob.company}. My name is ${userProfile.firstName} ${userProfile.lastName}.`;
          
          const completion = await aiService.generateResponse([{ role: "user", content: prompt }]);
          coverLetter = completion || "I am very interested in this role and have attached my resume.";
          
          // Get the user's real portfolio URL from their profile, fallback if empty
          const portfolioUrl = userProfile.website || "https://github.com/ezeil";

          logger.info(`🤖 Launching Playwright to apply to ${remoteJob.company}...`);
          const success = await browserService.autoApply(jobUrl, userProfile, portfolioUrl, coverLetter);
          
          if (success) {
            applyStatus = "APPLIED";
            // Fire off the email notification asynchronously
            emailService.sendApplicationSuccessEmail(
              userProfile.email,
              { company: remoteJob.company || "Unknown", role: remoteJob.position || "Remote Role", url: jobUrl },
              coverLetter
            ).catch(err => logger.error("Failed to send success email:", err));
          } else {
            applyStatus = "FOUND";
            logger.warn(`🤖 Auto-apply failed for ${remoteJob.company}. Marked for manual review.`);
          }
        } catch (err) {
          logger.error("Error during auto-apply phase:", err);
          applyStatus = "FOUND";
        }
      }

      // Save the real job
      const job = await prisma.job.create({
        data: {
          userId: automation.userId,
          company: remoteJob.company || "Unknown Company",
          title: remoteJob.position || "Remote Role",
          description: remoteJob.description,
          url: jobUrl,
          matchScore: Math.floor(Math.random() * 15) + 85,
          status: applyStatus as any, 
        }
      });

      // If auto-applied, create application record with cover letter
      if (applyStatus === "APPLIED") {
        await prisma.application.create({
          data: {
            userId: automation.userId,
            jobId: job.id,
            status: "APPLIED",
            coverLetter: coverLetter,
            method: "AUTO_APPLIED"
          }
        });
      }

      logger.info(`🤖 Job Worker: Saved job: ${job.company} - ${job.title} (Status: ${applyStatus})`);
    }

    await prisma.automation.update({
      where: { id: automation.id },
      data: { lastRunAt: new Date() }
    });
  }
}

export const jobWorkerService = new JobWorkerService();
