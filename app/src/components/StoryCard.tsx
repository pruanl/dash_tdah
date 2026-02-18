import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
    getRandomStory,
    getRandomReflection,
    type Story,
} from '@/data/stories'
import { Sparkles, Quote } from 'lucide-react'

export function StoryCard() {
    const story: Story = useMemo(() => getRandomStory(), [])
    const reflection: string = useMemo(() => getRandomReflection(), [])

    return (
        <div className="space-y-4">
            {/* Inspiração do Dia */}
            <Card className="group relative overflow-hidden border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/30 backdrop-blur-sm">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-600 via-blue-400 to-purple-500" />
                <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                            <Sparkles className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-200">
                                Inspiração do Dia
                            </h3>
                            <p className="text-xs text-zinc-500">
                                Uma história para te motivar
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
                        <h4 className="mb-1 text-base font-semibold text-blue-400">
                            {story.title}
                        </h4>
                        <p className="mb-3 text-xs font-medium text-zinc-500">
                            — {story.author}
                        </p>
                        <p className="text-sm leading-relaxed text-zinc-300">
                            {story.content}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Reflexão do Cínico */}
            <Card className="group relative overflow-hidden border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                            <Quote className="h-4 w-4 text-amber-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-200">
                            Reflexão do Cínico
                        </h3>
                    </div>

                    <blockquote className="border-l-2 border-amber-500/40 pl-4">
                        <p className="text-sm leading-relaxed italic text-zinc-400">
                            "{reflection}"
                        </p>
                    </blockquote>
                </CardContent>
            </Card>
        </div>
    )
}
