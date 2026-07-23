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
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-sidebar md:block">
        <Sidebar user={profile} />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={profile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
