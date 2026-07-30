import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { ApplicationsPage } from "@/features/applications/components/applications-page"

export const metadata = {
  title: "Applications | BLACK AI",
  description: "Track your job applications",
}

export default async function Page() {
  const user = await requireAuth()

  // Fetch applications with related job data
  const applications = await prisma.application.findMany({
    where: {
      userId: user.id,
    },
    include: {
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return <ApplicationsPage initialApplications={applications} />
}
