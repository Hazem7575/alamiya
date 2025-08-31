import { Event } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { getEventTypeBadgeVariant } from '@/lib/utils';

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
                    <Badge variant={getEventTypeBadgeVariant(event.eventType)}>
                      {event.eventType}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{event.city}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{event.venue}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{event.ob}</td>
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