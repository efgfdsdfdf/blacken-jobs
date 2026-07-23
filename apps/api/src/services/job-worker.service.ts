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
    try {
      const tags = automation.keywords && automation.keywords.length > 0 
        ? automation.keywords.join(',') 
        : 'react,node';
        
      const response = await fetch(`https://remoteok.com/api?tags=${encodeURIComponent(tags)}`);
      if (response.ok) {
        const data = await response.json() as any[];
        foundJobs = data.slice(1, 4);
      }
    } catch (error) {
      logger.error(`Error fetching real jobs for automation ${automation.id}:`, error);
      return;
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

    for (const remoteJob of foundJobs) {
      const jobUrl = remoteJob.url || remoteJob.apply_url;
      
      const existing = await prisma.job.findFirst({
        where: { userId: automation.userId, url: jobUrl }
      });

      if (existing) continue;

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
          role: remoteJob.position || "Remote Role",
          description: remoteJob.description,
          url: jobUrl,
          matchScore: Math.floor(Math.random() * 15) + 85,
          coverLetter: coverLetter,
          status: applyStatus as any, 
        }
      });

      logger.info(`🤖 Job Worker: Saved job: ${job.company} - ${job.role} (Status: ${applyStatus})`);
    }

    await prisma.automation.update({
      where: { id: automation.id },
      data: { lastRunAt: new Date() }
    });
  }
}

export const jobWorkerService = new JobWorkerService();
