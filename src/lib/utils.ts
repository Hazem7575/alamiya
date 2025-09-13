import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Light Metronic-style color palette for badges
export const LIGHT_BADGE_COLORS = [
  'light_blue',    // Blue 50/700
  'light_green',   // Green 50/700
  'light_red',     // Red 50/700
  'light_purple',  // Purple 50/700
  'light_pink',    // Pink 50/700
  'light_orange',  // Orange 50/700
  'light_yellow',  // Yellow 50/700
  'light_teal',    // Teal 50/700
  'light_indigo',  // Indigo 50/700
  'light_cyan',    // Cyan 50/700
  'light_emerald', // Emerald 50/700
  'light_violet',  // Violet 50/700
  'light_rose',    // Rose 50/700
  'light_amber',   // Amber 50/700
  'light_slate',   // Slate 50/700
] as const;

export type LightBadgeColor = typeof LIGHT_BADGE_COLORS[number];

/**
 * Get a consistent light badge color for any string value
 * Uses a hash function to ensure same string always gets same color
 */
export function getLightBadgeColor(value: string): LightBadgeColor {
  // Handle empty, null or undefined values
  if (!value || typeof value !== 'string') {
    return 'light_blue'; // default color
  }
  
  // Simple hash function to get consistent color for same string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Get positive index
  const index = Math.abs(hash) % LIGHT_BADGE_COLORS.length;
  return LIGHT_BADGE_COLORS[index];
}

/**
 * Convert hex color to light badge color
 */
function hexToLightBadgeColor(hexColor: string): LightBadgeColor {
  // Handle invalid hex colors
  if (!hexColor || typeof hexColor !== 'string') {
    return 'light_blue';
  }
  
  // Map common hex colors to light badge colors
  const colorMap: { [key: string]: LightBadgeColor } = {
    '#3B82F6': 'light_blue',    // Blue
    '#10B981': 'light_green',   // Green
    '#EF4444': 'light_red',     // Red
    '#8B5CF6': 'light_violet',  // Purple/Violet
    '#F59E0B': 'light_amber',   // Orange/Amber
    '#06B6D4': 'light_cyan',    // Cyan
    '#14B8A6': 'light_teal',    // Teal
    '#6366F1': 'light_indigo',  // Indigo
    '#EC4899': 'light_pink',    // Pink
    '#F97316': 'light_orange',  // Orange
    '#EAB308': 'light_yellow',  // Yellow
    '#059669': 'light_emerald', // Emerald (different hex)
    '#F43F5E': 'light_rose',    // Rose
    '#64748B': 'light_slate',   // Slate
  };
  
  return colorMap[hexColor.toUpperCase()] || 'light_blue';
}

/**
 * Get event type badge variant using light colors
 * This replaces all the getEventTypeBadgeVariant functions in components
 */
export function getEventTypeBadgeVariant(eventType: string | any, eventTypeData?: any): LightBadgeColor {
  // Handle undefined or null eventType
  if (!eventType) {
    return 'light_blue'; // default color
  }
  
  // If eventType is an object, extract color and name
  if (typeof eventType === 'object' && eventType) {
    const color = eventType.color;
    const name = eventType.name || '';
    
    if (color) {
      if (LIGHT_BADGE_COLORS.includes(color as any)) {
        return color as LightBadgeColor;
      } else if (typeof color === 'string' && color.startsWith('#')) {
        return hexToLightBadgeColor(color);
      }
    }
    
    // Use name for color generation
    return getLightBadgeColor(name);
  }
  
  // If backend has a color stored, convert it to light badge color
  if (eventTypeData?.color) {
    if (LIGHT_BADGE_COLORS.includes(eventTypeData.color as any)) {
      return eventTypeData.color as LightBadgeColor;
    } else if (typeof eventTypeData.color === 'string' && eventTypeData.color.startsWith('#')) {
      return hexToLightBadgeColor(eventTypeData.color);
    }
  }
  
  // Otherwise use auto-generated color
  return getLightBadgeColor(String(eventType));
}
