interface EfficiencyCircleProps {
    percentage: number
}

export function EfficiencyCircle({ percentage }: EfficiencyCircleProps) {
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    const clampedPercentage = Math.min(100, Math.max(0, percentage))

    const getColor = () => {
        if (clampedPercentage >= 80) return '#22c55e'
        if (clampedPercentage >= 50) return '#eab308'
        return '#ef4444'
    }

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                className="h-32 w-32 -rotate-90 transform"
                viewBox="0 0 120 120"
            >
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="#27272a"
                    strokeWidth="8"
                    fill="none"
                />
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke={getColor()}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span
                    className="text-3xl font-bold"
                    style={{ color: getColor() }}
                >
                    {clampedPercentage.toFixed(0)}%
                </span>
                <span className="text-[10px] tracking-wider text-zinc-500 uppercase">
                    eficiência
                </span>
            </div>
        </div>
    )
}
