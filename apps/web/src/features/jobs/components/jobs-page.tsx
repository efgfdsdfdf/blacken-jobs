"use client";

import { useState } from "react";
import { Job, JobCard } from "./job-card";
import { JobDetailModal } from "./job-detail-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, Briefcase, CheckCircle2, Clock, Send } from "lucide-react";

interface JobsPageProps {
  initialJobs: Job[];
}

export function JobsPage({ initialJobs }: JobsPageProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Newest");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    const matchesLocation = locationFilter === "All" || job.locationType === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  }).sort((a, b) => {
    if (sortOption === "Match Score") {
      return b.matchScore - a.matchScore;
    }
    if (sortOption === "Salary") {
      const valA = parseInt(a.salaryRange?.replace(/[^0-9]/g, '') || "0");
      const valB = parseInt(b.salaryRange?.replace(/[^0-9]/g, '') || "0");
      return valB - valA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === "Applied").length,
    interviewing: jobs.filter(j => j.status === "Interviewing").length,
    offers: jobs.filter(j => j.status === "Offer").length,
  };

  return (
    <div className="flex flex-col space-y-8 p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Job Search</h1>
          <p className="mt-1 text-sm text-zinc-400">Discover and manage your AI-matched opportunities.</p>
        </div>
        <Button className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Search New Jobs
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass-card flex items-center gap-4 rounded-xl border border-white/5 bg-background/40 p-5 shadow-lg backdrop-blur-md">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Jobs</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4 rounded-xl border border-white/5 bg-background/40 p-5 shadow-lg backdrop-blur-md">
          <div className="rounded-lg bg-purple-500/10 p-3 text-purple-500">
            <Send className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Applied</p>
            <p className="text-2xl font-bold text-white">{stats.applied}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4 rounded-xl border border-white/5 bg-background/40 p-5 shadow-lg backdrop-blur-md">
          <div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Interviewing</p>
            <p className="text-2xl font-bold text-white">{stats.interviewing}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4 rounded-xl border border-white/5 bg-background/40 p-5 shadow-lg backdrop-blur-md">
          <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Offers</p>
            <p className="text-2xl font-bold text-white">{stats.offers}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card flex flex-col gap-4 rounded-xl border border-white/5 bg-background/40 p-5 backdrop-blur-md md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input 
            placeholder="Search by title or company..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-white/10 bg-white/5 pl-9 text-white placeholder:text-zinc-500 focus-visible:ring-primary/50"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="All">All Statuses</option>
            <option value="Found">Found</option>
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
          
          <select 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="All">All Locations</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
          
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-md border border-transparent bg-transparent px-2 py-1 text-sm text-zinc-300 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="Newest">Newest First</option>
              <option value="Match Score">Match Score</option>
              <option value="Salary">Highest Salary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Grid */}
      {filteredJobs.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job, index) => (
            <div key={job.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 50}ms` }}>
              <JobCard job={job} onClick={setSelectedJob} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 py-12 text-center backdrop-blur-sm">
          <div className="rounded-full bg-zinc-900 p-4">
            <Briefcase className="h-8 w-8 text-zinc-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">No jobs found</h3>
          <p className="mt-2 text-sm text-zinc-400">Try adjusting your filters or search query.</p>
          <Button 
            variant="outline" 
            className="mt-6 border-white/10 bg-zinc-900 text-white hover:bg-zinc-800"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
              setLocationFilter("All");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Modal */}
      <JobDetailModal 
        job={selectedJob} 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
      />
    </div>
  );
}
