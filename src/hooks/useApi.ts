import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { CreateCityRequest, CreateDistanceRequest, BatchUpdateDistanceRequest } from '@/types/api';
import { toast } from '@/hooks/use-toast';

// Cities hooks
export function useCities(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => apiClient.getCities(),
    select: (data) => data.data,
    enabled: options?.enabled !== false, // Default to true
  });
}

export function useCity(id: number) {
  return useQuery({
    queryKey: ['cities', id],
    queryFn: () => apiClient.getCity(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useCreateCity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (city: CreateCityRequest) => apiClient.createCity(city),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast({
        title: "Success",
        description: data.message || "City created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create city",
      });
    },
  });
}

export function useUpdateCity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, city }: { id: number; city: Partial<CreateCityRequest> }) => 
      apiClient.updateCity(id, city),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast({
        title: "Success",
        description: data.message || "City updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update city",
      });
    },
  });
}

export function useDeleteCity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteCity(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast({
        title: "Success",
        description: data.message || "City deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete city",
      });
    },
  });
}

export function useMissingDistances() {
  return useQuery({
    queryKey: ['missing-distances'],
    queryFn: () => apiClient.getMissingDistances(),
    select: (data) => data.data,
  });
}

// Distances hooks
export function useDistances() {
  return useQuery({
    queryKey: ['distances'],
    queryFn: () => apiClient.getDistances(),
    select: (data) => data.data,
  });
}

export function useDistance(id: number) {
  return useQuery({
    queryKey: ['distances', id],
    queryFn: () => apiClient.getDistance(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useCreateDistance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (distance: CreateDistanceRequest) => apiClient.createDistance(distance),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['distances'] });
      queryClient.invalidateQueries({ queryKey: ['missing-distances'] });
      queryClient.invalidateQueries({ queryKey: ['distance-matrix'] });
      toast({
        title: "Success",
        description: data.message || "Distance created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create distance",
      });
    },
  });
}

export function useUpdateDistance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, distance }: { id: number; distance: Partial<CreateDistanceRequest> }) => 
      apiClient.updateDistance(id, distance),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['distances'] });
      queryClient.invalidateQueries({ queryKey: ['missing-distances'] });
      queryClient.invalidateQueries({ queryKey: ['distance-matrix'] });
      toast({
        title: "Success",
        description: data.message || "Distance updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update distance",
      });
    },
  });
}

export function useDeleteDistance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteDistance(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['distances'] });
      queryClient.invalidateQueries({ queryKey: ['missing-distances'] });
      queryClient.invalidateQueries({ queryKey: ['distance-matrix'] });
      toast({
        title: "Success",
        description: data.message || "Distance deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete distance",
      });
    },
  });
}

export function useDistanceMatrix() {
  return useQuery({
    queryKey: ['distance-matrix'],
    queryFn: () => apiClient.getDistanceMatrix(),
    select: (data) => data.data,
  });
}

export function useBatchUpdateDistances() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: BatchUpdateDistanceRequest) => apiClient.batchUpdateDistances(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['distances'] });
      queryClient.invalidateQueries({ queryKey: ['missing-distances'] });
      queryClient.invalidateQueries({ queryKey: ['distance-matrix'] });
      toast({
        title: "Success",
        description: data.message || "Distances updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update distances",
      });
    },
  });
}

