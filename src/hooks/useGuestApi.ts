import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

// Hook for guest events
export const useGuestEvents = (page = 1, perPage = 50, filters?: any) => {
  return useQuery({
    queryKey: ['guest-events', page, perPage, filters],
    queryFn: () => apiClient.getGuestEvents(page, perPage, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for guest dashboard data
export const useGuestDashboardData = () => {
  return useQuery({
    queryKey: ['guest-dashboard-data'],
    queryFn: () => apiClient.getGuestDashboardData(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for guest calendar
export const useGuestCalendar = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['guest-calendar', startDate, endDate],
    queryFn: () => apiClient.getGuestEventCalendar(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
