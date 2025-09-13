import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DropdownConfig, Event } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useCreateEvent } from '@/hooks/useApi';
import { usePermissions } from '@/hooks/usePermissions';

interface AddEventDialogProps {
  dropdownConfig: DropdownConfig;
  onAddEvent?: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddEventDialog({ dropdownConfig, onAddEvent, children }: AddEventDialogProps & { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const createEventMutation = useCreateEvent();
  const { canCreateEvents } = usePermissions();
  
  // Don't render anything if user doesn't have create events permission
  if (!canCreateEvents) {
    return null;
  }
  

  const [date, setDate] = useState<Date>();
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [observers, setObservers] = useState<string[]>([]);
  const [sngs, setSngs] = useState<string[]>([]);
  const [generators, setGenerators] = useState<string[]>([]);
  const [time, setTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double check permissions
    if (!canCreateEvents) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create events.",
        variant: "destructive",
      });
      return;
    }
    
    if (!date || !eventName || !eventType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Date, Event Name, Event Type).",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      title: eventName,
      event_date: format(date, 'yyyy-MM-dd'),
      event_time: time || '00:00',
      event_type: eventType,
      city: city || '',
      venue: venue || '',
      observers: observers,
      sngs: sngs,
      generators: generators,
    };

    try {
      await createEventMutation.mutateAsync(eventData);
      
      // Call the optional onAddEvent callback for local UI updates if needed
      if (onAddEvent) {
        onAddEvent(eventData);
      }
      
      // Reset form
      setDate(undefined);
      setEventName('');
      setEventType('');
      setCity('');
      setVenue('');
      setObservers([]);
      setSngs([]);
      setGenerators([]);
      setTime('');
      setOpen(false);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90 shadow-sm font-medium px-6 py-2.5 rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
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
            <Label htmlFor="city">City</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className=" transition-all">
                <SelectValue placeholder="Select city (optional)" />
              </SelectTrigger>
              <SelectContent>
                {dropdownConfig.cities.map((cityOption) => (
                  <SelectItem key={cityOption.id} value={cityOption.value}>
                    {cityOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Select value={venue} onValueChange={setVenue}>
              <SelectTrigger className=" transition-all">
                <SelectValue placeholder="Select venue (optional)" />
              </SelectTrigger>
              <SelectContent>
                {dropdownConfig.venues.map((venueOption) => (
                  <SelectItem key={venueOption.id} value={venueOption.value}>
                    {venueOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time (24H)</Label>
            <Input
              id="time"
              type="time"
              className=" transition-all"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="HH:MM"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observers">Ob</Label>
            <MultiSelect
              options={dropdownConfig.obs}
              selected={observers}
              onSelectionChange={setObservers}
              placeholder="Select ob (optional)"
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
          
          <div className="flex-shrink-0 border-t border-border pt-4 px-1">
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? "Adding..." : "Add Event"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}