// Events hooks
interface EventFilters {
  search?: string;
  eventTypes?: string[];
  cities?: string[];
  observers?: string[];
  sngs?: string[];
  dateRange?: { from: string; to: string } | null;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export function useEvents(page = 1, perPage = 50, filters?: EventFilters) {
  return useQuery({
    queryKey: ['events', page, perPage, filters],
    queryFn: () => apiClient.getEvents(page, perPage, filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => apiClient.getEvent(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      date: string;
      time: string;
      event: string;
      eventType: string;
      city: string;
      venue: string;
      ob: string;
      sng: string;
    }) => apiClient.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to create event";
      let errorDetails = "";

      if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || errorMessage;
        errorDetails = data.details || "";

        if (data.errors && typeof data.errors === 'object') {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError[0]) {
            errorMessage = firstError[0];
          }
        }
      }

      toast({
        variant: "destructive",
        title: "Unable to Create Event",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<import('@/services/api').CreateEventRequest>) => 
      apiClient.updateEvent(id, data),
    
    onSuccess: () => {
      // Invalidate and refetch events data
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },

    onError: (error: any) => {
      // Extract error details from API response
      const errorData = error?.response?.data;
      console.log(errorData)
      // Handle specific error types
      if (errorData?.error_type === 'travel_time_insufficient') {
        const details = errorData.details;
        toast({
          title: "Insufficient Travel Time", 
          description: `Required: ${details?.required_travel_hours || 'N/A'}h, Available: ${details?.available_hours || 'N/A'}h`,
          variant: "destructive",
          duration: 5000,
        });
      } else if (errorData?.error_type === 'observer_conflict') {
        toast({
          title: "Observer Conflict", 
          description: errorData?.message,
          variant: "destructive",
          duration: 4000,
        });
      } else {
        // Generic error message - clean up any Arabic text
        let errorMessage = errorData?.message;

        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      // Don't throw the error - React Query handles it
      console.error('Update event error:', error);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteEvent(id),
    // Remove auto-invalidation to prevent extra API calls
    // onSuccess will be handled manually in the component
    onError: (error) => {
      // Remove toast from here - will be handled in component
      console.error('Delete event error:', error);
    },
  });
}

export function useEventCalendar(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['eventCalendar', startDate, endDate],
    queryFn: () => apiClient.getEventCalendar(startDate, endDate),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Dashboard hooks
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard', 'data'],
    queryFn: () => apiClient.getDashboardData(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data.data, // Extract data from ApiResponse
  });
}



export function useDashboardCalendar() {
  return useQuery({
    queryKey: ['dashboard', 'calendar'],
    queryFn: () => apiClient.getDashboardCalendar(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Supporting data hooks
export function useEventTypes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['eventTypes'],
    queryFn: () => apiClient.getEventTypes(),
    staleTime: 1000 * 60 * 10, // 10 minutes - static data
    enabled: options?.enabled !== false, // Default to true
  });
}

export function useVenues(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['venues'],
    queryFn: () => apiClient.getVenues(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: options?.enabled !== false, // Default to true
  });
}

export function useObservers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['observers'],
    queryFn: () => apiClient.getObservers(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: options?.enabled !== false, // Default to true
  });
}

// Mutation hooks for Settings management
export function useCreateEventType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; code: string; description?: string; color: string }) => 
      apiClient.createEventType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
      toast({
        title: "Success",
        description: "Event type created successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to create event type";
      let errorDetails = "";
      
      if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || errorMessage;
        errorDetails = data.details || "";
        
        // If there are specific validation errors, use the first one
        if (data.errors && typeof data.errors === 'object') {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError[0]) {
            errorMessage = firstError[0];
          }
        }
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Create Event Type",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<{ name: string; description: string; color: string }>) => 
      apiClient.updateEventType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
      toast({
        title: "Success",
        description: "Event type updated successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update event type";
      let errorDetails = "";
      
      if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || errorMessage;
        errorDetails = data.details || "";
        
        // If there are specific validation errors, use the first one
        if (data.errors && typeof data.errors === 'object') {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError[0]) {
            errorMessage = firstError[0];
          }
        }
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Update Event Type",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

export function useDeleteEventType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteEventType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
      toast({
        title: "Success",
        description: "Event type deleted successfully",
      });
    },
        onError: (error: any) => {
      let errorMessage = "Failed to delete event type";
      let errorDetails = "";
      
      if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || errorMessage;
        errorDetails = data.details || "";
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Delete Event Type",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; city_id: number; address?: string; capacity?: number }) => 
      apiClient.createVenue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: "Success",
        description: "Venue created successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to create venue";
      let errorDetails = "";
      
      if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || errorMessage;
        errorDetails = data.details || "";
        
        // If there are specific validation errors, use the first one
        if (data.errors && typeof data.errors === 'object') {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError[0]) {
            errorMessage = firstError[0];
          }
        }
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Create Venue",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<{ name: string; address?: string; capacity?: number }>) => 
      apiClient.updateVenue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: "Success",
        description: "Venue updated successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update venue";
      let errorDetails = "";
      
      if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || errorMessage;
        errorDetails = data.details || "";
        
        // If there are specific validation errors, use the first one
        if (data.errors && typeof data.errors === 'object') {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError[0]) {
            errorMessage = firstError[0];
          }
        }
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Update Venue",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

