import { requireAuth } from "@/dal/auth";
import { prisma } from "@repo/db";
import { JobsPage } from "@/features/jobs/components/jobs-page";
import { Job } from "@/features/jobs/components/job-card";

export const metadata = {
  title: "Jobs - BLACK AI Job Hunter",
  description: "View and manage your job applications.",
};

export default async function JobsRoute() {
  const user = await requireAuth();
  
  const dbJobs = await prisma.job.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  
  const jobs: Job[] = dbJobs.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    locationType: job.locationType || "REMOTE",
    salaryRange: job.salaryMin && job.salaryMax 
      ? `$${Math.round(job.salaryMin / 1000)}k - $${Math.round(job.salaryMax / 1000)}k` 
      : "Salary Undefined",
    matchScore: job.matchScore || 0,
    technologies: job.technologies,
    status: job.status,
    createdAt: job.createdAt
  }));

  return (
    <JobsPage initialJobs={jobs} />
  );
}
