import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { ResumesPage } from "@/features/resumes/components/resumes-page"

export default async function ResumesPageRoute() {
  const session = await requireAuth()

  const resumes = await prisma.resume.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  })

  return <ResumesPage resumes={JSON.parse(JSON.stringify(resumes))} />
}
