import { Event } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventPopup } from '@/components/EventPopup';
import { useState } from 'react';
import { getEventTypeBadgeVariant } from '@/lib/utils';

interface WeeklyCalendarProps {
  events: Event[];
  eventTypes?: any[];
}



export function WeeklyCalendar({ events, eventTypes = [] }: WeeklyCalendarProps) {
  console.log('WeeklyCalendar received events:', events.length);
  console.log('Sample events with dates:', events.slice(0, 3).map(e => ({ title: e.event, date: e.date })));
  
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
    
    // Debug logging
    console.log(`Looking for events on ${dateStr}:`, dayEvents.length);
    if (dayEvents.length === 0 && events.length > 0) {
      console.log('Available event dates:', events.slice(0, 5).map(e => e.date));
      console.log('Current calendar date format:', dateStr);
    }
    
    return dayEvents;
  };

  const formatWeekRange = () => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
  };

  return (
    <Card className="shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Week of {formatWeekRange()}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = new Date().toDateString() === day.toDateString();
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = day.getDate();

            return (
              <div
                key={index}
                className={`min-h-[300px] border-r border-border last:border-r-0 ${
                  isToday ? 'bg-accent/20' : 'hover:bg-muted/50'
                } transition-colors`}
              >
                <div className={`p-3 text-center border-b border-border ${
                  isToday ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <div className="text-sm font-medium">{dayName}</div>
                  <div className="text-lg font-bold">{dayNumber}</div>
                </div>
                <div className="p-2 space-y-2">
                  {dayEvents.map((event) => (
                     <div
                       key={event.id}
                       className="p-2 rounded bg-card border border-border shadow-sm cursor-pointer hover:bg-accent/50 transition-colors animate-fade-in"
                       onClick={() => {
                         setSelectedEvent(event);
                         setPopupOpen(true);
                       }}
                     >
                       {(() => {
                         const eventTypeData = eventTypes.find(t => t.name === event.eventType);
                         return (
                           <Badge variant={getEventTypeBadgeVariant(event.eventType, eventTypeData)} className="text-xs mb-1">
                             {event.eventType}
                           </Badge>
                         );
                       })()}
                       <div className="text-sm font-medium text-foreground mb-1">
                         {event.event}
                       </div>
                       <div className="text-xs text-muted-foreground">
                         {event.city} • {event.venue}
                       </div>
                     </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <EventPopup 
        event={selectedEvent}
        open={popupOpen}
        onOpenChange={setPopupOpen}
      />
    </Card>
  );
}