<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CityDistanceResource extends JsonResource
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
            'from_city_id' => $this->from_city_id,
            'to_city_id' => $this->to_city_id,
            'travel_time_hours' => (float) $this->travel_time_hours,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            
            // إدراج معلومات المدن
            'from_city' => new CityResource($this->whenLoaded('fromCity')),
            'to_city' => new CityResource($this->whenLoaded('toCity')),
            
            // معلومات إضافية
            'formatted_time' => $this->formatTravelTime(),
        ];
    }

    /**
     * Format travel time in a readable format
     */
    private function formatTravelTime(): string
    {
        $hours = floor($this->travel_time_hours);
        $minutes = round(($this->travel_time_hours - $hours) * 60);
        
        if ($hours == 0) {
            return $minutes . ' دقيقة';
        } elseif ($minutes == 0) {
            return $hours . ' ساعة';
        } else {
            return $hours . ' ساعة و ' . $minutes . ' دقيقة';
        }
    }
}