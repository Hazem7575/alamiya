import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Building2, User, Clock, X, Video, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/types';
import { getEventTypeBadgeVariant } from '@/lib/utils';

interface EventPopupProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTypes?: any[];
}

// Function to get header background color based on event type
const getHeaderBackgroundColor = (eventType: string, eventTypes: any[] = []) => {
  const eventTypeData = eventTypes.find(t => t.name === eventType);
  const colorVariant = getEventTypeBadgeVariant(eventType, eventTypeData);

  // Use the same text colors from badge variants as background colors for header
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

  return colorMap[colorVariant] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' };
};

export function EventPopup({ event, open, onOpenChange, eventTypes = [] }: EventPopupProps) {
  if (!event) return null;

  // Extract string values from objects
  const eventTypeName = typeof event.eventType === 'object' ? event.eventType?.name : event.eventType;
  const cityName = typeof event.city === 'object' ? event.city?.name : event.city;
  const venueName = typeof event.venue === 'object' ? event.venue?.name : event.venue;
  const sngName = typeof event.sng === 'object' ? event.sng?.name : event.sng;
  const generatorName = typeof event.generator === 'object' ? event.generator?.name : event.generator;

  const headerBgColor = getHeaderBackgroundColor(eventTypeName, eventTypes);

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-elegant">
          <Card className="border-0 shadow-none">
            <div className={`p-6 ${headerBgColor.bg} ${headerBgColor.text}`} style={{ marginTop: '-1px'}}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <Badge
                      variant={getEventTypeBadgeVariant(eventTypeName, eventTypes.find(t => t.name === eventTypeName))}
                      className={`bg-white/20 ${headerBgColor.text} ${headerBgColor.border}`}
                  >
                    {eventTypeName}
                  </Badge>
                </div>
              </div>
              <DialogHeader>
                <DialogTitle className={`text-xl font-bold ${headerBgColor.text} text-left`}>
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
                <span>{cityName}</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{venueName}</span>
              </div>

              <div className="flex items-start gap-3 text-muted-foreground">
                <User className="h-4 w-4 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">Ob:</span>
                  <div className="flex flex-wrap gap-1">
                    {event.observers && event.observers.length > 0 ? (
                      event.observers.map((observer: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {typeof observer === 'object' ? observer.code || observer.name || '-' : observer}
                        </Badge>
                      ))
                    ) : event.ob ? (
                      <Badge variant="outline" className="text-xs">
                        {event.ob}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">No ob</span>
                    )}
                  </div>
                </div>
              </div>

              {((event.sngs && event.sngs.length > 0) || sngName) && (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Video className="h-4 w-4 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">SNGs:</span>
                      <div className="flex flex-wrap gap-1">
                        {event.sngs && event.sngs.length > 0 ? (
                          event.sngs.map((sng: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {typeof sng === 'object' ? sng.code || sng.name || '-' : sng}
                            </Badge>
                          ))
                        ) : sngName ? (
                          <Badge variant="outline" className="text-xs">
                            {sngName}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
              )}

              {((event.generators && event.generators.length > 0) || generatorName) && (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Zap className="h-4 w-4 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">Generators:</span>
                      <div className="flex flex-wrap gap-1">
                        {event.generators && event.generators.length > 0 ? (
                          event.generators.map((generator: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {typeof generator === 'object' ? generator.code || generator.name || '-' : generator}
                            </Badge>
                          ))
                        ) : generatorName ? (
                          <Badge variant="outline" className="text-xs">
                            {generatorName}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
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