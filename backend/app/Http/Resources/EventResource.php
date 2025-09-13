<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'event_date' => $this->event_date?->format('Y-m-d'),
            'event_time' => $this->event_time?->format('H:i'),
            'status' => $this->status,
            'teams' => $this->teams,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Related models
            'eventType' => $this->whenLoaded('eventType'),
            'city' => $this->whenLoaded('city'),
            'venue' => $this->whenLoaded('venue'),
            'creator' => $this->whenLoaded('creator'),
            
            // Many-to-many relationships
            'observers' => $this->whenLoaded('observers'),
            'sngs' => $this->whenLoaded('sngs'),
            'generators' => $this->whenLoaded('generators'),
            
            // Backward compatibility helpers
            'observer' => $this->whenLoaded('observers', function() {
                return $this->observers->first();
            }),
            'sng' => $this->whenLoaded('sngs', function() {
                return $this->sngs->first();
            }),
            'generator' => $this->whenLoaded('generators', function() {
                return $this->generators->first();
            }),
            
            // Helper attributes
            'formatted_date_time' => $this->getFormattedDateTimeAttribute(),
            'is_upcoming' => $this->isUpcoming(),
            'is_today' => $this->isToday(),
        ];
    }
}
