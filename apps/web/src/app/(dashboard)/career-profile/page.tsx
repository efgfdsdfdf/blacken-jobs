import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { CareerProfilePage } from "@/features/career-profile/components/career-profile-page"

export default async function Page() {
  const user = await requireAuth()
  
  // Note: prisma might not have careerProfile yet if the schema is fresh, but per instructions we query it.
  // It's standard to default to null if it doesn't exist, and the component will handle it.
  const careerProfile = await prisma.careerProfile.findUnique({
    where: { userId: user.id }
  })
  
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white animate-slide-in-up">Career Profile</h1>
          <p className="text-zinc-400 mt-2 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
            Configure your professional identity and preferences to help BLACK AI find the perfect opportunities.
          </p>
        </div>
        
        <CareerProfilePage initialData={careerProfile || {}} />
      </div>
    </div>
  )
}
