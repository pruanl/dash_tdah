import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import type { DateRange } from 'react-day-picker'

interface DateRangePickerProps {
    dateRange: DateRange | undefined
    onDateRangeChange: (range: DateRange | undefined) => void
}

export function DateRangePicker({
    dateRange,
    onDateRangeChange,
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="h-10 justify-start gap-2 border-zinc-700 bg-zinc-800/50 px-4 text-left font-normal text-zinc-300 hover:bg-zinc-700/50 hover:text-zinc-100"
                >
                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                    {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                                {format(dateRange.from, 'dd MMM', { locale: ptBR })} –{' '}
                                {format(dateRange.to, 'dd MMM yyyy', { locale: ptBR })}
                            </>
                        ) : (
                            format(dateRange.from, 'dd MMM yyyy', { locale: ptBR })
                        )
                    ) : (
                        <span className="text-zinc-500">Selecione o período</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto border-zinc-700 bg-zinc-900 p-0"
                align="end"
            >
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                        onDateRangeChange(range)
                        if (range?.from && range?.to) {
                            setOpen(false)
                        }
                    }}
                    numberOfMonths={2}
                    locale={ptBR}
                />
            </PopoverContent>
        </Popover>
    )
}
