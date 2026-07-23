import { getAuthenticatedUser } from "@/dal/auth"
import { getUserProfile } from "@/dal/user"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Globe, Calendar, Briefcase, Mail } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
  const session = await getAuthenticatedUser()
  const user = await getUserProfile(session!.id)

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-fade-in">
      {/* Profile Header */}
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-background w-full" />
        <CardContent className="relative pt-0 sm:pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20 gap-4 sm:gap-6 px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <Avatar className="h-32 w-32 border-4 border-card shadow-xl rounded-2xl bg-card">
                <AvatarImage src="" />
                <AvatarFallback className="text-4xl bg-primary/10 text-primary rounded-2xl">
                  {user.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {user.displayName || `${user.firstName} ${user.lastName}`}
                </h1>
                <p className="text-muted-foreground font-medium text-sm sm:text-base">
                  {user.jobTitle} {user.company ? `at ${user.company}` : ''}
                </p>
              </div>
            </div>
            <div className="pb-2">
              <Button asChild variant="outline">
                <Link href="/settings">Edit Profile</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* About Section */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {user.bio || "No bio provided yet."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Details</h3>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4 shrink-0 text-primary/70" />
                <span>{user.company || "Independent"}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
                <span>{user.location || "Earth"}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Globe className="h-4 w-4 shrink-0 text-primary/70" />
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  {user.website || "No website"}
                </a>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                <span>Joined {joinDate}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary/70" />
                <span>{session?.email}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
