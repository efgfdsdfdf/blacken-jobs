import { MapPin, DollarSign, Clock, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MatchScoreBadge } from "./match-score-badge";
import { formatDistanceToNow } from "date-fns";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  locationType: "Remote" | "Hybrid" | "Onsite";
  salaryRange?: string;
  matchScore: number;
  technologies: string[];
  status: "Found" | "Saved" | "Applied" | "Interviewing" | "Offer" | "Rejected";
  createdAt: Date;
  description?: string;
  requirements?: string[];
  benefits?: string[];
}

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
}

const statusColors = {
  Found: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  Saved: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Applied: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Interviewing: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Offer: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
};

const locationTypeColors = {
  Remote: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Hybrid: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Onsite: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function JobCard({ job, onClick }: JobCardProps) {
  const companyInitial = job.company.charAt(0).toUpperCase();

  return (
    <div 
      onClick={() => onClick(job)}
      className="glass-card group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-white/5 bg-background/40 p-5 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-primary/5"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 text-xl font-bold text-white shadow-inner">
            {companyInitial}
          </div>
          <div>
            <h3 className="font-semibold text-white line-clamp-1">{job.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
              <Building2 className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{job.company}</span>
            </div>
          </div>
        </div>
        <MatchScoreBadge score={job.matchScore} size={42} />
      </div>

      <div className="relative z-10 mt-4 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-zinc-500" />
            <span>{job.location}</span>
          </div>
          <span className="text-zinc-600">•</span>
          <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", locationTypeColors[job.locationType])}>
            {job.locationType}
          </span>
        </div>
        
        {job.salaryRange && (
          <div className="flex items-center gap-1.5 text-sm text-zinc-300">
            <DollarSign className="h-4 w-4 text-zinc-500" />
            <span>{job.salaryRange}</span>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap gap-1.5">
        {job.technologies.slice(0, 4).map((tech) => (
          <span key={tech} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300">
            {tech}
          </span>
        ))}
        {job.technologies.length > 4 && (
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-400">
            +{job.technologies.length - 4}
          </span>
        )}
      </div>

      <div className="relative z-10 mt-5 flex items-center justify-between border-t border-white/5 pt-4">
        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", statusColors[job.status])}>
          {job.status}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDistanceToNow(job.createdAt, { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
}
