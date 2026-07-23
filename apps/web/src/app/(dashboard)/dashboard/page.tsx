/**
 * @module app/(dashboard)/dashboard/page
 * @description Main dashboard page with welcome section, stats overview,
 * quick actions, and recent activity feed.
 */

import { requireAuth } from "@/dal/auth";
import { getUserProfile, getUserNotifications } from "@/dal/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Code2,
  MessageSquare,
  CheckCircle,
  Briefcase,
  Plus,
  Search,
  Globe,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — BLACK AI",
  description: "Your AI-powered development command center.",
};

/**
 * Returns a time-of-day greeting based on the current hour.
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const profile = await getUserProfile(session.id);

  const firstName = profile?.profile?.firstName ?? "there";
  const greeting = getGreeting();

  // Stat cards — these will connect to real data in later phases
  const stats = [
    {
      name: "Total Projects",
      value: "0",
      icon: Code2,
      trend: "Create your first project",
    },
    {
      name: "AI Chats",
      value: "0",
      icon: MessageSquare,
      trend: "Start a conversation",
    },
    {
      name: "Tasks Complete",
      value: "—",
      icon: CheckCircle,
      trend: "No tasks yet",
    },
    {
      name: "Job Applications",
      value: "0",
      icon: Briefcase,
      trend: "Set up job hunting",
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {firstName}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here is what is happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Activity Feed */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with a new task instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button className="w-full justify-start h-12" variant="outline">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              New AI Chat
            </Button>
            <Button className="w-full justify-start h-12" variant="outline">
              <Plus className="mr-2 h-5 w-5 text-primary" />
              Create Project
            </Button>
            <Button className="w-full justify-start h-12" variant="outline">
              <Search className="mr-2 h-5 w-5 text-primary" />
              Find Jobs
            </Button>
            <Button className="w-full justify-start h-12" variant="outline">
              <Globe className="mr-2 h-5 w-5 text-primary" />
              Build Website
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <CheckCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your recent actions will appear here as you use the platform.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
