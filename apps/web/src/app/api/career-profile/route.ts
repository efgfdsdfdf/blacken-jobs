import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

// Helper to map DB schema layout back to UI state format
function mapProfileToUI(profile: any) {
  if (!profile) return {}
  return {
    personalInfo: {
      title: profile.currentJobTitle || "",
      yearsOfExperience: profile.yearsOfExperience || "",
      bio: profile.aiSummary || "" // Bio can map to summary
    },
    skills: profile.skills || [],
    education: profile.education || [],
    certifications: profile.certifications || [],
    languages: profile.languages || [],
    preferences: {
      titles: profile.preferredJobTitles || [],
      countries: profile.preferredCountries || [],
      cities: profile.preferredCities || [],
      industries: profile.preferredIndustries || [],
      salaryMin: profile.salaryMin || "",
      salaryMax: profile.salaryMax || "",
      currency: profile.salaryCurrency || "USD",
      locationPreference: profile.locationPreference?.toLowerCase() || "hybrid",
      relocation: profile.willingToRelocate || false,
      workAuthorization: profile.workAuthorization === "CITIZEN" ? "us_citizen" :
                         profile.workAuthorization === "PERMANENT_RESIDENT" ? "green_card" :
                         profile.workAuthorization === "WORK_VISA" ? "h1b" :
                         profile.workAuthorization === "NEED_SPONSORSHIP" ? "require_sponsorship" : "other"
    },
    automationSettings: {
      maxDailyApplications: profile.maxDailyApplications || 50,
      autoApply: profile.autoApplyEnabled || false,
      approvalRequired: profile.approvalRequired,
      searchInterval: profile.searchInterval || 30
    }
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const profile = await prisma.careerProfile.findUnique({
      where: { userId: user.id }
    })
    return NextResponse.json(mapProfileToUI(profile))
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    const { personalInfo, skills, education, certifications, languages, preferences, automationSettings } = body

    // Map UI structure to Database Prisma Schema
    const mappedData = {
      currentJobTitle: personalInfo?.title || null,
      yearsOfExperience: personalInfo?.yearsOfExperience ? parseInt(personalInfo.yearsOfExperience) : null,
      skills: skills || [],
      education: education || [],
      certifications: certifications || [],
      languages: languages || [],
      
      preferredJobTitles: preferences?.titles || [],
      preferredCountries: preferences?.countries || [],
      preferredCities: preferences?.cities || [],
      preferredIndustries: preferences?.industries || [],
      salaryMin: preferences?.salaryMin ? parseInt(preferences.salaryMin) : null,
      salaryMax: preferences?.salaryMax ? parseInt(preferences.salaryMax) : null,
      salaryCurrency: preferences?.currency || "USD",
      willingToRelocate: preferences?.relocation || false,
      aiSummary: personalInfo?.bio || null,
      
      // Work authorization mapping
      workAuthorization: preferences?.workAuthorization === "us_citizen" ? "CITIZEN" : 
                         preferences?.workAuthorization === "green_card" ? "PERMANENT_RESIDENT" :
                         preferences?.workAuthorization === "h1b" ? "WORK_VISA" :
                         preferences?.workAuthorization === "require_sponsorship" ? "NEED_SPONSORSHIP" : 
                         preferences?.workAuthorization === "other" ? "OTHER" : null,
                         
      // Location preference mapping
      locationPreference: preferences?.locationPreference === "remote" ? "REMOTE" :
                          preferences?.locationPreference === "hybrid" ? "HYBRID" :
                          preferences?.locationPreference === "onsite" ? "ONSITE" : null,
                          
      maxDailyApplications: automationSettings?.maxDailyApplications ? parseInt(automationSettings.maxDailyApplications) : 50,
      autoApplyEnabled: automationSettings?.autoApply || false,
      approvalRequired: automationSettings?.approvalRequired !== false,
      searchInterval: automationSettings?.searchInterval ? parseInt(automationSettings.searchInterval) : 30
    }

    // Use upsert to create or update profile cleanly
    const profile = await prisma.careerProfile.upsert({
      where: { userId: user.id },
      create: {
        ...mappedData,
        userId: user.id
      },
      update: mappedData
    })

    return NextResponse.json(mapProfileToUI(profile))
  } catch (error: any) {
    console.error("Save profile error:", error)
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function PUT(req: Request) {
  return POST(req) // Map PUT to POST to keep it DRY
}
