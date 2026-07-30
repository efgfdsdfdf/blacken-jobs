import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

export function StatCard({ label, value, icon, trend, trendValue }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden glass-card bg-background/40 backdrop-blur-md border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
        <div className="w-16 h-16 [&>svg]:w-full [&>svg]:h-full">{icon}</div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-5 relative z-10 flex flex-col h-full justify-between gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className="p-2 rounded-lg bg-white/5 text-foreground backdrop-blur-sm shadow-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {icon}
          </div>
        </div>
        
        <div>
          <div className="text-3xl font-bold tracking-tight text-white mb-1">{value}</div>
          
          {trend && (
            <div className={`flex items-center text-xs font-medium ${
              trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-zinc-400"
            }`}>
              {trend === "up" && <TrendingUp className="w-3.5 h-3.5 mr-1" />}
              {trend === "down" && <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {trend === "neutral" && <Minus className="w-3.5 h-3.5 mr-1" />}
              <span>{trendValue}</span>
              <span className="text-muted-foreground ml-1 font-normal">vs last month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
