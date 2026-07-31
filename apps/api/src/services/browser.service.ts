import { chromium } from 'playwright-extra';
// @ts-ignore
import stealth from 'puppeteer-extra-plugin-stealth';
import { logger } from '../config/logger';

// Add stealth plugin to playwright
chromium.use(stealth());

export class BrowserService {
  /**
   * Navigates to the job listing, finds the application form, and attempts to submit it.
   */
  public async autoApply(
    jobUrl: string, 
    profile: { firstName: string, lastName: string, email: string }, 
    portfolioUrl: string, 
    coverLetter: string
  ): Promise<boolean> {
    logger.info(`🌐 Launching Headless Browser for URL: ${jobUrl}`);
    
    // Launch browser (headless by default)
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    });
    
    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      const page = await context.newPage();

      // Go to the job URL
      await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      logger.info(`🌐 Page loaded: ${await page.title()}`);

      // Attempt to identify ATS
      const content = await page.content();
      const currentUrl = page.url();
      
      let isSuccess = false;

      if (currentUrl.includes('indeed.com') || currentUrl.includes('apply.indeed.com') || content.includes('indeed-apply')) {
        logger.info(`🌐 Detected Indeed Application Flow. Attempting form fill...`);
        isSuccess = await this.fillIndeedApplyFlow(page, profile, portfolioUrl, coverLetter);
      } else if (content.includes('greenhouse.io') || content.includes('application_form')) {
        logger.info(`🌐 Detected Greenhouse/Lever ATS signature. Attempting form fill...`);
        isSuccess = await this.fillStandardATS(page, profile, portfolioUrl, coverLetter);
      } else if (content.includes('remoteok')) {
        logger.info(`🌐 Detected RemoteOK Apply link. They usually redirect to email or external ATS.`);
        isSuccess = false;
      } else {
        logger.warn(`🌐 Unrecognized ATS or form structure. Skipping auto-apply.`);
      }

      return isSuccess;

    } catch (error) {
      logger.error(`🌐 Browser automation failed:`, error);
      return false;
    } finally {
      await browser.close();
      logger.info(`🌐 Browser closed.`);
    }
  }

  /**
   * Attempts to fill a standard application form (First Name, Last Name, Email, Resume Link, Cover Letter).
   */
  private async fillStandardATS(page: any, profile: any, portfolioUrl: string, coverLetter: string): Promise<boolean> {
    try {
      // 1. First Name
      const firstNameInput = await page.$('input[name*="first_name"], input[name*="firstName"], input[id*="first_name"]');
      if (firstNameInput) await firstNameInput.fill(profile.firstName || 'Candidate');

      // 2. Last Name
      const lastNameInput = await page.$('input[name*="last_name"], input[name*="lastName"], input[id*="last_name"]');
      if (lastNameInput) await lastNameInput.fill(profile.lastName || 'Name');

      // 3. Email
      const emailInput = await page.$('input[name*="email"], input[type="email"]');
      if (emailInput) await emailInput.fill(profile.email);

      // 4. Portfolio / Website
      const websiteInput = await page.$('input[name*="website"], input[name*="url"], input[name*="portfolio"]');
      if (websiteInput && portfolioUrl) await websiteInput.fill(portfolioUrl);

      // 5. Cover Letter
      const coverLetterInput = await page.$('textarea[name*="cover_letter"], textarea[id*="cover_letter"]');
      if (coverLetterInput) await coverLetterInput.fill(coverLetter);

      // We are now live! Clicking the submit button!
      logger.info(`🌐 Form filled successfully. Clicking submit button...`);
      
      const submitButton = await page.$('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        logger.info(`🌐 Application Submitted successfully!`);
      } else {
        logger.warn(`🌐 Could not find submit button!`);
      }

      return true;
    } catch (error) {
      logger.error(`🌐 Failed to fill form fields:`, error);
      return false;
    }
  }

  /**
   * Automates Indeed's multi-step Easy Apply wizard processes.
   */
  private async fillIndeedApplyFlow(
    page: any,
    profile: { firstName: string, lastName: string, email: string },
    portfolioUrl: string,
    coverLetter: string
  ): Promise<boolean> {
    logger.info("🌐 Indeed Apply: Starting multi-step application...");
    
    // We try to fill inputs and click 'Continue' up to 8 times (as Indeed forms are multi-step)
    for (let step = 0; step < 8; step++) {
      try {
        await page.waitForTimeout(2000);
        
        const url = page.url();
        logger.info(`🌐 Indeed Apply Step ${step + 1}: Current URL is ${url}`);

        // Check if we reached the final submit page
        const submitButton = await page.$('button:has-text("Submit"), button:has-text("Submit your application"), button.ia-BasePage-footerFn');
        const continueButton = await page.$('button:has-text("Continue"), button:has-text("Next"), button.ia-continueButton');

        if (submitButton) {
          logger.info("🌐 Indeed Apply: Submit button found. Submitting application!");
          await submitButton.click();
          await page.waitForTimeout(3000);
          return true;
        }

        // If we see text inputs, let's try to fill standard fields
        const firstNameInput = await page.$('input[name*="firstName"], input[id*="firstName"]');
        if (firstNameInput) await firstNameInput.fill(profile.firstName);

        const lastNameInput = await page.$('input[name*="lastName"], input[id*="lastName"]');
        if (lastNameInput) await lastNameInput.fill(profile.lastName);

        const emailInput = await page.$('input[name*="email"], input[type="email"]');
        if (emailInput) await emailInput.fill(profile.email);

        // Handle cover letter textarea if visible
        const coverLetterArea = await page.$('textarea[name*="cover"], textarea[id*="cover"], textarea[placeholder*="cover"]');
        if (coverLetterArea) {
          await coverLetterArea.fill(coverLetter);
        }

        // Click continue to go to the next step
        if (continueButton) {
          logger.info("🌐 Indeed Apply: Clicking Continue...");
          await continueButton.click();
        } else {
          logger.warn("🌐 Indeed Apply: No continue button found. Might be blocked or completed.");
          break;
        }
      } catch (stepError) {
        logger.error(`Error filling indeed application step ${step + 1}:`, stepError);
        break;
      }
    }
    
    return false;
  }

  /**
   * Logs into Indeed using user credentials, searches for jobs, and returns matching postings.
   */
  public async indeedLoginAndSearch(
    email: string,
    password: string,
    keywords: string
  ): Promise<any[]> {
    logger.info(`🌐 Indeed Crawler: Initiating Indeed session for ${email}`);
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    });
    
    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 }
      });
      const page = await context.newPage();

      // Step 1: Go to Indeed Login
      await page.goto('https://secure.indeed.com/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
      logger.info('🌐 Indeed Crawler: Login page loaded.');

      // Wait a bit to simulate human interaction
      await page.waitForTimeout(2000);

      // Fill email
      const emailField = await page.$('input[type="email"], input[name*="username"], input[id*="email"]');
      if (emailField) {
        await emailField.fill(email);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
      }

      // Fill password
      const passwordField = await page.$('input[type="password"], input[name*="password"], input[id*="password"]');
      if (passwordField) {
        await passwordField.fill(password);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
      }

      logger.info('🌐 Indeed Crawler: Logged in. Navigating to job search...');

      // Step 2: Search for target role
      const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(keywords)}&l=Remote`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Step 3: Extract jobs
      logger.info('🌐 Indeed Crawler: Extracting job search results...');
      
      const jobCards = await page.$$('.cardOutline');
      const jobs: any[] = [];

      for (const card of jobCards.slice(0, 3)) { // Fetch top 3 matching jobs
        try {
          const titleElement = await card.$('h2.jobTitle span');
          const title = titleElement ? await titleElement.innerText() : 'Indeed Job';

          const companyElement = await card.$('.companyName, [data-testid="company-name"]');
          const company = companyElement ? await companyElement.innerText() : 'Indeed Company';

          const linkElement = await card.$('h2.jobTitle a');
          const relativeLink = linkElement ? await linkElement.getAttribute('href') : '';
          const url = relativeLink ? `https://www.indeed.com${relativeLink}` : 'https://www.indeed.com';

          const summaryElement = await card.$('.job-snippet');
          const description = summaryElement ? await summaryElement.innerText() : 'No snippet available';

          jobs.push({
            position: title,
            company: company,
            description: description,
            url: url,
            source: 'INDEED'
          });
        } catch (e) {
          logger.error('🌐 Indeed Crawler: Error extracting card:', e);
        }
      }

      logger.info(`🌐 Indeed Crawler: Successfully scraped ${jobs.length} jobs.`);
      return jobs;

    } catch (error) {
      logger.error('🌐 Indeed Crawler failed:', error);
      return [];
    } finally {
      await browser.close();
      logger.info('🌐 Indeed Crawler session closed.');
    }
  }
}

export const browserService = new BrowserService();
