import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { subDays, format, parseISO, isValid, isBefore } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import {
    CheckCircle2,
    Clock,
    Zap,
    SearchX,
    CalendarX2,
    ShieldAlert,
    Lock,
} from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/DateRangePicker'
import { MetricCard } from '@/components/MetricCard'
import { EfficiencyCircle } from '@/components/EfficiencyCircle'
import { DailyChart } from '@/components/DailyChart'
import { StoryCard } from '@/components/StoryCard'
import { TipCard } from '@/components/TipCard'
import { ReportSkeleton } from '@/components/ReportSkeleton'

interface ReportData {
    user_name: string
    tasks_completed: number
    tasks_pending: number
    total_period_tasks: number
    completion_rate: string
    daily_history: Record<string, number>
    is_valid?: boolean
}

type ErrorType = 'not_found' | 'invalid_date' | 'generic' | 'invalid_pin'

// ─── Local Storage Utils ─────────────────────────────────────────────────

const getStoredPin = (publicId: string) => {
    try {
        const stored = localStorage.getItem(`tdah_auth_${publicId}`)
        if (stored) {
            const parsed = JSON.parse(stored)
            const age = Date.now() - parsed.timestamp
            const maxAge = 72 * 60 * 60 * 1000 // 72 hours
            if (age < maxAge && parsed.pin) {
                return parsed.pin
            }
        }
    } catch (e) { }
    return null
}

const savePin = (publicId: string, pin: string) => {
    localStorage.setItem(
        `tdah_auth_${publicId}`,
        JSON.stringify({ pin, timestamp: Date.now() })
    )
}

const clearPin = (publicId: string) => {
    localStorage.removeItem(`tdah_auth_${publicId}`)
}

// ─── PIN Modal Component ─────────────────────────────────────────────────

function PinModal({
    isOpen,
    onSubmit,
}: {
    isOpen: boolean
    onSubmit: (pin: string) => void
}) {
    const [pin, setPin] = useState('')

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
            <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 shadow-2xl">
                <CardContent className="flex flex-col gap-6 p-6">
                    <div className="space-y-2 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                            <Lock className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-100">
                            Autenticação
                        </h2>
                        <p className="text-sm text-zinc-400">
                            Informe os 4 últimos dígitos do seu telefone para acessar o relatório.
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            if (pin.length === 4) onSubmit(pin)
                        }}
                        className="space-y-4"
                    >
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '')
                                if (val.length <= 4) setPin(val)
                            }}
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-center text-3xl font-bold tracking-[0.5em] text-zinc-100 placeholder:text-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0000"
                            autoFocus
                        />
                        <Button
                            type="submit"
                            disabled={pin.length !== 4}
                            className="w-full bg-blue-600 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Verificar
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

/**
 * Parses and validates date params from URL query string.
 *
 * Rules:
 * - No ini/fim → ini = 7 days ago, fim = today
 * - Only ini → fim = today
 * - If ini > fim → swap them
 * - Invalid date format → return error
 */
function parseDateParams(searchParams: URLSearchParams): {
    from: Date
    to: Date
    error: string | null
} {
    const today = new Date()
    const iniParam = searchParams.get('ini')
    const fimParam = searchParams.get('fim')

    // No dates passed → last 7 days
    if (!iniParam && !fimParam) {
        return {
            from: subDays(today, 7),
            to: today,
            error: null,
        }
    }

    // Validate ini
    let fromDate: Date
    if (iniParam) {
        fromDate = parseISO(iniParam)
        if (!isValid(fromDate)) {
            return {
                from: subDays(today, 7),
                to: today,
                error: `A data inicial "${iniParam}" não é válida. Use o formato AAAA-MM-DD (ex: 2026-01-15).`,
            }
        }
    } else {
        fromDate = subDays(today, 7)
    }

    // Validate fim
    let toDate: Date
    if (fimParam) {
        toDate = parseISO(fimParam)
        if (!isValid(toDate)) {
            return {
                from: subDays(today, 7),
                to: today,
                error: `A data final "${fimParam}" não é válida. Use o formato AAAA-MM-DD (ex: 2026-02-18).`,
            }
        }
    } else {
        // Only ini passed → fim = today
        toDate = today
    }

    // If ini > fim → swap them
    if (isBefore(toDate, fromDate)) {
        const temp = fromDate
        fromDate = toDate
        toDate = temp
    }

    return { from: fromDate, to: toDate, error: null }
}

// ─── Error Screen Components ─────────────────────────────────────────────

