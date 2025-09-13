export interface EventType {
  id?: number;
  code?: string;
  name: string;
  description?: string;
  color?: string;
  is_active?: boolean;
  settings?: any;
}

export interface City {
  id?: number;
  name: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  is_active?: boolean;
}

export interface Venue {
  id?: number;
  name: string;
  city_id?: number;
  address?: string;
  capacity?: number;
}

export interface Observer {
  id?: number;
  code?: string;
  value?: string;
}

export interface Sng {
  id?: number;
  code?: string;
  name?: string;
  value?: string;
}

export interface Generator {
  id?: number;
  code?: string;
  name?: string;
  value?: string;
}

export interface Event {
  id: string;
  date: string;
  time: string;
  event: string;
  // Backend field names (for API compatibility)
  title?: string;
  event_date?: string;
  event_time?: string;
  event_type?: string | EventType;
  // Support both formats for eventType
  eventType?: string | EventType;
  city?: string | City;
  venue?: string | Venue;
  ob: string;
  sng?: string | Sng;
  generator?: string | Generator;
  // New many-to-many relationships
  observers?: Observer[];
  sngs?: Sng[];
  generators?: Generator[];
  // Backward compatibility for single relationships
  observer?: Observer;
  createdAt: string;
  updatedAt: string;
}

export interface DropdownOption {
  id: string;
  value: string;
  label: string;
  color?: string;
}

export interface DropdownConfig {
  eventTypes: DropdownOption[];
  cities: DropdownOption[];
  venues: DropdownOption[];
  obs: DropdownOption[];
  sngs?: DropdownOption[];
  generators?: DropdownOption[];
}

export type ViewMode = 'table' | 'monthly' | 'weekly';