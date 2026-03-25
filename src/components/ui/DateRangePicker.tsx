'use client';

import { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';

export type DateRange = { from: Date | undefined; to?: Date | undefined };
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DateRangePicker({
  value,
  onChange,
  placeholder = 'Filter by date',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const label =
    value?.from && value?.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : value?.from
        ? `From ${formatDate(value.from)}`
        : placeholder;

  const hasValue = !!value?.from;

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-10 text-sm font-normal"
          >
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <span className={hasValue ? 'text-gray-900' : 'text-gray-400'}>
              {label}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={(range) => {
              onChange(range);
              if (
                range?.from &&
                range?.to &&
                range.from.getTime() !== range.to.getTime()
              ) {
                setOpen(false);
              }
            }}
            disabled={{ after: new Date() }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {hasValue && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange(undefined)}
        >
          <X className="h-4 w-4 text-gray-400" />
        </Button>
      )}
    </div>
  );
}
