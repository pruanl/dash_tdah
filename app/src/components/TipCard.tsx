import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getRandomTip, type Tip } from '@/data/tips'
import { Lightbulb } from 'lucide-react'

export function TipCard() {
    const tip: Tip = useMemo(() => getRandomTip(), [])

    return (
        <Card className="group relative overflow-hidden border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/30 backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-600 via-teal-400 to-cyan-500" />
            <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Lightbulb className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-200">
                            Dica para o TDAH
                        </h3>
                        <p className="text-xs text-zinc-500">
                            Uma estratégia para o seu dia
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="text-2xl" role="img" aria-label={tip.title}>
                            {tip.icon}
                        </span>
                        <h4 className="text-base font-semibold text-emerald-400">
                            {tip.title}
                        </h4>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-300">
                        {tip.content}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
