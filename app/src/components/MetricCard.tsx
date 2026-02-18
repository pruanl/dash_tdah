import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface MetricCardProps {
    title: string
    value: number | string
    icon: LucideIcon
    accentColor: string
    subtitle?: string
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    accentColor,
    subtitle,
}: MetricCardProps) {
    return (
        <Card className="group relative overflow-hidden border-zinc-800 bg-zinc-900/80 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20">
            <div
                className="absolute inset-x-0 top-0 h-[2px] opacity-80 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: accentColor }}
            />
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium tracking-wide text-zinc-400 uppercase">
                            {title}
                        </p>
                        <p
                            className="text-4xl font-bold tracking-tight"
                            style={{ color: accentColor }}
                        >
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-zinc-500">{subtitle}</p>
                        )}
                    </div>
                    <div
                        className="rounded-xl p-3 transition-colors"
                        style={{ backgroundColor: `${accentColor}15` }}
                    >
                        <Icon
                            className="h-6 w-6"
                            style={{ color: accentColor }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
