export interface Event {
  id: string;
  date: string;
  time: string;
  event: string;
  eventType: string;
  city: string;
  venue: string;
  ob: string;
  sng?: string;
  generator?: string;
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