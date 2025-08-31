import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Building2, User, Clock, X, Video } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/types';
import { getEventTypeBadgeVariant } from '@/lib/utils';

interface EventPopupProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventPopup({ event, open, onOpenChange }: EventPopupProps) {
  if (!event) return null;



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-elegant">
        <Card className="border-0  shadow-none">
          <div className=" p-6 bg-black text-white" style={{ marginTop: '-1px'}}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <Badge 
                  variant={getEventTypeBadgeVariant(event.eventType)} 
                  className="bg-white/20 text-white border-white/30"
                >
                  {event.eventType}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 border-white/30 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white text-left">
                {event.event}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>

            {event.time && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg font-semibold text-primary">{event.time}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.city}</span>
            </div>
            
            <div className="flex items-center gap-3 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{event.venue}</span>
            </div>
            
            <div className="flex items-center gap-3 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>OB: {event.ob}</span>
            </div>
            
            {event.sng && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Video className="h-4 w-4" />
                <span>SNG: {event.sng}</span>
              </div>
            )}
            
            {event.createdAt && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Created: {format(new Date(event.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            )}
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}