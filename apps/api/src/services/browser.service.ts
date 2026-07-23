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
    
    // Launch browser (headless by default, but we can turn headless: false for debugging if needed)
    const browser = await chromium.launch({ headless: true });
    
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
      
      let isSuccess = false;

      // Extremely basic mock heuristics for V1
      if (content.includes('greenhouse.io') || content.includes('application_form')) {
        logger.info(`🌐 Detected Greenhouse/Lever ATS signature. Attempting form fill...`);
        isSuccess = await this.fillStandardATS(page, profile, portfolioUrl, coverLetter);
      } else if (content.includes('remoteok')) {
        logger.info(`🌐 Detected RemoteOK Apply link. They usually redirect to email or external ATS.`);
        // For RemoteOK, they usually have an 'Apply now' button that opens a mailto or external site.
        // For this V1, if it's an external site we don't recognize, we fail the auto-apply.
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
}

export const browserService = new BrowserService();
