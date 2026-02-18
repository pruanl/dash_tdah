import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ReportSkeleton() {
    return (
        <div className="mx-auto max-w-6xl space-y-8 p-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-80 bg-zinc-800" />
                <Skeleton className="h-5 w-48 bg-zinc-800" />
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-zinc-800 bg-zinc-900/80">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-28 bg-zinc-800" />
                                    <Skeleton className="h-10 w-20 bg-zinc-800" />
                                </div>
                                <Skeleton className="h-12 w-12 rounded-xl bg-zinc-800" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart */}
            <Card className="border-zinc-800 bg-zinc-900/80">
                <CardHeader>
                    <Skeleton className="h-5 w-40 bg-zinc-800" />
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className="flex h-72 items-end gap-3">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="flex-1">
                                <Skeleton
                                    className="w-full bg-zinc-800"
                                    style={{
                                        height: `${30 + Math.random() * 60}%`,
                                        borderRadius: '6px 6px 0 0',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Story */}
            <Card className="border-zinc-800 bg-zinc-900/80">
                <CardContent className="space-y-3 p-6">
                    <Skeleton className="h-4 w-36 bg-zinc-800" />
                    <Skeleton className="h-4 w-full bg-zinc-800" />
                    <Skeleton className="h-4 w-4/5 bg-zinc-800" />
                    <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                </CardContent>
            </Card>
        </div>
    )
}
