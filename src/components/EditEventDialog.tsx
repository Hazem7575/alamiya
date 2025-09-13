import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DropdownConfig, Event } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useUpdateEvent } from '@/hooks/useApi';

interface EditEventDialogProps {
  event: Event | null;
  dropdownConfig: DropdownConfig;
  onUpdateEvent?: (updatedEvent: Event) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function EditEventDialog({ 
  event, 
  dropdownConfig, 
  onUpdateEvent,
  isOpen,
  onClose
}: EditEventDialogProps) {
  const [date, setDate] = useState<Date>();
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [observers, setObservers] = useState<string[]>([]);
  const [sngs, setSngs] = useState<string[]>([]);
  const [generators, setGenerators] = useState<string[]>([]);
  const [time, setTime] = useState('');
  
  // ✅ استخدام useUpdateEvent hook مباشرة
  const updateEventMutation = useUpdateEvent();

  // Reset form when event changes
  useEffect(() => {
    if (event && isOpen) {
      setDate(new Date(event.event_date || event.date));
      setEventName(event.title || event.event);
      // Handle eventType - could be object or string
      const eventTypeValue = typeof event.eventType === 'object' ? 
        event.eventType?.name : 
        (event.eventType || event.event_type);
      setEventType(String(eventTypeValue || ''));
      
      // Handle city - could be object or string
      const cityValue = typeof event.city === 'object' ? event.city?.name : event.city;
      setCity(cityValue);
      
      // Handle venue - could be object or string
      const venueValue = typeof event.venue === 'object' ? event.venue?.name : event.venue;
      setVenue(venueValue);
      
      // Handle arrays for many-to-many relationships
      
      // For observers - handle both API response format and frontend format
      let observerValues: string[] = [];
      if (event.observers && Array.isArray(event.observers)) {
        observerValues = event.observers.map((obs: any) => obs.code || obs.value || obs);
      } else if (event.observer?.code) {
        observerValues = [event.observer.code];
      } else if (event.ob && event.ob !== '-') {
        observerValues = [event.ob];
      }
      setObservers(observerValues);
      
      // For SNGs - handle both formats
      let sngValues: string[] = [];
      if (event.sngs && Array.isArray(event.sngs)) {
        sngValues = event.sngs.map((sng: any) => sng.code || sng.value || sng);
      } else if (event.sng && typeof event.sng === 'object' && 'code' in event.sng && event.sng.code) {
        sngValues = [event.sng.code];
      } else if (typeof event.sng === 'string' && event.sng !== '-' && event.sng !== '') {
        sngValues = [event.sng];
      }
      setSngs(sngValues);
      
      // For generators - handle both formats
      let generatorValues: string[] = [];
      if (event.generators && Array.isArray(event.generators)) {
        generatorValues = event.generators.map((gen: any) => gen.code || gen.value || gen);
      } else if (event.generator && typeof event.generator === 'object' && 'code' in event.generator && event.generator.code) {
        generatorValues = [event.generator.code];
      } else if (typeof event.generator === 'string' && event.generator !== '-' && event.generator !== '') {
        generatorValues = [event.generator];
      }
      setGenerators(generatorValues);
      
      setTime(event.event_time || event.time);
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !eventName || !eventType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Date, Event Name, Event Type).",
        variant: "destructive",
      });
      return;
    }

    if (!event) return;

    try {
      // تحويل الأسماء إلى IDs
      const eventTypeId = dropdownConfig.eventTypes.find(et => et.value === eventType)?.id;
      const cityId = dropdownConfig.cities.find(c => c.value === city)?.id;
      const venueId = dropdownConfig.venues.find(v => v.value === venue)?.id;
      
      // Get IDs for multiple relationships
      const observerIds = observers.map(obsCode => {
        const found = dropdownConfig.obs.find(o => o.value === obsCode);
        return found ? parseInt(found.id) : null;
      }).filter(id => id !== null);
      
      const sngIds = sngs.map(sngCode => {
        const found = dropdownConfig.sngs?.find(s => s.value === sngCode);
        return found ? parseInt(found.id) : null;
      }).filter(id => id !== null);
      
      const generatorIds = generators.map(genCode => {
        const found = dropdownConfig.generators?.find(g => g.value === genCode);
        return found ? parseInt(found.id) : null;
      }).filter(id => id !== null);

      const updateData = {
        id: parseInt(event.id),
        title: eventName,
        event_date: format(date, 'yyyy-MM-dd'),
        event_time: time,
        event_type_id: eventTypeId ? parseInt(eventTypeId) : undefined,
        city_id: cityId ? parseInt(cityId) : undefined,
        venue_id: venueId ? parseInt(venueId) : undefined,
        observer_ids: observerIds,
        sng_ids: sngIds,
        generator_ids: generatorIds
      };

      console.log('Sending update data:', updateData);
      
      await updateEventMutation.mutateAsync(updateData);

      // ✅ في حالة النجاح فقط - أغلق الـ dialog
      onClose();
      resetForm();
      
      // ✅ Optimistic update disabled temporarily to prevent double submission
      // if (onUpdateEvent) {
      //   const updatedEvent: Event = {
      //     ...event,
      //     date: format(date, 'yyyy-MM-dd'),
      //     event: eventName,
      //     eventType,
      //     city,
      //     venue,
      //     ob: observers.join(', '),
      //     sng: sngs.join(', '),
      //     generator: generators.join(', '),
      //     time,
      //     updatedAt: new Date().toISOString(),
      //   };
      //   onUpdateEvent(updatedEvent);
      // }

    } catch (error: any) {
      // ✅ الأخطاء يتم التعامل معها في useUpdateEvent hook
      console.error('Error updating event:', error);
    }
  };

  const resetForm = () => {
    setDate(undefined);
    setEventName('');
    setEventType('');
    setCity('');
    setVenue('');
    setObservers([]);
    setSngs([]);
    setGenerators([]);
    setTime('');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-1 py-2 max-h-[40vh] space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border !border-[rgb(var(--border))] transition-all",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[60]" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="rounded-md border bg-popover shadow-md"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event">Event Name *</Label>
              <Input
                id="event"
                className=" transition-all"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                className=" transition-all"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className=" transition-all">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownConfig.eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className=" transition-all">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownConfig.cities.map((cityItem) => (
                    <SelectItem key={cityItem.id} value={cityItem.value}>
                      {cityItem.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue *</Label>
              <Select value={venue} onValueChange={setVenue}>
                <SelectTrigger className=" transition-all">
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownConfig.venues.map((venueItem) => (
                    <SelectItem key={venueItem.id} value={venueItem.value}>
                      {venueItem.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observers">Observers</Label>
              <MultiSelect
                options={dropdownConfig.obs}
                selected={observers}
                onSelectionChange={setObservers}
                placeholder="Select observers (optional)"
                className="transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sngs">SNG</Label>
              <MultiSelect
                options={dropdownConfig.sngs || []}
                selected={sngs}
                onSelectionChange={setSngs}
                placeholder="Select SNGs (optional)"
                className="transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="generators">Generators</Label>
              <MultiSelect
                options={dropdownConfig.generators || []}
                selected={generators}
                onSelectionChange={setGenerators}
                placeholder="Select generators (optional)"
                className="transition-all"
              />
            </div>
          </div>
          
          <div className="flex-shrink-0 flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-2 border-muted-foreground/20 hover:border-primary/50"
              disabled={updateEventMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 shadow-sm font-medium"
              disabled={updateEventMutation.isPending}
            >
              {updateEventMutation.isPending ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