function ErrorScreen({
    type,
    message,
    onRetry,
}: {
    type: ErrorType
    message: string
    onRetry?: () => void
}) {
    const configs = {
        not_found: {
            icon: SearchX,
            emoji: '🔍',
            title: 'Usuário não encontrado',
            gradient: 'from-red-500/20 to-orange-500/20',
            iconColor: 'text-red-400',
            borderColor: 'border-red-500/20',
        },
        invalid_date: {
            icon: CalendarX2,
            emoji: '📅',
            title: 'Data inválida',
            gradient: 'from-amber-500/20 to-yellow-500/20',
            iconColor: 'text-amber-400',
            borderColor: 'border-amber-500/20',
        },
        generic: {
            icon: ShieldAlert,
            emoji: '⚠️',
            title: 'Ops! Algo deu errado',
            gradient: 'from-zinc-500/20 to-zinc-600/20',
            iconColor: 'text-zinc-400',
            borderColor: 'border-zinc-600/20',
        },
        invalid_pin: {
            icon: Lock,
            emoji: '🔒',
            title: 'Acesso Negado',
            gradient: 'from-red-500/20 to-rose-500/20',
            iconColor: 'text-red-400',
            borderColor: 'border-red-500/20',
        },
    }

    const config = configs[type]
    const Icon = config.icon

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#09090b] p-4">
            {/* Subtle background */}
            <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

            <Card
                className={`relative max-w-lg overflow-hidden border-zinc-800 bg-zinc-900/90 backdrop-blur-sm ${config.borderColor}`}
            >
                {/* Top gradient bar */}
                <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${config.gradient}`}
                />

                <CardContent className="flex flex-col items-center gap-5 p-10 text-center">
                    {/* Icon with glow */}
                    <div className="relative">
                        <div
                            className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} blur-xl`}
                        />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-800/80">
                            <Icon className={`h-9 w-9 ${config.iconColor}`} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-zinc-100">
                            {config.title}
                        </h2>
                        <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
                            {message}
                        </p>
                    </div>

                    {type === 'invalid_date' && (
                        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-left">
                            <p className="mb-2 text-xs font-medium text-zinc-500 uppercase">
                                Formato correto
                            </p>
                            <code className="text-sm text-blue-400">
                                /report/seu-id<span className="text-zinc-600">?</span>
                                ini=<span className="text-emerald-400">2026-01-01</span>
                                <span className="text-zinc-600">&</span>fim=
                                <span className="text-emerald-400">2026-02-18</span>
                            </code>
                        </div>
                    )}

                    {type === 'not_found' && (
                        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-left">
                            <p className="mb-2 text-xs font-medium text-zinc-500 uppercase">
                                Verifique
                            </p>
                            <ul className="space-y-1.5 text-sm text-zinc-400">
                                <li className="flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-zinc-600" />
                                    O ID público está correto na URL
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-zinc-600" />
                                    O relatório existe e está ativo
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-zinc-600" />O
                                    período selecionado possui dados
                                </li>
                            </ul>
                        </div>
                    )}

                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            className="mt-2 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Tentar novamente
                        </Button>
                    )}

                    <p className="text-xs text-zinc-600">
                        Powered by{' '}
                        <span className="font-medium text-blue-500/60">
                            Desafoga TDAH
                        </span>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

// ─── Main Report Page ────────────────────────────────────────────────────

