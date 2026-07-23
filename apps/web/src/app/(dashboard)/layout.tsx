import { getAuthenticatedUser } from "@/dal/auth"
import { getUserProfile } from "@/dal/user"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/common/sidebar"
import { Header } from "@/components/common/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    redirect("/login")
  }

  const profile = await getUserProfile(user.id)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background bg-grid-white/[0.02] relative">
      {/* Subtle glowing ambient background */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      
      {/* Desktop Sidebar with glassmorphism */}
      <div className="hidden border-r border-white/5 bg-background/40 backdrop-blur-md md:block relative z-10 shadow-2xl">
        <Sidebar user={profile} />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden relative z-10 glass-panel border-l border-white/5 rounded-l-2xl m-2 mr-0 shadow-2xl">
        <div className="bg-background/40 backdrop-blur-md border-b border-white/5">
          <Header user={profile} />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
