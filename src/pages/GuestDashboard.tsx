import { useState, useMemo, useCallback } from 'react';
import { Event, ViewMode } from '@/types';
import { EventTableGuest } from '@/components/EventTableGuest';
import { MonthlyCalendar } from '@/components/Calendar/MonthlyCalendar';
import { WeeklyCalendar } from '@/components/Calendar/WeeklyCalendar';
import { ViewToggle } from '@/components/ViewToggle';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { Card } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { useGuestEvents, useGuestDashboardData } from '@/hooks/useGuestApi';
import { BackendEvent } from '@/services/api';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Helper function to convert Backend Event to Frontend Event
const convertBackendToFrontendEvent = (backendEvent: BackendEvent): Event => {
  // Format date from ISO format to YYYY-MM-DD
  const formatDate = (dateStr: string) => {
    if (!dateStr) return dateStr;
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // If it's in ISO format (with time), extract just the date part
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    
    return dateStr;
  };

  return {
    id: backendEvent.id.toString(),
    date: formatDate(backendEvent.event_date),
    time: backendEvent.event_time,
    event: backendEvent.title,
    eventType: backendEvent.eventType || backendEvent.event_type || { name: backendEvent.eventType?.name || backendEvent.event_type?.name || '-' },
    city: backendEvent.city || { name: backendEvent.city?.name || '-' },
    venue: backendEvent.venue || { name: backendEvent.venue?.name || '-' },
    // Handle observers - use first observer for backward compatibility
    ob: backendEvent.observers && backendEvent.observers.length > 0 
      ? backendEvent.observers[0].code 
      : backendEvent.observer?.code || '-',
    // Handle SNGs - use first SNG for backward compatibility
    sng: backendEvent.sngs && backendEvent.sngs.length > 0 
      ? (backendEvent.sngs[0].code || backendEvent.sngs[0].name)
      : (backendEvent.sng?.code || backendEvent.sng?.name || '-'),
    // Handle generators - use first generator for backward compatibility
    generator: backendEvent.generators && backendEvent.generators.length > 0 
      ? (backendEvent.generators[0].code || backendEvent.generators[0].name)
      : (backendEvent.generator?.code || backendEvent.generator?.name || '-'),
    // Include arrays for editing support
    observers: backendEvent.observers || (backendEvent.observer ? [backendEvent.observer] : []),
    sngs: backendEvent.sngs || (backendEvent.sng ? [backendEvent.sng] : []),
    generators: backendEvent.generators || (backendEvent.generator ? [backendEvent.generator] : []),
    // Include single objects for backward compatibility
    observer: backendEvent.observer,
    createdAt: backendEvent.created_at,
    updatedAt: backendEvent.updated_at,
  };
};

