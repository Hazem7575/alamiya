import { useState, useMemo } from 'react';
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

  console.log(backendEvent)
  return {
    id: backendEvent.id.toString(),
    date: formatDate(backendEvent.event_date),
    time: backendEvent.event_time,
    event: backendEvent.title,
    eventType: backendEvent.event_type?.name || 'Unknown',
    city: backendEvent.city?.name || 'Unknown',
    venue: backendEvent.venue?.name || 'Unknown',
    ob: backendEvent.observer?.code || 'Unknown',
    sng: backendEvent.sng?.code || 'Unknown',
    createdAt: backendEvent.created_at,
    updatedAt: backendEvent.updated_at,
  };
};

const GuestDashboard = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('table');
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Alamiya Calendar</h1>
          <p className="text-muted-foreground">Team Schedule View - {events.length} Events</p>
        </div>
        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        </div>

        {/* Main Content */}
        {renderView()}
        

      </div>
    </div>
  );
};

export default GuestDashboard;
