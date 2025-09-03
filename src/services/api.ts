import { 
  City, 
  CityDistance, 
  ApiResponse, 
  CreateCityRequest, 
  CreateDistanceRequest,
  BatchUpdateDistanceRequest,
  DistanceMatrix,
  MissingDistancePair
} from '@/types/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  permissions?: string[];
  avatar?: string;
  status: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  role_id?: number;
}

export interface BackendEvent {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  event_type_id: number;
  city_id: number;
  venue_id: number;
  observer_id: number;
  sng_id?: number;
  created_by: number;
  description?: string;
  status: string;
  teams?: string[];
  metadata?: any;
  created_at: string;
  updated_at: string;
  // Relations
  event_type?: { id: number; name: string; };
  city?: { id: number; name: string; };
  venue?: { id: number; name: string; };
  observer?: { id: number; code: string; };
  sng?: { id: number; code: string; };
  creator?: { id: number; name: string; };
}

export interface CreateEventRequest {
  title: string;
  event_date: string;
  event_time: string;
  event_type_id: number;
  city_id: number;
  venue_id: number;
  observer_id: number;
  sng_id?: number;
  description?: string;
  teams?: string[];
  metadata?: any;
}

export interface EventsResponse {
  data: BackendEvent[];
  current_page: number;
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: any;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}