export function useDeleteVenue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: "Success",
        description: "Venue deleted successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to delete venue";
      let errorDetails = "";
      
      if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || errorMessage;
        errorDetails = data.details || "";
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Delete Venue",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

export function useCreateObserver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { code: string }) => 
      apiClient.createObserver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observers'] });
      toast({
        title: "Success",
        description: "Observer created successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to create observer";
      let errorDetails = "";
      
      if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || errorMessage;
        errorDetails = data.details || "";
        
        // If there are specific validation errors, use the first one
        if (data.errors && typeof data.errors === 'object') {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError[0]) {
            errorMessage = firstError[0];
          }
        }
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Create Observer",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

export function useUpdateObserver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, code }: { id: number; code: string }) => 
      apiClient.updateObserver(id, { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observers'] });
      toast({
        title: "Success",
        description: "Observer updated successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update observer";
      let errorDetails = "";
      
      if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || errorMessage;
        errorDetails = data.details || "";
        
        // If there are specific validation errors, use the first one
        if (data.errors && typeof data.errors === 'object') {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError[0]) {
            errorMessage = firstError[0];
          }
        }
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Update Observer",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

export function useDeleteObserver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteObserver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observers'] });
      toast({
        title: "Success",
        description: "Observer deleted successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to delete observer";
      let errorDetails = "";
      
      if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || errorMessage;
        errorDetails = data.details || "";
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Delete Observer",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

// SNG hooks
export function useSngs(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['sngs'],
    queryFn: () => apiClient.getSngs(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: options?.enabled !== false, // Default to true
  });
}

export function useCreateSng() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { code: string }) => 
      apiClient.createSng(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sngs'] });
      toast({
        title: "Success",
        description: "SNG created successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to create SNG";
      let errorDetails = "";
      
      const data = error?.response?.data;
      if (data?.details) {
        errorDetails = data.details || "";
        errorMessage = data.message || errorMessage;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
        if (error.response.data.errors) {
          const errorKeys = Object.keys(error.response.data.errors);
          if (errorKeys.length > 0) {
            errorDetails = error.response.data.errors[errorKeys[0]][0];
          }
        }
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Create SNG",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

export function useUpdateSng() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, code }: { id: number; code: string }) => 
      apiClient.updateSng(id, { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sngs'] });
      toast({
        title: "Success",
        description: "SNG updated successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update SNG";
      let errorDetails = "";
      
      const data = error?.response?.data;
      if (data?.details) {
        errorDetails = data.details || "";
        errorMessage = data.message || errorMessage;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
        if (error.response.data.errors) {
          const errorKeys = Object.keys(error.response.data.errors);
          if (errorKeys.length > 0) {
            errorDetails = error.response.data.errors[errorKeys[0]][0];
          }
        }
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Update SNG",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}

export function useDeleteSng() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteSng(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sngs'] });
      toast({
        title: "Success",
        description: "SNG deleted successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to delete SNG";
      let errorDetails = "";
      
      const data = error?.response?.data;
      if (data?.details) {
        errorDetails = data.details || "";
      }
      
      toast({
        variant: "destructive",
        title: "Unable to Delete SNG",
        description: errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage,
      });
    },
  });
}