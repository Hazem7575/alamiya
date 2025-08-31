import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Sparkles } from 'lucide-react';
import { LIGHT_BADGE_COLORS, getEventTypeBadgeVariant } from '@/lib/utils';

// Sample event types for demonstration
const sampleEventTypes = [
  'NIOM League',
  'Roshn Saudi League', 
  'Women\'s League',
  'Youth League',
  'First Division League',
  'Academy League',
  'Champions Cup',
  'Super Cup',
  'King\'s Cup',
  'Crown Prince Cup',
  'Federation Cup',
  'Elite Cup',
  'Regional Tournament',
  'International Friendly',
  'Training Camp'
];

export const EventTypeColorManager = () => {

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Event Type Colors</CardTitle>
            <CardDescription className="text-white/80">
              Light Metronic-style colors are automatically assigned to event types
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Automatic Color Assignment
              </h3>
              <p className="text-sm text-blue-700">
                Event types are automatically assigned beautiful light colors based on their names. 
                The same event type will always get the same color across the application.
              </p>
            </div>
          </div>

          {/* Available Colors Preview */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-foreground">Available Light Colors</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {LIGHT_BADGE_COLORS.map((colorVariant) => (
                <div key={colorVariant} className="text-center">
                  <Badge variant={colorVariant} className="w-full mb-2">
                    Sample
                  </Badge>
                  <p className="text-xs text-muted-foreground capitalize">
                    {colorVariant.replace('light_', '')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Event Types */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-foreground">Sample Event Types</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sampleEventTypes.map((eventType) => (
                <div key={eventType} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                  <span className="text-sm font-medium text-foreground truncate mr-3">
                    {eventType}
                  </span>
                  <Badge variant={getEventTypeBadgeVariant(eventType)}>
                    {eventType}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};