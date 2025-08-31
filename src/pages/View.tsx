import { useState, useMemo } from 'react';
import { Event, ViewMode } from '@/types';
import { MonthlyCalendar } from '@/components/Calendar/MonthlyCalendar';
import { WeeklyCalendar } from '@/components/Calendar/WeeklyCalendar';
import { ViewToggle } from '@/components/ViewToggle';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { Card } from '@/components/ui/card';
import { useEvents } from '@/hooks/useApi';
import { BackendEvent } from '@/services/api';

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
    eventType: backendEvent.event_type?.name || 'Unknown',
    city: backendEvent.city?.name || 'Unknown',
    venue: backendEvent.venue?.name || 'Unknown',
    ob: backendEvent.observer?.code || 'Unknown',
    createdAt: backendEvent.created_at,
    updatedAt: backendEvent.updated_at,
  };
};

const View = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('monthly');
  
  // Fetch data from backend
  const { 
    data: eventsResponse, 
    isLoading: eventsLoading, 
    isError: eventsError,
    refetch: refetchEvents 
  } = useEvents(1, 100);

  // Convert backend events to frontend format
  const events: Event[] = useMemo(() => {
    if (!eventsResponse?.success || !eventsResponse.data?.data) return [];
    return eventsResponse.data.data.map(convertBackendToFrontendEvent);
  }, [eventsResponse]);

  // Show loading skeleton
  if (eventsLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (eventsError) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Unable to Load Events</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading the calendar events. Please check your connection and try again.
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
        return <MonthlyCalendar events={events} />;
      case 'weekly':
        return <WeeklyCalendar events={events} />;
      default:
        return <MonthlyCalendar events={events} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Alamiya Calendar</h1>
          <p className="text-muted-foreground">Team Schedule View - {events.length} Events</p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        </div>

        {/* Calendar Content */}
        <div className="max-w-6xl mx-auto">
          {renderView()}
        </div>
        
        {/* Footer */}
        <footer className="mt-16 py-6 text-center border-t border-border">
          <p className="text-xs text-muted-foreground">Powered by Konhub</p>
        </footer>
      </div>
    </div>
  );
};

export default View;