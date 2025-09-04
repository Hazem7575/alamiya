import { Event } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Filter, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { EventPopup } from '@/components/EventPopup';
import { useState } from 'react';
import { format } from 'date-fns';
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
  const [selectedSngs, setSelectedSngs] = useState<string[]>([]);
  const [obSearchTerm, setObSearchTerm] = useState('');
  const [eventTypeSearchTerm, setEventTypeSearchTerm] = useState('');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [sngSearchTerm, setSngSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

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
    const matchesSng = selectedSngs.length === 0 || selectedSngs.includes(event.sng);

    return matchesSearch && matchesEventType && matchesOb && matchesCity && matchesSng;
  });

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = filteredEvents.filter(event => event.date === dateStr);
    return dayEvents;
  };

  const toggleDayExpansion = (dayKey: string) => {
    const newExpandedDays = new Set(expandedDays);
    if (newExpandedDays.has(dayKey)) {
      newExpandedDays.delete(dayKey);
    } else {
      newExpandedDays.add(dayKey);
    }
    setExpandedDays(newExpandedDays);
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

  const days = [];

  // Add cells for days from previous month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    const dayNumber = lastDayOfPrevMonth - firstDayOfWeek + i + 1;

    days.push(
        <div key={`prev-${i}`} className="p-0.5 md:p-1 min-h-[60px] md:min-h-[100px] bg-gray-50/30 border-r border-b border-gray-200 relative overflow-hidden">
          {/* Diagonal lines pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              #d1d5db 2px,
              #d1d5db 4px
            )`
            }}></div>
          </div>
          <div className="text-xs md:text-sm font-medium text-gray-400 relative z-10">
            {dayNumber}
          </div>
        </div>
    );
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(day);
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;
    const dayKey = `${year}-${month}-${day}`;
    const isDayExpanded = expandedDays.has(dayKey);

    days.push(
        <div
            key={day}
            className={`p-0.5 md:p-1 ${isDayExpanded ? 'min-h-auto' : 'min-h-[60px] md:min-h-[100px]'} border-r border-b border-gray-200 relative ${
                isToday
                    ? 'bg-blue-50 border-blue-300'
                    : isWeekend
                        ? 'bg-gray-50/50'
                        : 'bg-white hover:bg-gray-50'
            } transition-all duration-200`}
        >
          {/* Date number */}
          <div className={`text-xs md:text-sm font-medium mb-1 ${
              isToday
                  ? 'text-blue-600 font-bold'
                  : isWeekend
                      ? 'text-gray-500'
                      : 'text-gray-700'
          }`}>
            {day}
          </div>

          {/* Events */}
          <div className="space-y-0.5">
            {(isDayExpanded ? dayEvents : dayEvents.slice(0, 2)).map((event) => {
              const eventColors = getEventTypeColor(event.eventType, eventTypes);
              return (
                  <div
                      key={event.id}
                      className={`text-xs p-0 md:p-1 rounded-md ${eventColors.bg} border ${eventColors.border} shadow-sm cursor-pointer hover:shadow-md hover:border-opacity-80 transition-all duration-200 group`}
                      title={`${event.event} - ${event.city}`}
                      onClick={() => {
                        setSelectedEvent(event);
                        setPopupOpen(true);
                      }}
                  >
                    <div className="flex items-center gap-1">
                  <span className={`${eventColors.text} font-medium truncate group-hover:opacity-80 text-left`}>
                    {event.event}
                  </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5 truncate text-left">
                      {event.city}  {event.time}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5 truncate text-left">
                      {event.ob} • {event.sng}
                    </div>
                  </div>
              );
            })}
            {dayEvents.length > 2 && !isDayExpanded && (
                <div
                    className="text-xs text-gray-500 bg-gray-100 rounded px-1 py-0.5 text-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDayExpansion(dayKey);
                    }}
                >
                  +{dayEvents.length - 2} more
                </div>
            )}
            {isDayExpanded && dayEvents.length > 2 && (
                <div

                    className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-1 py-0.5 text-center cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDayExpansion(dayKey);
                    }}
                >
                  Show less
                </div>
            )}
          </div>
        </div>
    );
  }

  // Add cells for days from next month to complete the grid
  const totalCells = 42; // 6 rows × 7 days
  const remainingCells = totalCells - days.length;

  for (let i = 0; i < remainingCells; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dayNumber = i + 1;

    days.push(
        <div key={`next-${i}`} className="p-0.5 md:p-1 min-h-[60px] md:min-h-[100px] bg-gray-50/30 border-r border-b border-gray-200 relative overflow-hidden">
          {/* Diagonal lines pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              #d1d5db 2px,
              #d1d5db 4px
            )`
            }}></div>
          </div>
          <div className="text-xs md:text-sm font-medium text-gray-400 relative z-10">
            {dayNumber}
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          {/* Mobile horizontal scroll container */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px] md:min-w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h1>
                    <p className="text-sm text-gray-500">Calendar View</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={prevMonth}
                      className="border-gray-300 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={nextMonth}
                      className="border-gray-300 hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <Input
                      placeholder="Search events"
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
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Mobile horizontal scroll container */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px] md:min-w-full">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
                    <div key={dayName} className="p-3 text-center font-semibold text-gray-600 text-sm">
                      {dayName}
                    </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {days}
              </div>
            </div>
          </div>
        </div>

        <EventPopup
            event={selectedEvent}
            open={popupOpen}
            onOpenChange={setPopupOpen}
            eventTypes={eventTypes}
        />
      </div>
  );
}