import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [ob, setOb] = useState('');
  const [sng, setSng] = useState('');
  const [time, setTime] = useState('');
  
  // ✅ استخدام useUpdateEvent hook مباشرة
  const updateEventMutation = useUpdateEvent();

  // Reset form when event changes
  useEffect(() => {
    if (event && isOpen) {
      console.log('Event data in EditEventDialog:', event);
      console.log('Event SNG:', event.sng);
      setDate(new Date(event.date));
      setEventName(event.event);
      setEventType(event.eventType);
      setCity(event.city);
      setVenue(event.venue);
      setOb(event.ob);
      setSng(event.sng || '');
      setTime(event.time);
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !eventName || !eventType || !city || !venue || !ob || !time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!event) return;

    try {
      // ✅ استخدام React Query mutation مباشرة - تحويل الأسماء إلى IDs
      const eventTypeId = dropdownConfig.eventTypes.find(et => et.value === eventType)?.id;
      const cityId = dropdownConfig.cities.find(c => c.value === city)?.id;
      const venueId = dropdownConfig.venues.find(v => v.value === venue)?.id;
      const observerId = dropdownConfig.obs.find(o => o.value === ob)?.id;
      const sngId = dropdownConfig.sngs?.find(s => s.value === sng)?.id;

      console.log('Dropdown config SNGs:', dropdownConfig.sngs);
      console.log('SNG value in form:', sng);
      console.log('SNG ID found:', sngId);

      const updateData = {
        id: parseInt(event.id),
        title: eventName,
        event_date: format(date, 'yyyy-MM-dd'),
        event_time: time,
        event_type_id: eventTypeId ? parseInt(eventTypeId) : undefined,
        city_id: cityId ? parseInt(cityId) : undefined,
        venue_id: venueId ? parseInt(venueId) : undefined,
        observer_id: observerId ? parseInt(observerId) : undefined,
        sng_id: sngId ? parseInt(sngId) : null
      };

      console.log('Sending update data:', updateData);
      console.log('SNG value:', sng);
      console.log('SNG ID:', sngId);

      await updateEventMutation.mutateAsync(updateData);

      // ✅ في حالة النجاح فقط - أغلق الـ dialog
      onClose();
      resetForm();
      
      // ✅ استدعي onUpdateEvent للـ optimistic update في الجدول إذا كان موجود
      if (onUpdateEvent) {
        const updatedEvent: Event = {
          ...event,
          date: format(date, 'yyyy-MM-dd'),
          event: eventName,
          eventType,
          city,
          venue,
          ob,
          sng,
          time,
          updatedAt: new Date().toISOString(),
        };
        onUpdateEvent(updatedEvent);
      }

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
    setOb('');
    setSng('');
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
              <Label htmlFor="ob">Observer *</Label>
              <Select value={ob} onValueChange={setOb}>
                <SelectTrigger className=" transition-all">
                  <SelectValue placeholder="Select observer" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownConfig.obs.map((observer) => (
                    <SelectItem key={observer.id} value={observer.value}>
                      {observer.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sng">SNG</Label>
              <Select value={sng} onValueChange={setSng}>
                <SelectTrigger className=" transition-all">
                  <SelectValue placeholder="Select SNG" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownConfig.sngs?.map((sngOption) => (
                    <SelectItem key={sngOption.id} value={sngOption.value}>
                      {sngOption.label}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
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