const GuestDashboard = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('monthly');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch data from backend using guest APIs (get all events, no pagination)
  const { 
    data: eventsResponse, 
    isLoading: eventsLoading, 
    isError: eventsError,
    refetch: refetchEvents 
  } = useGuestEvents(1, 1000, {}); // Get up to 1000 events without filters - local filtering instead

  const {
    data: dashboardResponse,
    isLoading: dashboardLoading,
    isError: dashboardError
  } = useGuestDashboardData();

  // Real-time events callbacks for guest dashboard
  const handleRealTimeEventUpdate = useCallback(
    (payload: { event: any; action: 'created' | 'updated' | 'deleted'; timestamp: string }) => {
      const { event, action } = payload;
      
      let existingEventIndex = -1;
      let updateIndex = -1;
      let deleteIndex = -1;
      
      // Update all matching React Query caches for guest events
      queryClient.setQueriesData(
        { queryKey: ['guest-events'] }, 
        (oldData: any) => {
          if (!oldData?.data?.data) return oldData;
          
          const events = [...oldData.data.data];
          
          switch (action) {
            case 'created':
              // Check if event already exists to prevent duplicates (compare both as strings)
              existingEventIndex = events.findIndex((e) => e.id.toString() === event.id.toString());
              if (existingEventIndex === -1) {
                // Add new event to the beginning of the list only if it doesn't exist
                events.unshift(event);
              }
              break;
              
            case 'updated':
              // Update existing event (compare both as strings)
              updateIndex = events.findIndex((e) => e.id.toString() === event.id.toString());
              if (updateIndex !== -1) {
                events[updateIndex] = event;
              }
              break;
              
            case 'deleted':
              // Remove event from list (compare both as strings)
              deleteIndex = events.findIndex((e) => e.id.toString() === event.id.toString());
              if (deleteIndex !== -1) {
                events.splice(deleteIndex, 1);
              }
              break;
          }
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: events,
            },
          };
        }
      );
      
      // Show notification only if event was actually added/updated (not duplicate)
      switch (action) {
        case 'created':
          if (existingEventIndex === -1) {
            console.log('✅ New event added to Guest Dashboard cache:', event.title);
            toast({
              title: 'New Event Added',
              description: `"${event.title}" has been added to the calendar.`,
              duration: 3000,
            });
          } else {
            console.log('⚠️ Event already exists in Guest Dashboard cache, skipping duplicate:', event.title);
          }
          break;
        case 'updated':
          if (updateIndex !== -1) {
            console.log('✏️ Event updated in Guest Dashboard cache:', event.title);
            toast({
              title: 'Event Updated',
              description: `"${event.title}" has been updated.`,
              duration: 3000,
            });
          }
          break;
        case 'deleted':
          if (deleteIndex !== -1) {
            console.log('🗑️ Event deleted from Guest Dashboard cache:', event.title);
            toast({
              title: 'Event Removed',
              description: `"${event.title}" has been removed from the calendar.`,
              duration: 3000,
            });
          }
          break;
      }
    },
    [queryClient, toast]
  );

  // Setup real-time events
  useRealTimeEvents({
    onEventUpdate: handleRealTimeEventUpdate,
  });

  // Convert backend events to frontend format
  const events: Event[] = useMemo(() => {
    if (!eventsResponse?.success || !eventsResponse.data?.data) return [];
    return eventsResponse.data.data.map(convertBackendToFrontendEvent);
  }, [eventsResponse]);

  // Extract dashboard data
  const dashboardData = useMemo(() => {
    if (!dashboardResponse?.success) return null;
    return dashboardResponse.data;
  }, [dashboardResponse]);

  // No need for handleFiltersChange - using local filtering instead

  // Show skeleton while loading
  if (eventsLoading || dashboardLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (eventsError || dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Unable to Load Data</h2>
          <p className="text-muted-foreground mb-4">
            There was an error connecting to the server. Please check your connection and try again.
          </p>
          <button 
            onClick={() => refetchEvents()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'monthly':
        return <MonthlyCalendar events={events} eventTypes={dashboardData?.eventTypes || []} />;
      case 'weekly':
        return <WeeklyCalendar events={events} eventTypes={dashboardData?.eventTypes || []} />;
      default:
        return (
          <EventTableGuest 
            events={events}
            eventTypes={dashboardData?.eventTypes || []} // Keep only for badge colors
            isLoading={eventsLoading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center justify-center w-16 h-16  mr-4">
            <img src="/alamiya-logo.png" alt=""/>
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-foreground !text-[30px]">Alamiya Calendar</h1>
            <p className="text-xl text-muted-foreground !text-[15px]">Discover Alamiya's Latest Projects Step by Step</p>
          </div>
        </div>
        
        {/* Last Updated */}
        {dashboardData?.last_updated && (
          <div className="flex justify-center mb-4">
            <p className="text-sm text-muted-foreground">
              Last Updated: {new Date(dashboardData.last_updated).toLocaleString()}
            </p>
          </div>
        )}
        
        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        </div>

        {/* Main Content */}
        {renderView()}

        <footer className="mt-16 py-6 text-center border-t border-border">
          <p className="text-xs text-muted-foreground">Powered by Konhub</p>
        </footer>
      </div>
    </div>
  );
};

export default GuestDashboard;
