import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, Briefcase, Code2, Globe, MessageSquare, Sparkles } from "lucide-react"

export default function MarketingPage() {
  const features = [
    {
      icon: MessageSquare,
      title: "AI Chat",
      description: "Context-aware conversational AI that understands your codebase and helps you write better software faster.",
    },
    {
      icon: Code2,
      title: "Code Generation",
      description: "Automatically generate boilerplate, full components, or entire features based on natural language prompts.",
    },
    {
      icon: Briefcase,
      title: "Job Hunter",
      description: "An autonomous agent that finds relevant jobs, writes personalized cover letters, and applies on your behalf.",
    },
    {
      icon: Globe,
      title: "Website Builder",
      description: "Describe the website you want, and watch as BLACK AI generates a fully responsive Next.js application.",
    },
    {
      icon: Bot,
      title: "Browser Automation",
      description: "Automate repetitive web tasks, data extraction, and end-to-end testing with intelligent browser control.",
    },
    {
      icon: Sparkles,
      title: "Personal Assistant",
      description: "A digital brain that organizes your tasks, schedules meetings, and manages your developer workflow.",
    },
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-24 pb-32 sm:px-8 sm:pt-32 sm:pb-40">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 animate-slide-in-up">
            <div className="inline-flex items-center rounded-full border bg-background/50 backdrop-blur px-3 py-1 text-sm font-medium mb-4">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span>Introducing BLACK AI v1.0</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
              The Future of <br className="hidden sm:block" />
              <span className="text-primary">AI-Powered</span> Development
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Stop writing boilerplate. Stop searching for jobs manually. 
              BLACK AI is your autonomous developer agent that builds software, 
              automates browsers, and accelerates your career.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-shadow" asChild>
                <Link href="/register">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base bg-background/50 backdrop-blur" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-24 sm:px-8 border-t bg-background/50 backdrop-blur-sm">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to build faster
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful autonomous tools designed for modern developers.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group relative flex flex-col items-start p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card transition-colors shadow-sm hover:shadow-md"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust / Tech Stack Section */}
        <section className="container mx-auto px-4 py-24 sm:px-8 border-t text-center">
          <h2 className="text-2xl font-semibold mb-12 text-muted-foreground">Built with cutting-edge technology</h2>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Tech logos would go here */}
            <div className="flex items-center gap-2 text-2xl font-bold"><Code2 className="h-8 w-8"/> Next.js 15</div>
            <div className="flex items-center gap-2 text-2xl font-bold"><Sparkles className="h-8 w-8"/> React 19</div>
            <div className="flex items-center gap-2 text-2xl font-bold"><Code2 className="h-8 w-8"/> Tailwind v4</div>
            <div className="flex items-center gap-2 text-2xl font-bold"><Bot className="h-8 w-8"/> Supabase</div>
          </div>
        </section>
      </div>
    </div>
  )
}
