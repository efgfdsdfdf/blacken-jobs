import { Filter } from "lucide-react"

interface FunnelChartProps {
  data: {
    found: number
    applied: number
    underReview: number
    interviewing: number
    offer: number
  }
}

export function FunnelChart({ data }: FunnelChartProps) {
  const max = data.found || 1
  
  const stages = [
    { id: "found", label: "Jobs Found", value: data.found, color: "from-blue-600/40 to-blue-500/10", width: "100%", accent: "bg-blue-500" },
    { id: "applied", label: "Applied", value: data.applied, color: "from-indigo-600/40 to-indigo-500/10", width: "85%", accent: "bg-indigo-500" },
    { id: "underReview", label: "Under Review", value: data.underReview, color: "from-yellow-600/40 to-yellow-500/10", width: "70%", accent: "bg-yellow-500" },
    { id: "interviewing", label: "Interviewing", value: data.interviewing, color: "from-purple-600/40 to-purple-500/10", width: "50%", accent: "bg-purple-500" },
    { id: "offer", label: "Offers", value: data.offer, color: "from-green-600/40 to-green-500/10", width: "30%", accent: "bg-green-500" },
  ]

  return (
    <div className="flex flex-col items-center gap-3 py-4 w-full">
      {stages.map((stage, i) => {
        const percentage = Math.round((stage.value / max) * 100)
        
        return (
          <div key={stage.id} className="w-full flex justify-center group relative">
            <div 
              className="h-14 md:h-16 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 group-hover:scale-[1.02] group-hover:border-white/10 group-hover:shadow-lg relative overflow-hidden"
              style={{ width: stage.width }}
            >
              {/* Colored progress bar fill to see progress clearly on mobile */}
              <div 
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${stage.color} opacity-80 transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
              
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${stage.accent} opacity-90`} />
              
              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-2 h-2 rounded-full ${stage.accent} shadow-[0_0_8px_currentColor]`} />
                <span className="font-semibold text-xs sm:text-sm text-zinc-200">
                  {stage.label}
                </span>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-6 relative z-10">
                <span className="text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-zinc-400 border border-white/5">
                  {percentage}%
                </span>
                <span className="font-bold text-base sm:text-lg text-white">{stage.value}</span>
              </div>
            </div>
            
            {/* Connection line */}
            {i < stages.length - 1 && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/10" />
            )}
          </div>
        )
      })}
    </div>
  )
}
