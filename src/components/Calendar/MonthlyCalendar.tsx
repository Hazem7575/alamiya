import { Event } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { EventPopup } from '@/components/EventPopup';
import { useState } from 'react';
import { format } from 'date-fns';
import { getEventTypeBadgeVariant } from '@/lib/utils';

interface MonthlyCalendarProps {
  events: Event[];
  eventTypes?: any[];
}



export function MonthlyCalendar({ events, eventTypes = [] }: MonthlyCalendarProps) {

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedObs, setSelectedObs] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [obSearchTerm, setObSearchTerm] = useState('');
  const [eventTypeSearchTerm, setEventTypeSearchTerm] = useState('');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventType = selectedEventTypes.length === 0 || selectedEventTypes.includes(event.eventType);
    const matchesOb = selectedObs.length === 0 || selectedObs.includes(event.ob);
    const matchesCity = selectedCities.length === 0 || selectedCities.includes(event.city);
    
    return matchesSearch && matchesEventType && matchesOb && matchesCity;
  });

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = filteredEvents.filter(event => event.date === dateStr);
    

    
    return dayEvents;
  };

  // Get unique values for filters
  const uniqueEventTypes = [...new Set(events.map(e => e.eventType))];
  const uniqueObs = [...new Set(events.map(e => e.ob))];
  const uniqueCities = [...new Set(events.map(e => e.city))];

  // Filter options based on search
  const filteredEventTypes = uniqueEventTypes.filter(type => 
    type.toLowerCase().includes(eventTypeSearchTerm.toLowerCase())
  );
  const filteredObs = uniqueObs.filter(ob => 
    ob.toLowerCase().includes(obSearchTerm.toLowerCase())
  );
  const filteredCities = uniqueCities.filter(city => 
    city.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  const handleEventTypeChange = (eventType: string, checked: boolean) => {
    if (checked) {
      setSelectedEventTypes([...selectedEventTypes, eventType]);
    } else {
      setSelectedEventTypes(selectedEventTypes.filter(t => t !== eventType));
    }
  };

  const handleObChange = (ob: string, checked: boolean) => {
    if (checked) {
      setSelectedObs([...selectedObs, ob]);
    } else {
      setSelectedObs(selectedObs.filter(o => o !== ob));
    }
  };

  const handleCityChange = (city: string, checked: boolean) => {
    if (checked) {
      setSelectedCities([...selectedCities, city]);
    } else {
      setSelectedCities(selectedCities.filter(c => c !== city));
    }
  };

  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 min-h-[120px]"></div>);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(day);
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    
    days.push(
      <div
        key={day}
        className={`p-2 min-h-[120px] border border-b border-border last:border-b-0 ${
          isToday ? 'bg-accent/20' : 'hover:bg-muted/50'
        } transition-colors`}
      >
        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
          {day}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="text-xs p-1 rounded bg-card border border-border truncate cursor-pointer hover:bg-accent/50 transition-colors animate-fade-in"
              title={`${event.event} - ${event.city}`}
              onClick={() => {
                setSelectedEvent(event);
                setPopupOpen(true);
              }}
            >
              {(() => {
                const eventTypeData = eventTypes.find(t => t.name === event.eventType);
                return (
                  <Badge variant={getEventTypeBadgeVariant(event.eventType, eventTypeData)} className="text-xs mr-1">
                    {event.eventType}
                  </Badge>
                );
              })()}
              <span className="text-foreground">{event.event}</span>
            </div>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-none border-[1px]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative min-w-64">
            <Input
              placeholder="Search events, cities, venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Event Type Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Event Type
                {selectedEventTypes.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                    {selectedEventTypes.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <div className="p-3 space-y-3">
                <Input
                  placeholder="Search event types..."
                  value={eventTypeSearchTerm}
                  onChange={(e) => setEventTypeSearchTerm(e.target.value)}
                  className="h-8"
                />
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredEventTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedEventTypes.includes(type)}
                        onCheckedChange={(checked) => handleEventTypeChange(type, !!checked)}
                      />
                      <Label htmlFor={`type-${type}`} className="text-sm">{type}</Label>
                    </div>
                  ))}
                  {filteredEventTypes.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No event types found</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* OB Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                OB
                {selectedObs.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                    {selectedObs.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <div className="p-3 space-y-3">
                <Input
                  placeholder="Search OB..."
                  value={obSearchTerm}
                  onChange={(e) => setObSearchTerm(e.target.value)}
                  className="h-8"
                />
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredObs.map((ob) => (
                    <div key={ob} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ob-${ob}`}
                        checked={selectedObs.includes(ob)}
                        onCheckedChange={(checked) => handleObChange(ob, !!checked)}
                      />
                      <Label htmlFor={`ob-${ob}`} className="text-sm">{ob}</Label>
                    </div>
                  ))}
                  {filteredObs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No OBs found</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* City Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                City
                {selectedCities.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                    {selectedCities.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <div className="p-3 space-y-3">
                <Input
                  placeholder="Search cities..."
                  value={citySearchTerm}
                  onChange={(e) => setCitySearchTerm(e.target.value)}
                  className="h-8"
                />
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredCities.map((city) => (
                    <div key={city} className="flex items-center space-x-2">
                      <Checkbox
                        id={`city-${city}`}
                        checked={selectedCities.includes(city)}
                        onCheckedChange={(checked) => handleCityChange(city, !!checked)}
                      />
                      <Label htmlFor={`city-${city}`} className="text-sm">{city}</Label>
                    </div>
                  ))}
                  {filteredCities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No cities found</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
          {/* Header row */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
            <div key={dayName} className="p-3 text-center font-semibold bg-muted text-muted-foreground border-b border-border last:border-b-0 ">
              {dayName}
            </div>
          ))}
          {/* Calendar days */}
          {days}
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