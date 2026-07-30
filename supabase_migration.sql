-- =============================================================================
-- BLACK AI — Job Hunter DB Migration Script (Full Self-Contained)
-- Run this in your Supabase SQL Editor to create ALL tables from scratch.
-- =============================================================================

-- 1. Drop existing tables if they exist to prevent conflicts (ordered by dependency)
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "notification_preferences" CASCADE;
DROP TABLE IF EXISTS "analytics_snapshots" CASCADE;
DROP TABLE IF EXISTS "automation_logs" CASCADE;
DROP TABLE IF EXISTS "automations" CASCADE;
DROP TABLE IF EXISTS "search_filters" CASCADE;
DROP TABLE IF EXISTS "email_records" CASCADE;
DROP TABLE IF EXISTS "interview_records" CASCADE;
DROP TABLE IF EXISTS "application_status_history" CASCADE;
DROP TABLE IF EXISTS "applications" CASCADE;
DROP TABLE IF EXISTS "jobs" CASCADE;
DROP TABLE IF EXISTS "connected_accounts" CASCADE;
DROP TABLE IF EXISTS "cover_letter_templates" CASCADE;
DROP TABLE IF EXISTS "resumes" CASCADE;
DROP TABLE IF EXISTS "career_profiles" CASCADE;
DROP TABLE IF EXISTS "user_settings" CASCADE;
DROP TABLE IF EXISTS "profiles" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "chats" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- 2. Drop existing types to prevent conflicts
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "AuditAction" CASCADE;
DROP TYPE IF EXISTS "NotificationType" CASCADE;
DROP TYPE IF EXISTS "MessageRole" CASCADE;
DROP TYPE IF EXISTS "JobStatus" CASCADE;
DROP TYPE IF EXISTS "JobLocationType" CASCADE;
DROP TYPE IF EXISTS "JobSource" CASCADE;
DROP TYPE IF EXISTS "ApplicationMethod" CASCADE;
DROP TYPE IF EXISTS "InterviewFormat" CASCADE;
DROP TYPE IF EXISTS "EmailCategory" CASCADE;
DROP TYPE IF EXISTS "ConnectedAccountType" CASCADE;
DROP TYPE IF EXISTS "NotificationChannel" CASCADE;
DROP TYPE IF EXISTS "AutomationStatus" CASCADE;
DROP TYPE IF EXISTS "WorkAuthorizationType" CASCADE;

-- 3. Create Enums
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'OWNER');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'SETTINGS_UPDATE', 'PROFILE_UPDATE', 'ACCOUNT_DELETE');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SYSTEM', 'JOB_FOUND', 'APPLICATION_SUBMITTED', 'INTERVIEW_INVITATION', 'RECRUITER_MESSAGE', 'REJECTION', 'ASSESSMENT', 'OFFER', 'APPROVAL_NEEDED');
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
CREATE TYPE "JobStatus" AS ENUM ('FOUND', 'SAVED', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEWING', 'ASSESSMENT', 'OFFER', 'REJECTED', 'WITHDRAWN', 'EXPIRED');
CREATE TYPE "JobLocationType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');
CREATE TYPE "JobSource" AS ENUM ('LINKEDIN', 'INDEED', 'GLASSDOOR', 'WELLFOUND', 'ZIPRECRUITER', 'REMOTEOK', 'ADZUNA', 'JSEARCH', 'THE_MUSE', 'COMPANY_PORTAL', 'MANUAL', 'OTHER');
CREATE TYPE "ApplicationMethod" AS ENUM ('AUTO_APPLIED', 'ASSISTED', 'MANUAL', 'EXTERNAL_LINK');
CREATE TYPE "InterviewFormat" AS ENUM ('VIDEO', 'PHONE', 'ONSITE', 'TAKE_HOME', 'CODING_LIVE', 'PANEL', 'BEHAVIORAL', 'TECHNICAL');
CREATE TYPE "EmailCategory" AS ENUM ('INTERVIEW_INVITATION', 'RECRUITER_MESSAGE', 'ASSESSMENT_LINK', 'OFFER_LETTER', 'REJECTION', 'FOLLOW_UP', 'GENERAL', 'SPAM');
CREATE TYPE "ConnectedAccountType" AS ENUM ('LINKEDIN', 'INDEED', 'GLASSDOOR', 'WELLFOUND', 'ZIPRECRUITER', 'GMAIL', 'OUTLOOK', 'TELEGRAM', 'WHATSAPP', 'GITHUB');
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'PUSH', 'TELEGRAM', 'WHATSAPP', 'IN_APP');
CREATE TYPE "AutomationStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED', 'IDLE');
CREATE TYPE "WorkAuthorizationType" AS ENUM ('CITIZEN', 'PERMANENT_RESIDENT', 'WORK_VISA', 'STUDENT_VISA', 'NEED_SPONSORSHIP', 'OTHER');

