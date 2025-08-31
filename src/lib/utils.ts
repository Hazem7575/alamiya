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
 * Get event type badge variant using light colors
 * This replaces all the getEventTypeBadgeVariant functions in components
 */
export function getEventTypeBadgeVariant(eventType: string, eventTypeData?: any): LightBadgeColor {
  // If backend has a light color variant stored, use it
  if (eventTypeData?.color && LIGHT_BADGE_COLORS.includes(eventTypeData.color as any)) {
    return eventTypeData.color as LightBadgeColor;
  }
  
  // Otherwise use auto-generated color
  return getLightBadgeColor(eventType);
}
