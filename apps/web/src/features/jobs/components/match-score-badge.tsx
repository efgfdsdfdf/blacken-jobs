import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score: number;
  className?: string;
  size?: number;
}

export function MatchScoreBadge({ score, className, size = 48 }: MatchScoreBadgeProps) {
  const normalizedScore = Math.min(100, Math.max(0, score));
  
  let color = "text-red-500";
  let strokeClass = "stroke-red-500";
  
  if (normalizedScore >= 70) {
    color = "text-emerald-500";
    strokeClass = "stroke-emerald-500";
  } else if (normalizedScore >= 40) {
    color = "text-yellow-500";
    strokeClass = "stroke-yellow-500";
  }

  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90 transform" width={size} height={size}>
        <circle
          className="stroke-zinc-800"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-1000 ease-out", strokeClass)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className={cn("absolute flex items-center justify-center text-sm font-semibold", color)}>
        {normalizedScore}
      </div>
    </div>
  );
}
