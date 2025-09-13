import { useState, useMemo, useCallback, useRef } from 'react';
import { Event, ViewMode } from '@/types';
import { EventTable } from '@/components/EventTableAdvanced';
import { MonthlyCalendar } from '@/components/Calendar/MonthlyCalendar';
import { WeeklyCalendar } from '@/components/Calendar/WeeklyCalendar';
import { AddEventDialog } from '@/components/AddEventDialog';
import { ViewToggle } from '@/components/ViewToggle';
import { Header } from '@/components/Header';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { EventTableSkeleton } from '@/components/skeletons/EventTableSkeleton';
import { Card } from '@/components/ui/card';
import { useEvents, useDashboardData, useUpdateEvent, useDeleteEvent } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { BackendEvent } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { Lock } from 'lucide-react';
import debounce from 'lodash/debounce';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';
// Helper function to convert Backend Event to Frontend Event
const convertBackendToFrontendEvent = (backendEvent: BackendEvent): Event => {
  // Convert backend date format to YYYY-MM-DD format that calendar expects
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    
    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // If it's in ISO format (with time), extract just the date part
      if (dateStr.includes('T')) {
        return dateStr.split('T')[0];
      }
      
      // If it's in DD-MM-YYYY format, convert to YYYY-MM-DD
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
      }
      
      // Try to parse as Date and format
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return '';
    } catch (error) {
      console.error('Error formatting date:', dateStr, error);
      return '';
    }
  };

  const convertedEvent = {
    id: backendEvent.id.toString(),
    date: formatDate(backendEvent.event_date),
    time: backendEvent.event_time,
    event: backendEvent.title,
    eventType: backendEvent.eventType || backendEvent.event_type || { name: backendEvent.eventType?.name || backendEvent.event_type?.name || '-' },
    city: backendEvent.city || { name: backendEvent.city?.name || '-' },
    venue: backendEvent.venue || { name: backendEvent.venue?.name || '-' },
    ob: backendEvent.observer?.code || '-',
    sng: backendEvent.sng?.code || '',
    generator: backendEvent.generator?.code || '',
    // Include arrays for editing support
    observers: backendEvent.observers || (backendEvent.observer ? [backendEvent.observer] : []),
    sngs: backendEvent.sngs || (backendEvent.sng ? [backendEvent.sng] : []),
    generators: backendEvent.generators || (backendEvent.generator ? [backendEvent.generator] : []),
    // Include single objects for backward compatibility
    observer: backendEvent.observer,
    createdAt: backendEvent.created_at,
    updatedAt: backendEvent.updated_at,
  };

  return convertedEvent;
};

// Helper function to convert Frontend Event back to Backend Event (for optimistic updates)
const convertFrontendToBackendEvent = (frontendEvent: Event): BackendEvent => {
  return {
    id: parseInt(frontendEvent.id),
    title: frontendEvent.event,
    event_date: frontendEvent.date,
    event_time: frontendEvent.time,
    event_type_id: 0, // Will be handled separately
    city_id: 0, // Will be handled separately
    venue_id: 0, // Will be handled separately
    created_by: 1,
    description: '',
    status: 'scheduled',
    teams: [],
    metadata: [],
    created_at: frontendEvent.createdAt,
    updated_at: frontendEvent.updatedAt,
    event_type: { id: 0, name: typeof frontendEvent.eventType === 'object' ? frontendEvent.eventType.name : frontendEvent.eventType },
    city: { id: 0, name: typeof frontendEvent.city === 'object' ? frontendEvent.city.name : frontendEvent.city },
    venue: { id: 0, name: typeof frontendEvent.venue === 'object' ? frontendEvent.venue.name : frontendEvent.venue },
    observer: { id: 0, code: frontendEvent.ob },
    sng: { id: 0, code: typeof frontendEvent.sng === 'object' ? frontendEvent.sng?.code : frontendEvent.sng },
    generator: { id: 0, code: typeof frontendEvent.generator === 'object' ? frontendEvent.generator?.code : frontendEvent.generator },
  };
};