//const API_BASE_URL = 'https://alamiya.konhub.dev/api/api';
const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.response = {
          status: response.status,
          data: errorData,
        };
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      // If it's already a structured error, just throw it
      if (error.response) {
        throw error;
      }
      // Otherwise, wrap it
      const wrappedError: any = new Error(error.message || 'Network error');
      wrappedError.response = { data: { message: error.message } };
      throw wrappedError;
    }
  }

  // Cities API
  async getCities(): Promise<ApiResponse<City[]>> {
    return this.fetchApi('/cities');
  }

  async getCity(id: number): Promise<ApiResponse<City>> {
    return this.fetchApi(`/cities/${id}`);
  }

  async createCity(city: CreateCityRequest): Promise<ApiResponse<City>> {
    return this.fetchApi('/cities', {
      method: 'POST',
      body: JSON.stringify(city),
    });
  }

  async updateCity(id: number, city: Partial<CreateCityRequest>): Promise<ApiResponse<City>> {
    return this.fetchApi(`/cities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(city),
    });
  }

  async deleteCity(id: number): Promise<ApiResponse<void>> {
    return this.fetchApi(`/cities/${id}`, {
      method: 'DELETE',
    });
  }

  async getMissingDistances(): Promise<ApiResponse<MissingDistancePair[]>> {
    return this.fetchApi('/cities-missing-distances');
  }

  // City Distances API
  async getDistances(): Promise<ApiResponse<CityDistance[]>> {
    return this.fetchApi('/city-distances');
  }

  async getDistance(id: number): Promise<ApiResponse<CityDistance>> {
    return this.fetchApi(`/city-distances/${id}`);
  }

  async createDistance(distance: CreateDistanceRequest): Promise<ApiResponse<CityDistance>> {
    return this.fetchApi('/city-distances', {
      method: 'POST',
      body: JSON.stringify(distance),
    });
  }

  async updateDistance(id: number, distance: Partial<CreateDistanceRequest>): Promise<ApiResponse<CityDistance>> {
    return this.fetchApi(`/city-distances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(distance),
    });
  }

  async deleteDistance(id: number): Promise<ApiResponse<void>> {
    return this.fetchApi(`/city-distances/${id}`, {
      method: 'DELETE',
    });
  }

  async getDistanceMatrix(): Promise<ApiResponse<DistanceMatrix>> {
    return this.fetchApi('/distance-matrix');
  }

  async batchUpdateDistances(request: BatchUpdateDistanceRequest): Promise<ApiResponse<{ created: number; updated: number }>> {
    return this.fetchApi('/city-distances/batch', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token in localStorage if login successful
    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token in localStorage if registration successful
    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.fetchApi<void>('/auth/logout', {
      method: 'POST',
    });
    
    // Clear stored auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.fetchApi('/auth/me');
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; token_type: string; expires_in: number }>> {
    const response = await this.fetchApi<{ token: string; token_type: string; expires_in: number }>('/auth/refresh', {
      method: 'POST',
    });
    
    // Update token in localStorage if refresh successful
    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response;
  }

  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<ApiResponse<void>> {
    return this.fetchApi('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Events API
  async getEvents(page = 1, perPage = 50, filters?: any): Promise<ApiResponse<EventsResponse>> {
    let url = `/events?page=${page}&per_page=${perPage}`;
    
    // Add filters to URL if provided
    if (filters) {
      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
      if (filters.eventTypes && filters.eventTypes.length > 0) {
        url += `&event_types=${filters.eventTypes.join(',')}`;
      }
      if (filters.cities && filters.cities.length > 0) {
        url += `&cities=${filters.cities.join(',')}`;
      }
      if (filters.observers && filters.observers.length > 0) {
        url += `&observers=${filters.observers.join(',')}`;
      }
      if (filters.sngs && filters.sngs.length > 0) {
        url += `&sngs=${filters.sngs.join(',')}`;
      }
      if (filters.dateRange && filters.dateRange.from && filters.dateRange.to) {
        url += `&date_from=${filters.dateRange.from}&date_to=${filters.dateRange.to}`;
      }
      if (filters.sortField && filters.sortDirection) {
        url += `&sort_field=${filters.sortField}&sort_direction=${filters.sortDirection}`;
      }
    }
    
    return this.fetchApi(url);
  }

  async getEvent(id: number): Promise<ApiResponse<BackendEvent>> {
    return this.fetchApi(`/events/${id}`);
  }

  async createEvent(data: {
    date: string;
    time: string;
    event: string;
    eventType: string;
    city: string;
    venue: string;
    ob: string;
    sng: string;
  }): Promise<ApiResponse<BackendEvent>> {
    // Transform frontend data to match backend expectations
    const backendData = {
      title: data.event,
      event_date: data.date,
      event_time: data.time,
      event_type: data.eventType,
      city: data.city,
      venue: data.venue,
      observer: data.ob,
      sng: data.sng,
    };



    return this.fetchApi('/events', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  }

  async updateEvent(id: number, event: Partial<CreateEventRequest>): Promise<ApiResponse<BackendEvent>> {
    return this.fetchApi(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: number): Promise<ApiResponse<void>> {
    return this.fetchApi(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async updateEventStatus(id: number, status: string): Promise<ApiResponse<BackendEvent>> {
    return this.fetchApi(`/events/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getEventCalendar(startDate?: string, endDate?: string): Promise<ApiResponse<BackendEvent[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return this.fetchApi(`/calendar?${params.toString()}`);
  }

  // Dashboard API
  async getDashboardData(): Promise<ApiResponse<{
    eventTypes: any[];
    cities: any[];
    venues: any[];
    observers: any[];
    sngs: any[];
  }>> {
    return this.fetchApi('/dashboard/data');
  }

  async getDashboardCalendar(): Promise<ApiResponse<BackendEvent[]>> {
    return this.fetchApi('/dashboard/calendar');
  }

  // Supporting APIs
  async getEventTypes(): Promise<ApiResponse<Array<{ id: number; name: string; }>>> {
    return this.fetchApi('/event-types');
  }

  async getVenues(): Promise<ApiResponse<Array<{ id: number; name: string; city_id: number; }>>> {
    return this.fetchApi('/venues');
  }

  async getObservers(): Promise<ApiResponse<Array<{ id: number; name: string; }>>> {
    return this.fetchApi('/observers');
  }

  // EventType CRUD operations
  async createEventType(data: { name: string; code: string; description?: string; color: string }): Promise<ApiResponse<{ id: number; name: string; color: string }>> {
    return this.fetchApi('/event-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEventType(id: number, data: Partial<{ name: string; description: string; color: string }>): Promise<ApiResponse<{ id: number; name: string; color: string }>> {
    return this.fetchApi(`/event-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEventType(id: number): Promise<ApiResponse<void>> {
    return this.fetchApi(`/event-types/${id}`, {
      method: 'DELETE',
    });
  }

  // Venue CRUD operations  
  async createVenue(data: { name: string; city_id: number; address?: string; capacity?: number }): Promise<ApiResponse<{ id: number; name: string; }>> {
    return this.fetchApi('/venues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVenue(id: number, data: Partial<{ name: string; address?: string; capacity?: number }>): Promise<ApiResponse<{ id: number; name: string; }>> {
    return this.fetchApi(`/venues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVenue(id: number): Promise<ApiResponse<void>> {
    return this.fetchApi(`/venues/${id}`, {
      method: 'DELETE',
    });
  }

  // Observer CRUD operations
  async createObserver(data: { code: string }): Promise<ApiResponse<{ id: number; code: string; name: string; }>> {
    return this.fetchApi('/observers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateObserver(id: number, data: { code: string }): Promise<ApiResponse<{ id: number; code: string; name: string; }>> {
    return this.fetchApi(`/observers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteObserver(id: number): Promise<ApiResponse<void>> {
    return this.fetchApi(`/observers/${id}`, {
      method: 'DELETE',
    });
  }

  // SNG CRUD operations
  async getSngs(): Promise<ApiResponse<Array<{ id: number; name: string; }>>> {
    return this.fetchApi('/sngs');
  }

  async createSng(data: { code: string }): Promise<ApiResponse<{ id: number; code: string; name: string; }>> {
    return this.fetchApi('/sngs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSng(id: number, data: { code: string }): Promise<ApiResponse<{ id: number; code: string; name: string; }>> {
    return this.fetchApi(`/sngs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSng(id: number): Promise<ApiResponse<void>> {
    return this.fetchApi(`/sngs/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }

  // Add convenience methods for direct use
  async get(endpoint: string) {
    return this.fetchApi(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any) {
    return this.fetchApi(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put(endpoint: string, data?: any) {
    return this.fetchApi(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete(endpoint: string) {
    return this.fetchApi(endpoint, { method: 'DELETE' });
  }

  // Guest API methods (public access, no authentication required)
  private async fetchGuestApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/guest${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Guest API Error:', error);
      if (error.response) {
        throw error;
      }
      const wrappedError: any = new Error(error.message || 'Network error');
      wrappedError.response = { data: { message: error.message } };
      throw wrappedError;
    }
  }

  async getGuestEvents(page = 1, perPage = 50, filters?: any): Promise<ApiResponse<EventsResponse>> {
    let url = `/events?page=${page}&per_page=${perPage}`;
    
    // Add filters to URL if provided
    if (filters) {
      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
      if (filters.eventTypes && filters.eventTypes.length > 0) {
        url += `&event_types=${filters.eventTypes.join(',')}`;
      }
      if (filters.cities && filters.cities.length > 0) {
        url += `&cities=${filters.cities.join(',')}`;
      }
      if (filters.observers && filters.observers.length > 0) {
        url += `&observers=${filters.observers.join(',')}`;
      }
      if (filters.dateRange && filters.dateRange.from && filters.dateRange.to) {
        url += `&date_from=${filters.dateRange.from}&date_to=${filters.dateRange.to}`;
      }
      if (filters.sortField && filters.sortDirection) {
        url += `&sort_field=${filters.sortField}&sort_direction=${filters.sortDirection}`;
      }
    }
    
    return this.fetchGuestApi(url);
  }

  async getGuestDashboardData(): Promise<ApiResponse<{
    eventTypes: any[];
    cities: any[];
    venues: any[];
    observers: any[];
  }>> {
    return this.fetchGuestApi('/dashboard/data');
  }

  async getGuestEventCalendar(startDate?: string, endDate?: string): Promise<ApiResponse<BackendEvent[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return this.fetchGuestApi(`/calendar?${params.toString()}`);
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient();

// Users API
export const getUsers = async (page = 1, perPage = 10, filters?: any): Promise<any> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString()
  });

  if (filters?.search) params.append('search', filters.search);
  if (filters?.role_id) params.append('role_id', filters.role_id.toString());
  if (filters?.status) params.append('status', filters.status);

  return apiClient.get(`/users?${params.toString()}`);
};

export const createUser = async (userData: any): Promise<any> => {
  return apiClient.post('/users', userData);
};

export const updateUser = async (id: number, userData: any): Promise<any> => {
  return apiClient.put(`/users/${id}`, userData);
};

export const deleteUser = async (id: number): Promise<any> => {
  return apiClient.delete(`/users/${id}`);
};

export const getUserById = async (id: number): Promise<any> => {
  return apiClient.get(`/users/${id}`);
};

// Roles API
export const getRoles = async (page = 1, perPage = 10, filters?: any): Promise<any> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString()
  });

  if (filters?.search) params.append('search', filters.search);
  if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

  return apiClient.get(`/roles?${params.toString()}`);
};

export const getAllRoles = async (): Promise<any> => {
  return apiClient.get('/roles-all');
};

export const createRole = async (roleData: any): Promise<any> => {
  return apiClient.post('/roles', roleData);
};

export const updateRole = async (id: number, roleData: any): Promise<any> => {
  return apiClient.put(`/roles/${id}`, roleData);
};

export const deleteRole = async (id: number): Promise<any> => {
  return apiClient.delete(`/roles/${id}`);
};

export const getRoleById = async (id: number): Promise<any> => {
  return apiClient.get(`/roles/${id}`);
};

// Permissions API
export const getPermissions = async (): Promise<any> => {
  return apiClient.get('/permissions');
};

export const getPermissionsByCategory = async (): Promise<any> => {
  return apiClient.get('/permissions/by-category');
};

  // User permissions
export const updateUserPermissions = async (userId: number, permissionIds: number[]): Promise<any> => {
  return apiClient.put(`/users/${userId}/permissions`, { permission_ids: permissionIds });
};

// Activity Logs API
export const getActivityLogs = async (page = 1, perPage = 20, filters?: any): Promise<any> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString()
  });

  if (filters?.action) params.append('action', filters.action);
  if (filters?.model_type) params.append('model_type', filters.model_type);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.search) params.append('search', filters.search);

  return apiClient.get(`/activity-logs?${params.toString()}`);
};

export const getAllActivityLogs = async (page = 1, perPage = 20, filters?: any): Promise<any> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString()
  });

  if (filters?.user_id) params.append('user_id', filters.user_id.toString());
  if (filters?.action) params.append('action', filters.action);
  if (filters?.model_type) params.append('model_type', filters.model_type);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  return apiClient.get(`/activity-logs/all?${params.toString()}`);
};

export const getActivityStats = async (filters?: any): Promise<any> => {
  const params = new URLSearchParams();

  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  return apiClient.get(`/activity-logs/stats?${params.toString()}`);
};

