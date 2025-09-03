import { useEffect } from 'react';
import echo from '@/lib/echo';
import { Event } from '@/types';

interface EventUpdatePayload {
  event: Event;
  action: 'created' | 'updated' | 'deleted';
  timestamp: string;
}

interface UseRealTimeEventsProps {
  onEventUpdate?: (payload: EventUpdatePayload) => void;
  onEventCreate?: (event: Event) => void;
  onEventDelete?: (eventId: string) => void;
}

export const useRealTimeEvents = ({
  onEventUpdate,
  onEventCreate,
  onEventDelete,
}: UseRealTimeEventsProps = {}) => {
  useEffect(() => {
    // Listen to the events channel
    const channel = echo.channel('events');
    
    // Listen for created events
    channel.listen('.event.created', (payload: EventUpdatePayload) => {
      console.log('🆕 Event created (Raw payload):', payload);
      console.log('📄 Event data:', payload.event);
      console.log('🔍 Event ID:', payload.event?.id);
      onEventUpdate?.(payload);
      onEventCreate?.(payload.event);
    });

    // Listen for updated events
    channel.listen('.event.updated', (payload: EventUpdatePayload) => {
      console.log('✏️ Event updated (Raw payload):', payload);
      console.log('📄 Event data:', payload.event);
      console.log('🔍 Event ID:', payload.event?.id);
      onEventUpdate?.(payload);
    });

    // Listen for deleted events
    channel.listen('.event.deleted', (payload: EventUpdatePayload) => {
      console.log('🗑️ Event deleted (Raw payload):', payload);
      console.log('📄 Event data:', payload.event);
      console.log('🔍 Event ID:', payload.event?.id);
      onEventUpdate?.(payload);
      onEventDelete?.(payload.event.id);
    });

    // Cleanup function
    return () => {
      echo.leaveChannel('events');
    };
  }, [onEventUpdate, onEventCreate, onEventDelete]);

  return {
    // Connection status could be added here
  };
};