// Helper function to convert event for API update
const convertEventForUpdate = (event: Event, dashboardData?: any) => {
  const data: any = {
    title: event.event,
    event_date: event.date,
    event_time: event.time,
  };

  // Convert names to IDs if dashboard data is available
  if (dashboardData) {
    // Find event type ID
    const eventType = dashboardData.eventTypes?.find((et: any) => et.name === event.eventType);
    if (eventType) {
      data.event_type_id = eventType.id;
    }

    // Find city ID
    const city = dashboardData.cities?.find((c: any) => c.name === event.city);
    if (city) {
      data.city_id = city.id;
    }

    // Find venue ID
    const venue = dashboardData.venues?.find((v: any) => v.name === event.venue);
    if (venue) {
      data.venue_id = venue.id;
    }

    // Find observer IDs (convert to many-to-many format)
    const observer_ids: number[] = [];
    
    // Check for new array format first
    if (event.observers && Array.isArray(event.observers)) {
      event.observers.forEach((obs: any) => {
        if (typeof obs === 'object' && obs.id) {
          observer_ids.push(obs.id);
        } else {
          // If it's just a code/name, find the full object
          const observer = dashboardData.observers?.find((o: any) => 
            (o.code === obs) || (o.name === obs) || (o.code === obs.code) || (o.name === obs.name)
          );
          if (observer) {
            observer_ids.push(observer.id);
          }
        }
      });
    }
    data.observer_ids = observer_ids;

    const sng_ids: number[] = [];
    
    if (event.sngs && Array.isArray(event.sngs)) {
      event.sngs.forEach((sng: any) => {
        if (typeof sng === 'object' && sng.id) {
          sng_ids.push(sng.id);
        } else {
          const sngObj = dashboardData.sngs?.find((s: any) =>
            (s.name === sng.code)
          );
          if (sngObj) {
            sng_ids.push(sngObj.id);
          }
        }
      });
    }
    data.sng_ids = sng_ids;

    const generator_ids: number[] = [];
    
    // Check for new array format first
    if (event.generators && Array.isArray(event.generators)) {
      event.generators.forEach((generator: any) => {
        if (typeof generator === 'object' && generator.id) {
          generator_ids.push(generator.id);
        } else {
          // If it's just a code/name, find the full object
          const generatorObj = dashboardData.generators?.find((g: any) => 
            (g.name === generator.code)
          );
          if (generatorObj) {
            generator_ids.push(generatorObj.id);
          }
        }
      });
    }
    data.generator_ids = generator_ids;
  }

  return data;
};

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('table');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 100
  });

  // Filters and sorting state
  const [filters, setFilters] = useState({
    search: '',
    eventTypes: [] as string[],
    cities: [] as string[],
    observers: [] as string[],
    sngs: [] as string[],
    generators: [] as string[],
    dateRange: null as any
  });
  
  // Separate state for search input (before debounce)
  const [searchInput, setSearchInput] = useState('');
  
  // Track if this is initial load vs filtering
  const hasFiltered = useRef(false);
  
  // Track if search is pending (for loading indicator)
  const [isSearching, setIsSearching] = useState(false);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination({ currentPage: 1, perPage: pageSize });
  };

  const handleNextPage = () => {
    if (paginationInfo && pagination.currentPage < paginationInfo.lastPage) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };
  
  const [sorting, setSorting] = useState({
    field: 'datetime',
    direction: 'asc' as 'asc' | 'desc'
  });

  // Fetch data from backend
  const { 
    data: eventsResponse, 
    isLoading: eventsLoading, 
    isError: eventsError,
    refetch: refetchEvents 
  } = useEvents(pagination.currentPage, pagination.perPage, {
    search: filters.search || undefined,
    eventTypes: filters.eventTypes.length > 0 ? filters.eventTypes : undefined,
    cities: filters.cities.length > 0 ? filters.cities : undefined,
    observers: filters.observers.length > 0 ? filters.observers : undefined,
    sngs: filters.sngs.length > 0 ? filters.sngs : undefined,
    generators: filters.generators.length > 0 ? filters.generators : undefined,
    dateRange: filters.dateRange ? {
      from: format(filters.dateRange.from, 'yyyy-MM-dd'),
      to: filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : format(filters.dateRange.from, 'yyyy-MM-dd')
    } : undefined,
    sortField: sorting.field || undefined,
    sortDirection: sorting.direction || undefined,
  });

    // Fetch supporting data for filters and add event in one request
  const {
    data: dashboardData,
    isLoading: dashboardDataLoading
  } = useDashboardData();

  // Update event mutation (no auto-invalidation to prevent extra API calls)
  const updateEventMutation = useUpdateEvent();
  
  // Delete event mutation
  const deleteEventMutation = useDeleteEvent();
  
  // Permissions
  const { 
    canCreateEvents, 
    canEditEvents, 
    canDeleteEvents,
    hasPermission,
    canViewDashboard,
    canViewAnalytics 
  } = usePermissions();
  
  // Check if user has access to dashboard
  if (!canViewDashboard) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-destructive/10 rounded-full">
              <Lock className="h-12 w-12 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have permission to access the dashboard.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Current Role: <span className="font-medium">{typeof user?.role === 'string' ? user?.role : user?.role?.name || 'Unknown'}</span></p>
                <p>Required Permission: <span className="font-medium">dashboard.view</span></p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Real-time events callbacks
  const handleRealTimeEventUpdate = useCallback(
    (payload: { event: any; action: 'created' | 'updated' | 'deleted'; timestamp: string }) => {
      const { event, action } = payload;
      
      let existingEventIndex = -1;
      let updateIndex = -1;
      let deleteIndex = -1;
      
      // Update all matching React Query caches for events
      queryClient.setQueriesData(
        { queryKey: ['events'] }, 
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
            console.log('✅ New event added to Dashboard cache:', event.title);
            toast({
              title: 'New Event Created',
              description: `"${event.title}" has been added to the calendar.`,
              duration: 3000,
            });
          } else {
            console.log('⚠️ Event already exists in Dashboard cache, skipping duplicate:', event.title);
          }
          break;
        case 'updated':
          if (updateIndex !== -1) {
            console.log('✏️ Event updated in Dashboard cache:', event.title);
            toast({
              title: 'Event Updated',
              description: `"${event.title}" has been updated.`,
              duration: 3000,
            });
          }
          break;
        case 'deleted':
          if (deleteIndex !== -1) {
            console.log('🗑️ Event deleted from Dashboard cache:', event.title);
            toast({
              title: 'Event Deleted',
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


  
  


  // Convert backend events to frontend format - backend already handles filtering and sorting
  const events: Event[] = useMemo(() => {
    if (!eventsResponse?.success || !eventsResponse.data?.data) return [];
    
    // Simply convert backend events to frontend format
    // No client-side filtering or sorting needed since backend handles it
    return eventsResponse.data.data.map(convertBackendToFrontendEvent);
  }, [eventsResponse]);

  // Extract pagination info
  const paginationInfo = useMemo(() => {
    if (!eventsResponse?.success || !eventsResponse.data) return null;
    return {
      currentPage: eventsResponse.data.current_page,
      lastPage: eventsResponse.data.last_page,
      perPage: eventsResponse.data.per_page,
      total: eventsResponse.data.total,
      from: eventsResponse.data.from,
      to: eventsResponse.data.to
    };
  }, [eventsResponse]);



  const handleAddEvent = (newEventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    // TODO: Implement with backend API
    toast({
      title: "Feature Coming Soon",
      description: "Event creation will be implemented next",
    });
  };

  const handleDeleteEvents = async (eventIds: string[]) => {
    try {
      // 1. Optimistic update - remove from UI immediately
      // Get the correct query key with current filters for delete operation
    const queryKey = ['events', pagination.currentPage, pagination.perPage, {
      search: filters.search || undefined,
      eventTypes: filters.eventTypes.length > 0 ? filters.eventTypes : undefined,
      cities: filters.cities.length > 0 ? filters.cities : undefined,
      observers: filters.observers.length > 0 ? filters.observers : undefined,
      sngs: filters.sngs.length > 0 ? filters.sngs : undefined,
      generators: filters.generators.length > 0 ? filters.generators : undefined,
      dateRange: filters.dateRange ? {
        from: format(filters.dateRange.from, 'yyyy-MM-dd'),
        to: format(filters.dateRange.to, 'yyyy-MM-dd')
      } : undefined,
      sortField: sorting.field || undefined,
      sortDirection: sorting.direction || undefined,
    }];
    
    const currentData = queryClient.getQueryData(queryKey);
      let originalData = currentData; // Save for rollback
      
      if (currentData && (currentData as any).success) {
        const optimisticData = JSON.parse(JSON.stringify(currentData)); // Deep copy
        optimisticData.data.data = optimisticData.data.data.filter((event: any) => 
          !eventIds.includes(event.id.toString())
        );
        
        // Update UI immediately
        queryClient.setQueryData(queryKey, optimisticData);
      }

      // 2. Delete from backend in background
      for (const eventId of eventIds) {
        await deleteEventMutation.mutateAsync(parseInt(eventId));
      }

          toast({
      title: "Events Deleted",
      description: `${eventIds.length} event(s) deleted successfully`,
    });

    } catch (error) {
      console.error('Error deleting events:', error);
      
      // Rollback on error by refetching
      refetchEvents();
      
      toast({
        title: "Delete Failed",
        description: "Failed to delete events. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    // This is now handled by EditEventDialog in EventTableAdvanced
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    // 1. UPDATE UI IMMEDIATELY - NO WAITING!
    // Get the correct query key with current filters
          const queryKey = ['events', pagination.currentPage, pagination.perPage, {
      search: filters.search || undefined,
      eventTypes: filters.eventTypes.length > 0 ? filters.eventTypes : undefined,
      cities: filters.cities.length > 0 ? filters.cities : undefined,
      observers: filters.observers.length > 0 ? filters.observers : undefined,
      sngs: filters.sngs.length > 0 ? filters.sngs : undefined,
      generators: filters.generators.length > 0 ? filters.generators : undefined,
      dateRange: filters.dateRange ? {
        from: format(filters.dateRange.from, 'yyyy-MM-dd'),
        to: format(filters.dateRange.to, 'yyyy-MM-dd')
      } : undefined,
      sortField: sorting.field || undefined,
      sortDirection: sorting.direction || undefined,
    }];
    
    const currentData = queryClient.getQueryData(queryKey);
    let originalData = currentData; // Save for rollback

    if (currentData && (currentData as any).success) {
      const optimisticData = JSON.parse(JSON.stringify(currentData)); // Deep copy
      optimisticData.data.data = optimisticData.data.data.map((event: any) => 
        event.id.toString() === updatedEvent.id 
          ? convertFrontendToBackendEvent(updatedEvent)
          : event
      );


      // Apply optimistic update IMMEDIATELY - user sees change now!
      queryClient.setQueryData(queryKey, optimisticData);
    }

    // 2. Send to backend quietly in background
    try {
      await updateEventMutation.mutateAsync({
        id: parseInt(updatedEvent.id),
        ...convertEventForUpdate(updatedEvent, dashboardData)
      });

      // Success - but no need to refetch since UI already updated!
      toast({
        title: "Event Updated",
        description: "Changes saved successfully",

      });
      
    } catch (error: any) {
      console.error('Error updating event:', error);
      
      // 3. ONLY on error - rollback UI and refetch
      if (originalData) {
        queryClient.setQueryData(queryKey, originalData);
      }
      
      // Refetch only on error to get correct data
      refetchEvents();
      
      // Check if error is travel time related
      const errorData = error?.response?.data;
      if (errorData?.error_type === 'travel_time_insufficient') {
        const details = errorData.details;
        toast({
          title: "Insufficient Travel Time", 
          description: `Required: ${details?.required_travel_hours || 'N/A'}h, Available: ${details?.available_hours || 'N/A'}h`,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        let errorMessage = errorData?.message;

        toast({
          title: "Update Failed", 
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  // Debounced search handler  
  const debouncedSearchChange = useCallback(
    debounce((search: string) => {
      setFilters(prev => ({ ...prev, search }));
      setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on search
      hasFiltered.current = true;
      setIsSearching(false);
    }, 500), // 500ms delay
    []
  );
  
  // Filter handlers
  const handleSearchChange = (search: string) => {
    setSearchInput(search);
    if (search) {
      setIsSearching(true);
    }
    debouncedSearchChange(search);
  };

  const handleEventTypeFilter = (eventTypes: string[]) => {
    setFilters(prev => ({ ...prev, eventTypes }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter
    hasFiltered.current = true;
  };

  const handleCityFilter = (cities: string[]) => {
    setFilters(prev => ({ ...prev, cities }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter
    hasFiltered.current = true;
  };

  const handleObserverFilter = (observers: string[]) => {
    setFilters(prev => ({ ...prev, observers }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter
    hasFiltered.current = true;
  };

  const handleSngFilter = (sngs: string[]) => {
    setFilters(prev => ({ ...prev, sngs }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter
    hasFiltered.current = true;
  };

  const handleGeneratorFilter = (generators: string[]) => {
    setFilters(prev => ({ ...prev, generators }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter
    hasFiltered.current = true;
  };

  const handleDateRangeFilter = (dateRange: any) => {
    setFilters(prev => ({ ...prev, dateRange }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter
    hasFiltered.current = true;
  };

  // Sort handler - now triggers backend refetch
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSorting({ field, direction });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on sort
    hasFiltered.current = true;
  };

  // Show skeleton for dashboard data loading only
  if (dashboardDataLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (eventsError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    // Show loading for initial data fetch or when switching views
    if (eventsLoading && !hasFiltered.current) {
      switch (currentView) {
        case 'monthly':
        case 'weekly':
          return (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading calendar...</span>
            </div>
          );
        default:
          return <EventTableSkeleton />;
      }
    }

    switch (currentView) {
      case 'monthly':
        return <MonthlyCalendar events={events} eventTypes={dashboardData?.eventTypes || []} />;
      case 'weekly':
        return <WeeklyCalendar events={events} eventTypes={dashboardData?.eventTypes || []} />;
      default:
                return (
          <EventTable
            events={events}
            eventTypes={dashboardData?.eventTypes || []}
            cities={dashboardData?.cities || []}
            venues={dashboardData?.venues || []}
            observers={dashboardData?.observers || []}
            sngs={dashboardData?.sngs || []}
            generators={dashboardData?.generators || []}
            onDeleteEvents={handleDeleteEvents}
            onEditEvent={handleEditEvent}
            onUpdateEvent={handleUpdateEvent}
            onAddEvent={handleAddEvent}
            // Filter props - now triggers backend queries
            filters={{...filters, search: searchInput}} // Show current input, not debounced value
            onSearchChange={handleSearchChange}
            isSearching={isSearching}
            onEventTypeFilter={handleEventTypeFilter}
            onCityFilter={handleCityFilter}
            onObserverFilter={handleObserverFilter}
            onSngFilter={handleSngFilter}
            onGeneratorFilter={handleGeneratorFilter}
            onDateRangeFilter={handleDateRangeFilter}
            // Sort props - now triggers backend queries
            sorting={sorting}
            onSort={handleSort}
            // Loading state for skeleton - only on initial load, not during filtering
            isLoading={eventsLoading && !hasFiltered.current}
            // Pagination props - for server-side pagination
            paginationInfo={paginationInfo}
            currentPage={pagination.currentPage}
            pageSize={pagination.perPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <Header 
          title="Alamiya Calender"
          subtitle={`Discover Alamiya’s Latest Projects Step by Step`}
        />



        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        </div>

        {/* Main Content */}
        {renderView()}
        
        {/* Footer */}
        <footer className="mt-16 py-6 text-center border-t border-border">
          <p className="text-xs text-muted-foreground">Powered by Konhub</p>
        </footer>
      </div>
    </div>
  );
};
export default Index;