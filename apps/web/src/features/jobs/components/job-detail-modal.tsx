import { 
  Dialog, 
  DialogContent, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Building2, ExternalLink, CheckCircle2, XCircle, Briefcase, Star } from "lucide-react";
import { Job } from "./job-card";
import { MatchScoreBadge } from "./match-score-badge";

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-white/10 bg-zinc-950/95 p-0 backdrop-blur-xl sm:rounded-2xl">
        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl">
          <div className="flex gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-bold text-white shadow-inner">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {job.title}
              </DialogTitle>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {job.company}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.location} • {job.locationType}
                </div>
                {job.salaryRange && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                    {job.salaryRange}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <MatchScoreBadge score={job.matchScore} size={64} />
            <span className="text-xs text-zinc-500">Match Score</span>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Star className="h-5 w-5 text-primary" />
              AI Match Analysis
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <h4 className="mb-3 font-medium text-emerald-400">Skill Matches</h4>
                <ul className="space-y-2">
                  {job.technologies.slice(0, 3).map((tech, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Strong alignment in <strong className="text-white">{tech}</strong> based on your recent projects.</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <h4 className="mb-3 font-medium text-red-400">Skill Gaps</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-zinc-300">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <span>Requires Docker experience (not found in your profile).</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-zinc-300">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <span>Prefers 5+ years experience (you have ~3 years).</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Briefcase className="h-5 w-5 text-zinc-400" />
              Job Description
            </h3>
            <div className="prose prose-invert max-w-none text-zinc-300">
              <p>
                {job.description || "Join our fast-growing engineering team to build scalable, high-performance applications. You will collaborate closely with product managers and designers to deliver exceptional user experiences..."}
              </p>
            </div>
          </section>

          <div className="grid gap-8 md:grid-cols-2">
            <section>
              <h3 className="mb-4 text-lg font-semibold text-white">Requirements</h3>
              <ul className="list-disc space-y-2 pl-5 text-zinc-300">
                {job.requirements ? job.requirements.map((req, i) => <li key={i}>{req}</li>) : (
                  <>
                    <li>3+ years of experience with React and TypeScript</li>
                    <li>Strong understanding of web performance and accessibility</li>
                    <li>Experience with state management solutions</li>
                    <li>Excellent communication skills</li>
                  </>
                )}
              </ul>
            </section>
            <section>
              <h3 className="mb-4 text-lg font-semibold text-white">Benefits</h3>
              <ul className="list-disc space-y-2 pl-5 text-zinc-300">
                {job.benefits ? job.benefits.map((ben, i) => <li key={i}>{ben}</li>) : (
                  <>
                    <li>Competitive salary and equity package</li>
                    <li>Comprehensive health, dental, and vision insurance</li>
                    <li>Unlimited PTO and flexible working hours</li>
                    <li>Home office stipend</li>
                  </>
                )}
              </ul>
            </section>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl">
          <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
            Dismiss
          </Button>
          <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            Save Job
          </Button>
          <Button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            Apply Now <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
