<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venue extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'city_id',
        'address',
        'capacity',
        'latitude',
        'longitude',
        'facilities',
        'contact_info',
        'is_active',
        'image'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'facilities' => 'array',
        'contact_info' => 'array',
        'is_active' => 'boolean'
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function getUpcomingEventsAttribute()
    {
        return $this->events()
            ->where('event_date', '>=', now()->toDateString())
            ->where('status', 'scheduled')
            ->count();
    }
}