-- 4. Create Users Table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_supabaseId_key" ON "users"("supabaseId");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_supabaseId_idx" ON "users"("supabaseId");

-- 5. Create Profiles Table
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "phoneNumber" TEXT,
    "location" TEXT,
    "website" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- 6. Create User Settings Table
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "dateFormat" TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- 7. Create Career Profiles
CREATE TABLE "career_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentJobTitle" TEXT,
    "yearsOfExperience" INTEGER,
    "skills" TEXT[],
    "primaryTechnologies" TEXT[],
    "education" JSONB,
    "certifications" JSONB,
    "languages" JSONB,
    "portfolioLinks" JSONB,
    "preferredJobTitles" TEXT[],
    "preferredCountries" TEXT[],
    "preferredCities" TEXT[],
    "preferredIndustries" TEXT[],
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT DEFAULT 'USD',
    "workAuthorization" "WorkAuthorizationType",
    "locationPreference" "JobLocationType",
    "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "visaSponsorshipNeeded" BOOLEAN NOT NULL DEFAULT false,
    "maxDailyApplications" INTEGER DEFAULT 10,
    "autoApplyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT true,
    "searchInterval" INTEGER DEFAULT 30,
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "career_profiles_userId_key" ON "career_profiles"("userId");

-- 8. Create Resumes
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "content" TEXT NOT NULL,
    "parsedData" JSONB,
    "atsScore" INTEGER,
    "atsAnalysis" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "resumes_userId_idx" ON "resumes"("userId");

-- 9. Create Cover Letter Templates
CREATE TABLE "cover_letter_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cover_letter_templates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cover_letter_templates_userId_idx" ON "cover_letter_templates"("userId");

-- 10. Create Connected Accounts
CREATE TABLE "connected_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "ConnectedAccountType" NOT NULL,
    "platformUserId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "scope" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connected_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "connected_accounts_userId_platform_key" ON "connected_accounts"("userId", "platform");
CREATE INDEX "connected_accounts_userId_idx" ON "connected_accounts"("userId");

-- 11. Create Jobs
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "companyLogo" TEXT,
    "companySize" TEXT,
    "url" TEXT,
    "description" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'FOUND',
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT DEFAULT 'USD',
    "salaryPeriod" TEXT DEFAULT 'yearly',
    "location" TEXT,
    "locationType" "JobLocationType",
    "experienceLevel" TEXT,
    "technologies" TEXT[],
    "requirements" TEXT[],
    "benefits" TEXT[],
    "visaSponsorship" BOOLEAN DEFAULT false,
    "source" "JobSource" NOT NULL DEFAULT 'MANUAL',
    "externalId" TEXT,
    "postedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "matchScore" INTEGER,
    "matchAnalysis" JSONB,
    "aiNotes" TEXT,
    "appliedAt" TIMESTAMP(3),
    "savedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "jobs_userId_externalId_source_key" ON "jobs"("userId", "externalId", "source");
CREATE INDEX "jobs_userId_status_idx" ON "jobs"("userId", "status");
CREATE INDEX "jobs_userId_matchScore_idx" ON "jobs"("userId", "matchScore");
CREATE INDEX "jobs_source_idx" ON "jobs"("source");
CREATE INDEX "jobs_createdAt_idx" ON "jobs"("createdAt");

-- 12. Create Applications
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "resumeId" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'APPLIED',
    "method" "ApplicationMethod" NOT NULL DEFAULT 'MANUAL',
    "coverLetter" TEXT,
    "tailoredResume" TEXT,
    "answers" JSONB,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "applications_jobId_key" ON "applications"("jobId");
CREATE INDEX "applications_userId_status_idx" ON "applications"("userId", "status");
CREATE INDEX "applications_createdAt_idx" ON "applications"("createdAt");

-- 13. Create Application Status History
CREATE TABLE "application_status_history" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStatus" "JobStatus",
    "toStatus" "JobStatus" NOT NULL,
    "note" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_status_history_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "application_status_history_applicationId_idx" ON "application_status_history"("applicationId");
CREATE INDEX "application_status_history_createdAt_idx" ON "application_status_history"("createdAt");

-- 14. Create Interview Records
CREATE TABLE "interview_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "duration" INTEGER,
    "timezone" TEXT,
    "format" "InterviewFormat",
    "meetingLink" TEXT,
    "location" TEXT,
    "stage" TEXT,
    "interviewerName" TEXT,
    "interviewerTitle" TEXT,
    "interviewerEmail" TEXT,
    "prepReport" JSONB,
    "mockQuestions" JSONB,
    "companyResearch" JSONB,
    "technicalTopics" JSONB,
    "suggestedQuestions" JSONB,
    "feedback" TEXT,
    "outcome" TEXT,
    "nextSteps" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_records_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "interview_records_userId_idx" ON "interview_records"("userId");
