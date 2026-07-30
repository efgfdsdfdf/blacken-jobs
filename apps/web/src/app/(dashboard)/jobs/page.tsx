import { requireAuth } from "@/dal/auth";
import { prisma } from "@repo/db";
import { JobsPage } from "@/features/jobs/components/jobs-page";
import { Job } from "@/features/jobs/components/job-card";

export const metadata = {
  title: "Jobs - BLACK AI Job Hunter",
  description: "View and manage your job applications.",
};

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "Vercel",
    location: "San Francisco, CA",
    locationType: "Remote",
    salaryRange: "$150k - $200k",
    matchScore: 92,
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    status: "Found",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "2",
    title: "Full Stack Developer",
    company: "Stripe",
    location: "New York, NY",
    locationType: "Hybrid",
    salaryRange: "$160k - $220k",
    matchScore: 85,
    technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
    status: "Applied",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    id: "3",
    title: "Software Engineer, Frontend",
    company: "Airbnb",
    location: "Seattle, WA",
    locationType: "Onsite",
    salaryRange: "$140k - $190k",
    matchScore: 68,
    technologies: ["React", "GraphQL", "TypeScript"],
    status: "Saved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
  },
  {
    id: "4",
    title: "Frontend Architect",
    company: "Netflix",
    location: "Los Gatos, CA",
    locationType: "Remote",
    salaryRange: "$200k - $300k",
    matchScore: 45,
    technologies: ["React", "RxJS", "Performance", "WebPack"],
    status: "Rejected",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
  },
  {
    id: "5",
    title: "UI Engineer",
    company: "Linear",
    location: "San Francisco, CA",
    locationType: "Remote",
    salaryRange: "$130k - $170k",
    matchScore: 95,
    technologies: ["React", "Framer Motion", "TypeScript", "CSS"],
    status: "Interviewing",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: "6",
    title: "Senior Product Engineer",
    company: "Notion",
    location: "San Francisco, CA",
    locationType: "Hybrid",
    salaryRange: "$160k - $210k",
    matchScore: 88,
    technologies: ["React", "TypeScript", "Electron", "SQLite"],
    status: "Offer",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21),
  }
];

export default async function JobsRoute() {
  const user = await requireAuth();
  
  // Example implementation connecting to DB:
  // const dbJobs = await prisma.job.findMany({
  //   where: { userId: user.id },
  //   orderBy: { createdAt: 'desc' }
  // });
  
  // Using mock data for immediate UI rendering
  const jobs: Job[] = mockJobs;

  return (
    <JobsPage initialJobs={jobs} />
  );
}
