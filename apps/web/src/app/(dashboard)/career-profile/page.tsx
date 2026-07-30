import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { CareerProfilePage } from "@/features/career-profile/components/career-profile-page"

function mapProfileToUI(profile: any) {
  if (!profile) return {}
  return {
    personalInfo: {
      title: profile.currentJobTitle || "",
      yearsOfExperience: profile.yearsOfExperience || "",
      bio: profile.aiSummary || ""
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

export default async function Page() {
  const user = await requireAuth()
  
  const careerProfile = await prisma.careerProfile.findUnique({
    where: { userId: user.id }
  })
  
  const mappedData = mapProfileToUI(careerProfile)
  
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white animate-slide-in-up">Career Profile</h1>
          <p className="text-zinc-400 mt-2 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
            Configure your professional identity and preferences to help BLACK AI find the perfect opportunities.
          </p>
        </div>
        
        <CareerProfilePage initialData={mappedData} />
      </div>
    </div>
  )
}