export function ReportPage() {
    const { public_id } = useParams<{ public_id: string }>()
    const [searchParams, setSearchParams] = useSearchParams()

    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [errorType, setErrorType] = useState<ErrorType>('generic')

    const [phonePin, setPhonePin] = useState<string | null>(() => {
        if (!public_id) return null
        return getStoredPin(public_id)
    })
    const [isPinModalOpen, setIsPinModalOpen] = useState(() => !phonePin)

    const handlePinSubmit = useCallback((pin: string) => {
        setPhonePin(pin)
        setIsPinModalOpen(false)
    }, [])

    // Parse dates from URL query params
    const parsedDates = useMemo(
        () => parseDateParams(searchParams),
        [searchParams]
    )

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: parsedDates.from,
        to: parsedDates.to,
    })

    // Sync dateRange when URL params change
    useEffect(() => {
        if (!parsedDates.error) {
            setDateRange({ from: parsedDates.from, to: parsedDates.to })
        }
    }, [parsedDates])

    // When the user changes dates via the picker, update URL params
    const handleDateRangeChange = useCallback(
        (range: DateRange | undefined) => {
            setDateRange(range)

            if (range?.from && range?.to) {
                const params = new URLSearchParams(searchParams)
                params.set('ini', format(range.from, 'yyyy-MM-dd'))
                params.set('fim', format(range.to, 'yyyy-MM-dd'))
                setSearchParams(params, { replace: true })
            }
        },
        [searchParams, setSearchParams]
    )

    const fetchReport = useCallback(async () => {
        if (!public_id) return
        if (!phonePin) return

        // If parsed dates have an error, show invalid date screen
        if (parsedDates.error) {
            setError(parsedDates.error)
            setErrorType('invalid_date')
            setLoading(false)
            return
        }

        if (!dateRange?.from || !dateRange?.to) return

        setLoading(true)
        setError(null)

        try {
            const { data: result, error: rpcError } = await supabase.rpc(
                'get_user_performance_report',
                {
                    p_public_id: public_id,
                    p_start_date: format(dateRange.from, 'yyyy-MM-dd'),
                    p_end_date: format(dateRange.to, 'yyyy-MM-dd'),
                    p_phone_last_4: phonePin,
                }
            )

            if (rpcError) {
                throw rpcError
            }

            if (result && result.length > 0) {
                if (result[0].is_valid === false) {
                    clearPin(public_id)
                    setPhonePin(null)
                    setError('Os 4 últimos dígitos informados não conferem com o nosso cadastro.')
                    setErrorType('invalid_pin')
                    setData(null)
                } else {
                    savePin(public_id, phonePin)
                    setData(result[0])
                }
            } else {
                setData(null)
                setError(
                    'Não encontramos nenhum relatório vinculado a este ID. Certifique-se de que o link está correto e tente novamente.'
                )
                setErrorType('not_found')
            }
        } catch (err) {
            console.error('Erro ao buscar relatório:', err)
            setError(
                'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
            )
            setErrorType('generic')
        } finally {
            setLoading(false)
        }
    }, [public_id, dateRange, parsedDates.error, phonePin])

    useEffect(() => {
        fetchReport()
    }, [fetchReport])

    // ── Render States ────────────────────────────────────────────────────

    if (isPinModalOpen) {
        return (
            <div className="min-h-screen bg-[#09090b]">
                <ReportSkeleton />
                <PinModal isOpen={isPinModalOpen} onSubmit={handlePinSubmit} />
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b]">
                <ReportSkeleton />
            </div>
        )
    }

    if (error || !data) {
        return (
            <ErrorScreen
                type={errorType}
                message={error || 'Relatório não encontrado.'}
                onRetry={
                    errorType === 'invalid_pin'
                        ? () => {
                            setError(null)
                            setIsPinModalOpen(true)
                        }
                        : errorType !== 'invalid_date'
                            ? () => fetchReport()
                            : undefined
                }
            />
        )
    }

    const completionRate = parseFloat(data.completion_rate)

    return (
        <div className="min-h-screen bg-[#09090b]">
            {/* Subtle grid background */}
            <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

            <div className="relative mx-auto max-w-6xl space-y-8 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
                                Raio-X
                            </h1>
                            <Badge
                                variant="outline"
                                className="border-blue-500/30 bg-blue-500/10 text-xs text-blue-400"
                            >
                                Relatório Público
                            </Badge>
                        </div>
                        <p className="text-lg text-zinc-400">
                            <span className="text-blue-400">{data.user_name}</span>
                        </p>
                    </div>
                    <DateRangePicker
                        dateRange={dateRange}
                        onDateRangeChange={handleDateRangeChange}
                    />
                </header>

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <MetricCard
                        title="Concluídas"
                        value={data.tasks_completed}
                        icon={CheckCircle2}
                        accentColor="#22c55e"
                        subtitle={`de ${data.total_period_tasks} tarefas no período`}
                    />
                    <MetricCard
                        title="Pendentes"
                        value={data.tasks_pending}
                        icon={Clock}
                        accentColor="#f59e0b"
                        subtitle="aguardando conclusão"
                    />
                    <Card className="group relative overflow-hidden border-zinc-800 bg-zinc-900/80 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20">
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-blue-600 opacity-80 transition-opacity group-hover:opacity-100" />
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="space-y-2">
                                <p className="text-sm font-medium tracking-wide text-zinc-400 uppercase">
                                    Taxa de Eficiência
                                </p>
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm text-zinc-500">
                                        {data.tasks_completed}/{data.total_period_tasks} tarefas
                                    </span>
                                </div>
                            </div>
                            <EfficiencyCircle percentage={completionRate} />
                        </CardContent>
                    </Card>
                </div>

                {/* Chart + Dica (esquerda) | Histórias (direita) */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                    <div className="flex flex-col gap-4 lg:col-span-3">
                        <DailyChart dailyHistory={data.daily_history} />
                        <TipCard />
                    </div>
                    <div className="lg:col-span-2">
                        <StoryCard />
                    </div>
                </div>
                <footer className="pb-6 text-center">
                    <p className="text-xs text-zinc-600">
                        Powered by{' '}
                        <span className="font-medium text-blue-500/60">
                            Desafoga TDAH
                        </span>{' '}
                        · Dashboard de Performance
                    </p>
                </footer>
            </div>
        </div>
    )
}
