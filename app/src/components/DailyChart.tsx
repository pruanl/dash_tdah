import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DailyChartProps {
    dailyHistory: Record<string, number>
}

interface ChartDataItem {
    date: string
    label: string
    count: number
}

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean
    payload?: Array<{ value: number }>
    label?: string
}) {
    if (!active || !payload?.length) return null

    return (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 shadow-xl">
            <p className="text-xs font-medium text-zinc-400">{label}</p>
            <p className="text-lg font-bold text-blue-400">
                {payload[0].value}{' '}
                <span className="text-xs font-normal text-zinc-500">
                    {payload[0].value === 1 ? 'tarefa' : 'tarefas'}
                </span>
            </p>
        </div>
    )
}

export function DailyChart({ dailyHistory }: DailyChartProps) {
    const data: ChartDataItem[] = Object.entries(dailyHistory)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
            date,
            label: format(parseISO(date), "dd 'de' MMM", { locale: ptBR }),
            count,
        }))

    if (data.length === 0) {
        return (
            <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
                <CardContent className="flex h-64 items-center justify-center p-6">
                    <div className="text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                            <span className="text-xl">📊</span>
                        </div>
                        <p className="text-sm text-zinc-400">
                            Nenhuma atividade registrada neste período
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const maxCount = Math.max(...data.map((d) => d.count))

    return (
        <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-zinc-300">
                    Atividade Diária
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#27272a"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                tickLine={false}
                                axisLine={{ stroke: '#27272a' }}
                            />
                            <YAxis
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'rgba(37, 99, 235, 0.08)' }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={48}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            entry.count === maxCount
                                                ? '#3b82f6'
                                                : '#2563eb'
                                        }
                                        fillOpacity={
                                            0.6 + (entry.count / maxCount) * 0.4
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
