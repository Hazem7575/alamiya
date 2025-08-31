import { Event } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventPopup } from '@/components/EventPopup';
import { useState } from 'react';
import { getEventTypeBadgeVariant } from '@/lib/utils';

// Function to get event type color
const getEventTypeColor = (eventType: string, eventTypes: any[]) => {
  const eventTypeData = eventTypes.find(t => t.name === eventType);
  const colorVariant = getEventTypeBadgeVariant(eventType, eventTypeData);
  
  // Map color variants to actual CSS colors
  const colorMap: { [key: string]: { bg: string; border: string; text: string } } = {
    light_blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    light_green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    light_red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    light_purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    light_pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
    light_orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    light_yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    light_teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
    light_indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
    light_cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
    light_emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    light_violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
    light_rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
    light_amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    light_slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' }
  };
  
  return colorMap[colorVariant] || colorMap.light_blue;
};

interface WeeklyCalendarProps {
  events: Event[];
  eventTypes?: any[];
}

export function WeeklyCalendar({ events, eventTypes = [] }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return start;
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const prevWeek = () => {
    const prev = new Date(currentWeek);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeek(prev);
  };

  const nextWeek = () => {
    const next = new Date(currentWeek);
    next.setDate(next.getDate() + 7);
    setCurrentWeek(next);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = events.filter(event => event.date === dateStr);
    return dayEvents;
  };

  const formatWeekRange = () => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                  Week View
                </h1>
                <p className="text-xs md:text-sm text-gray-500 hidden md:block">{formatWeekRange()}</p>
              </div>
            </div>
            <div className="flex gap-1 md:gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevWeek}
                className="h-8 w-8 md:h-9 md:w-9 p-0 border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={nextWeek}
                className="h-8 w-8 md:h-9 md:w-9 p-0 border-gray-300 hover:bg-gray-50"
              >
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
          
          {/* Mobile Date Range */}
          <div className="md:hidden text-center">
            <p className="text-sm font-medium text-gray-700">{formatWeekRange()}</p>
          </div>
        </div>
      </div>

      {/* Weekly Calendar Grid - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile horizontal scroll container */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px] md:min-w-full">
        {/* Header row - Mobile Optimized */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekDays.map((day, index) => {
            const isToday = new Date().toDateString() === day.toDateString();
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = day.getDate();
            
            return (
              <div key={index} className="p-2 md:p-3 text-center">
                <div className={`text-xs md:text-sm font-medium ${
                  isToday ? 'text-blue-600 font-bold' : 'text-gray-600'
                }`}>
                  {dayName}
                </div>
                <div className={`text-sm md:text-lg font-bold mt-1 ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {dayNumber}
                </div>
              </div>
            );
          })}
        </div>

        {/* Days content - Mobile Optimized */}
        <div className="grid grid-cols-7 min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = new Date().toDateString() === day.toDateString();
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <div
                key={index}
                className={`p-0.5 md:p-2 border-r border-gray-200 last:border-r-0 ${
                  isToday 
                    ? 'bg-blue-50 border-blue-300' 
                    : isWeekend 
                      ? 'bg-gray-50/50' 
                      : 'bg-white'
                } transition-all duration-200`}
              >
                <div className="space-y-1 md:space-y-2">
                  {dayEvents.slice(0, 3).map((event) => {
                    const eventColors = getEventTypeColor(event.eventType, eventTypes);
                    return (
                      <div
                        key={event.id}
                        className={`p-0.5 md:p-2 rounded-lg ${eventColors.bg} border ${eventColors.border} shadow-sm cursor-pointer hover:shadow-md hover:border-opacity-80 transition-all duration-200 group`}
                        onClick={() => {
                          setSelectedEvent(event);
                          setPopupOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span className={`text-xs font-medium ${eventColors.text} group-hover:opacity-80 truncate text-left`}>
                            {event.time}
                          </span>
                        </div>
                        <div className={`text-xs font-semibold ${eventColors.text} mb-1 truncate leading-tight text-left`}>
                          {event.event}
                        </div>
                        <div className="text-xs text-gray-600 truncate leading-tight text-left">
                          {event.city}
                        </div>

                        <div className="text-xs text-gray-500 mt-1 truncate leading-tight text-left">
                          {event.ob} • {event.sng}
                        </div>

                      </div>
                    );
                  })}
                  
                  {dayEvents.length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-2 md:py-4">
                      No events
                    </div>
                  )}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 bg-gray-100 rounded px-1 py-0.5 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
          </div>
        </div>
      </div>
      
      <EventPopup 
        event={selectedEvent}
        open={popupOpen}
        onOpenChange={setPopupOpen}
      />
    </div>
  );
}