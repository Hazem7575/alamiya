"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIconSolid } from "lucide-react";
import {
  addDays,
  addMonths,
  subMonths,
  addYears,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  onDateSelect?: (range: DateRange | undefined) => void;
  className?: string;
  initialValue?: DateRange;
}

const presetRanges = [
  {
    label: "Last 7 days",
    value: "last7days",
    icon: CalendarIcon,
    getRange: () => {
      const today = new Date();
      return { from: addDays(today, -6), to: today };
    }
  },
  {
    label: "Last 30 days",
    value: "last30days",
    icon: CalendarIconSolid,
    getRange: () => {
      const today = new Date();
      return { from: addDays(today, -29), to: today };
    }
  },
  {
    label: "This month",
    value: "thisMonth",
    icon: CalendarIcon,
    getRange: () => {
      const today = new Date();
      return { from: startOfMonth(today), to: endOfMonth(today) };
    }
  },
  {
    label: "Today",
    value: "today",
    icon: Clock,
    getRange: () => {
      const today = new Date();
      return { from: today, to: today };
    }
  },
  {
    label: "Tomorrow", 
    value: "tomorrow",
    icon: Clock,
    getRange: () => {
      const tomorrow = addDays(new Date(), 1);
      return { from: tomorrow, to: tomorrow };
    }
  },
  {
    label: "Next 7 days",
    value: "next7days", 
    icon: CalendarIcon,
    getRange: () => {
      const today = new Date();
      return { from: today, to: addDays(today, 6) };
    }
  },
  {
    label: "Next 30 days",
    value: "next30days",
    icon: CalendarIconSolid,
    getRange: () => {
      const today = new Date();
      return { from: today, to: addDays(today, 29) };
    }
  },
  {
    label: "Next month",
    value: "nextMonth",
    icon: CalendarIcon,
    getRange: () => {
      const today = new Date();
      const nextMonth = addMonths(today, 1);
      return { from: startOfMonth(nextMonth), to: endOfMonth(nextMonth) };
    }
  }
];

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ModernDateRangePicker({ onDateSelect, className, initialValue }: DateRangePickerProps) {
  const today = new Date();
  const defaultRange = initialValue || { from: startOfMonth(today), to: endOfMonth(today) };
  
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(defaultRange);
  const [currentMonth, setCurrentMonth] = useState(defaultRange?.from || today);
  const [activePreset, setActivePreset] = useState<string | null>("thisMonth");
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    const range = preset.getRange();
    setSelectedRange(range);
    setCurrentMonth(range.from || today);
    setActivePreset(preset.value);
    setIsSelectingEnd(false);
    onDateSelect?.(range);
  };

  const handleDateClick = (date: Date) => {
    if (!selectedRange?.from || isSelectingEnd) {
      // Starting selection or completing range
      if (!selectedRange?.from) {
        setSelectedRange({ from: date, to: undefined });
        setIsSelectingEnd(true);
      } else {
        const newRange = {
          from: selectedRange.from,
          to: isBefore(date, selectedRange.from) ? selectedRange.from : date
        };
        if (isBefore(date, selectedRange.from)) {
          newRange.from = date;
          newRange.to = selectedRange.from;
        }
        setSelectedRange(newRange);
        setIsSelectingEnd(false);
        onDateSelect?.(newRange);
      }
    } else {
      // Starting new selection
      setSelectedRange({ from: date, to: undefined });
      setIsSelectingEnd(true);
    }
    setActivePreset(null);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return "Select date range";
    if (!range.to || isSameDay(range.from, range.to)) {
      return format(range.from, "MMM dd, yyyy");
    }
    return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd, yyyy")}`;
  };

  const getDayStatus = (date: Date) => {
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isTodayDate = isToday(date);
    const isSelected = selectedRange?.from && isSameDay(date, selectedRange.from) || 
                     selectedRange?.to && isSameDay(date, selectedRange.to);
    const isInRange = selectedRange?.from && selectedRange?.to && 
                     isWithinInterval(date, { start: selectedRange.from, end: selectedRange.to });
    const isRangeStart = selectedRange?.from && isSameDay(date, selectedRange.from);
    const isRangeEnd = selectedRange?.to && isSameDay(date, selectedRange.to);

    return {
      isCurrentMonth,
      isTodayDate,
      isSelected,
      isInRange,
      isRangeStart,
      isRangeEnd
    };
  };

  return (
    <div className={cn("flex rounded-xl border bg-card shadow-lg overflow-hidden", className)}>
      {/* Presets Panel */}
      <div className="w-56 bg-gradient-to-b from-muted/50 to-muted/80 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-md bg-primary/10">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-xs">Quick Select</h3>
          </div>
        </div>
        
        <div className="space-y-1">
          {presetRanges.map((preset) => {
            const Icon = preset.icon;
            const isActive = activePreset === preset.value;
            
            return (
              <Button
                key={preset.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start h-auto p-2 transition-all duration-200",
                  "hover:bg-background/80 hover:scale-[1.01] hover:shadow-sm",
                  isActive && "bg-primary/15 text-primary border border-primary/30 shadow-sm"
                )}
                onClick={() => handlePresetSelect(preset)}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <div className="font-medium text-xs">{preset.label}</div>
                </div>
              </Button>
            );
          })}
        </div>
        
        <Separator className="my-4" />
        
        {selectedRange?.from && (
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground">Selected Range</p>
            <div className="p-2 rounded-md bg-background/60 border">
              <Badge variant="secondary" className="w-full justify-center py-1 text-[10px]">
                {formatDateRange(selectedRange)}
              </Badge>
              {selectedRange.from && selectedRange.to && (
                <p className="text-[10px] text-muted-foreground mt-1 text-center">
                  {Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                </p>
              )}
            </div>
          </div>
        )}

        {isSelectingEnd && (
          <div className="mt-3 p-2 rounded-md bg-blue-50 border border-blue-200">
            <p className="text-[10px] text-blue-800 text-center">
              🎯 Click another date to complete
            </p>
          </div>
        )}
      </div>

      {/* Calendar Panel */}
      <div className="flex-1 p-4 bg-background">
        <div className="mb-4">
          <h3 className="font-medium text-sm mb-0.5">Custom Date Selection</h3>
          <p className="text-xs text-muted-foreground">
            Click on dates to select your range
          </p>
        </div>

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMonthChange('prev')}
            className="h-7 w-7 p-0 hover:bg-accent"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          <div className="text-center">
            <h4 className="text-sm font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h4>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMonthChange('next')}
            className="h-7 w-7 p-0 hover:bg-accent"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((day) => (
              <div key={day} className="h-6 flex items-center justify-center">
                <span className="text-[10px] font-medium text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const status = getDayStatus(date);
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "h-8 w-8 rounded-md text-xs font-medium transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                    // Base styles
                    status.isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground/40",
                    // Today
                    status.isTodayDate && "bg-accent/50 font-semibold ring-1 ring-primary/30",
                    // Range start
                    status.isRangeStart && "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/50",
                    // Range end
                    status.isRangeEnd && !status.isRangeStart && "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/50",
                    // In range
                    status.isInRange && !status.isRangeStart && !status.isRangeEnd && "bg-primary/20 text-primary font-medium",
                  )}
                >
                  {format(date, "d")}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t">
          <p className="text-[10px] text-muted-foreground text-center">
            💡 Tip: Click a date to start, then click another to complete your range
          </p>
        </div>
      </div>
    </div>
  );
}
