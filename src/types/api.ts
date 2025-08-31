export interface City {
  id: number;
  name: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CityDistance {
  id: number;
  from_city_id: number;
  to_city_id: number;
  travel_time_hours: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  fromCity: City;
  toCity: City;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CreateCityRequest {
  name: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}

export interface CreateDistanceRequest {
  from_city_id: number;
  to_city_id: number;
  travel_time_hours: number;
  notes?: string;
}

export interface BatchUpdateDistanceRequest {
  distances: {
    from_city_id: number;
    to_city_id: number;
    travel_time_hours: number;
  }[];
}

export interface DistanceMatrix {
  cities: City[];
  matrix: (number | null)[][];
}

export interface MissingDistancePair {
  from_city: City;
  to_city: City;
}