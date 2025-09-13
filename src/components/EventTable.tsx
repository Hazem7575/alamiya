import { Event } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { getEventTypeBadgeVariant } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface EventTableProps {
  events: Event[];
}



export function EventTable({ events }: EventTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredEvents = events.filter(event =>
    Object.values(event).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="shadow-card">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">DATE</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">EVENT</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">TYPE</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">CITY</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">VENUE</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">OB</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">SNG</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">GEN</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-foreground">
                    {new Date(event.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }).replace(/\//g, '-')}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground font-medium">{event.event}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getEventTypeBadgeVariant(typeof event.eventType === 'object' ? event.eventType?.name : event.eventType)}>
                      {typeof event.eventType === 'object' ? event.eventType?.name || '-' : event.eventType || '-'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {typeof event.city === 'object' ? event.city?.name || '-' : event.city || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {typeof event.venue === 'object' ? event.venue?.name || '-' : event.venue || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {event.observers && event.observers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {event.observers.slice(0, 2).map((observer: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {typeof observer === 'object' ? observer.code || observer.name || '-' : observer}
                          </Badge>
                        ))}
                        {event.observers.length > 2 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                +{event.observers.length - 2}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground mb-2">
                                  All Ob ({event.observers.length})
                                </div>
                                <div className="flex flex-wrap gap-1 max-w-64">
                                  {event.observers.map((observer: any, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {typeof observer === 'object' ? observer.code || observer.name || '-' : observer}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    ) : (
                      (typeof event.observer === 'object' ? event.observer?.code : event.observer) || event.ob || '-'
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {event.sngs && event.sngs.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {event.sngs.slice(0, 2).map((sng: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {typeof sng === 'object' ? sng.code || sng.name || '-' : sng}
                          </Badge>
                        ))}
                        {event.sngs.length > 2 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                +{event.sngs.length - 2}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground mb-2">
                                  All SNGs ({event.sngs.length})
                                </div>
                                <div className="flex flex-wrap gap-1 max-w-64">
                                  {event.sngs.map((sng: any, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {typeof sng === 'object' ? sng.code || sng.name || '-' : sng}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    ) : (
                      (typeof event.sng === 'object' ? event.sng?.code : event.sng) || '-'
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {event.generators && event.generators.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {event.generators.slice(0, 1).map((generator: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {typeof generator === 'object' ? generator.code || generator.name || '-' : generator}
                          </Badge>
                        ))}
                        {event.generators.length > 1 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                +{event.generators.length - 1}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground mb-2">
                                  All Generators ({event.generators.length})
                                </div>
                                <div className="flex flex-wrap gap-1 max-w-64">
                                  {event.generators.map((generator: any, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {typeof generator === 'object' ? generator.code || generator.name || '-' : generator}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    ) : (
                      (typeof event.generator === 'object' ? event.generator?.code : event.generator) || '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No events found matching your search.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}