CREATE INDEX "interview_records_applicationId_idx" ON "interview_records"("applicationId");
CREATE INDEX "interview_records_scheduledAt_idx" ON "interview_records"("scheduledAt");

-- 15. Create Email Records
CREATE TABLE "email_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "externalId" TEXT,
    "from" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "category" "EmailCategory" NOT NULL DEFAULT 'GENERAL',
    "priority" TEXT,
    "aiSummary" TEXT,
    "actionRequired" TEXT,
    "deadline" TIMESTAMP(3),
    "relatedJobId" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_records_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "email_records_userId_externalId_key" ON "email_records"("userId", "externalId");
CREATE INDEX "email_records_userId_category_idx" ON "email_records"("userId", "category");
CREATE INDEX "email_records_receivedAt_idx" ON "email_records"("receivedAt");

-- 16. Create Search Filters
CREATE TABLE "search_filters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT[],
    "titles" TEXT[],
    "locations" TEXT[],
    "locationType" "JobLocationType",
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "experienceLevel" TEXT,
    "technologies" TEXT[],
    "companySize" TEXT,
    "sources" "JobSource"[],
    "visaSponsorship" BOOLEAN,
    "postingAge" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_filters_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "search_filters_userId_idx" ON "search_filters"("userId");

-- 17. Create Automations
CREATE TABLE "automations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT[],
    "locations" TEXT[],
    "technologies" TEXT[],
    "sources" "JobSource"[],
    "locationType" "JobLocationType",
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "status" "AutomationStatus" NOT NULL DEFAULT 'IDLE',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "autoApply" BOOLEAN NOT NULL DEFAULT false,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT true,
    "intervalMinutes" INTEGER NOT NULL DEFAULT 30,
    "maxDailyApps" INTEGER NOT NULL DEFAULT 10,
    "totalJobsFound" INTEGER NOT NULL DEFAULT 0,
    "totalApplied" INTEGER NOT NULL DEFAULT 0,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "automations_userId_idx" ON "automations"("userId");
CREATE INDEX "automations_isActive_idx" ON "automations"("isActive");

-- 18. Create Automation Logs
CREATE TABLE "automation_logs" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "jobsFound" INTEGER,
    "jobsMatched" INTEGER,
    "jobsApplied" INTEGER,
    "errors" JSONB,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "automation_logs_automationId_idx" ON "automation_logs"("automationId");
CREATE INDEX "automation_logs_createdAt_idx" ON "automation_logs"("createdAt");

-- 19. Create Notification Preferences
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "telegramChatId" TEXT,
    "whatsappNumber" TEXT,
    "emailAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "notification_preferences_userId_channel_key" ON "notification_preferences"("userId", "channel");

-- 20. Create Notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "link" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- 21. Create Analytics Snapshots
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "jobsFound" INTEGER NOT NULL DEFAULT 0,
    "jobsApplied" INTEGER NOT NULL DEFAULT 0,
    "responses" INTEGER NOT NULL DEFAULT 0,
    "interviews" INTEGER NOT NULL DEFAULT 0,
    "assessments" INTEGER NOT NULL DEFAULT 0,
    "offers" INTEGER NOT NULL DEFAULT 0,
    "rejections" INTEGER NOT NULL DEFAULT 0,
    "avgMatchScore" DOUBLE PRECISION,
    "topSkills" TEXT[],
    "topSources" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "analytics_snapshots_userId_date_key" ON "analytics_snapshots"("userId", "date");
CREATE INDEX "analytics_snapshots_userId_date_idx" ON "analytics_snapshots"("userId", "date");

-- 22. Create Chats
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "chats_userId_idx" ON "chats"("userId");
CREATE INDEX "chats_updatedAt_idx" ON "chats"("updatedAt");

-- 23. Create Messages
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "messages_chatId_idx" ON "messages"("chatId");
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- 24. Create Audit Logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "targetUserId" TEXT,
    "actorId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_targetUserId_idx" ON "audit_logs"("targetUserId");
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- 25. Add Foreign Key Constraints
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "career_profiles" ADD CONSTRAINT "career_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cover_letter_templates" ADD CONSTRAINT "cover_letter_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interview_records" ADD CONSTRAINT "interview_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interview_records" ADD CONSTRAINT "interview_records_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "email_records" ADD CONSTRAINT "email_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "search_filters" ADD CONSTRAINT "search_filters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automations" ADD CONSTRAINT "automations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chats" ADD CONSTRAINT "chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
