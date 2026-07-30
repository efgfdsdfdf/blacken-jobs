import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { redirect } from "next/navigation"
import { MockInterviewSession } from "@/features/interviews/components/mock-interview-session"

export default async function InterviewPrepPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const { id } = await params

  const interview = await prisma.interviewRecord.findUnique({
    where: { id },
    include: { application: { include: { job: true } } }
  })

  if (!interview || interview.userId !== session.id) {
    redirect("/interviews")
  }

  return <MockInterviewSession interviewId={id} company={interview.application.job.company} title={interview.application.job.title} />
}
