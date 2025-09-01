import { Event } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedObs, setSelectedObs] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSngs, setSelectedSngs] = useState<string[]>([]);
  const [obSearchTerm, setObSearchTerm] = useState('');
  const [eventTypeSearchTerm, setEventTypeSearchTerm] = useState('');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [sngSearchTerm, setSngSearchTerm] = useState('');

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

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventType = selectedEventTypes.length === 0 || selectedEventTypes.includes(event.eventType);
    const matchesOb = selectedObs.length === 0 || selectedObs.includes(event.ob);
    const matchesCity = selectedCities.length === 0 || selectedCities.includes(event.city);
    const matchesSng = selectedSngs.length === 0 || selectedSngs.includes(event.sng);
    
    return matchesSearch && matchesEventType && matchesOb && matchesCity && matchesSng;
  });

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = filteredEvents.filter(event => event.date === dateStr);
    return dayEvents;
  };

  const formatWeekRange = () => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
  };

  // Get unique values for filters
  const uniqueEventTypes = [...new Set(events.map(e => e.eventType))];
  const uniqueObs = [...new Set(events.map(e => e.ob))];
  const uniqueCities = [...new Set(events.map(e => e.city))];
  const uniqueSngs = [...new Set(events.map(e => e.sng))];

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
  const filteredSngs = uniqueSngs.filter(sng => 
    sng.toLowerCase().includes(sngSearchTerm.toLowerCase())
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

  const handleSngChange = (sng: string, checked: boolean) => {
    if (checked) {
      setSelectedSngs([...selectedSngs, sng]);
    } else {
      setSelectedSngs(selectedSngs.filter(s => s !== sng));
    }
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

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Input
                placeholder="Search events, cities, venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Filters - Mobile horizontal scroll container */}
            <div className="overflow-x-auto">
              <div className="flex gap-2 flex-wrap min-w-max">
              {/* Event Type Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                    <Filter className="h-4 w-4 mr-2" />
                    Event Type
                    {selectedEventTypes.length > 0 && (
                      <span className="ml-1 bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-xs">
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
                        <p className="text-sm text-gray-500 text-center py-2">No event types found</p>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* OB Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                    <Filter className="h-4 w-4 mr-2" />
                    OB
                    {selectedObs.length > 0 && (
                      <span className="ml-1 bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-xs">
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
                        <p className="text-sm text-gray-500 text-center py-2">No OBs found</p>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* City Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                    <Filter className="h-4 w-4 mr-2" />
                    City
                    {selectedCities.length > 0 && (
                      <span className="ml-1 bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-xs">
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
                        <p className="text-sm text-gray-500 text-center py-2">No cities found</p>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* SNG Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                    <Filter className="h-4 w-4 mr-2" />
                    SNG
                    {selectedSngs.length > 0 && (
                      <span className="ml-1 bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                        {selectedSngs.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0">
                  <div className="p-3 space-y-3">
                    <Input
                      placeholder="Search SNGs..."
                      value={sngSearchTerm}
                      onChange={(e) => setSngSearchTerm(e.target.value)}
                      className="h-8"
                    />
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {filteredSngs.map((sng) => (
                        <div key={sng} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sng-${sng}`}
                            checked={selectedSngs.includes(sng)}
                            onCheckedChange={(checked) => handleSngChange(sng, !!checked)}
                          />
                          <Label htmlFor={`sng-${sng}`} className="text-sm">{sng}</Label>
                        </div>
                      ))}
                      {filteredSngs.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">No SNGs found</p>
                      )}
                    </div>
                  </div>
                              </PopoverContent>
            </Popover>
              </div>
            </div>
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
                        className={`text-xs p-0 md:p-1 rounded-lg ${eventColors.bg} border ${eventColors.border} shadow-sm cursor-pointer hover:shadow-md hover:border-opacity-80 transition-all duration-200 group`}
                        onClick={() => {
                          setSelectedEvent(event);
                          setPopupOpen(true);
                        }}
                      >

                        <div className={`text-xs font-semibold ${eventColors.text} mb-1 truncate leading-tight text-left`}>
                          {event.event}
                        </div>
                        <div className="text-xs text-gray-600 truncate leading-tight text-left">
                          {event.city} {event.time}
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