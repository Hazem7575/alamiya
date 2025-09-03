<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'event_date',
        'event_time',
        'event_type_id',
        'city_id',
        'venue_id',
        'observer_id',
        'sng_id',
        'generator_id',
        'created_by',
        'description',
        'status',
        'teams',
        'metadata'
    ];

    protected $casts = [
        'event_date' => 'date',
        'event_time' => 'datetime:H:i',
        'teams' => 'array',
        'metadata' => 'array'
    ];

    public function eventType(): BelongsTo
    {
        return $this->belongsTo(EventType::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function observer(): BelongsTo
    {
        return $this->belongsTo(Observer::class);
    }

    public function sng(): BelongsTo
    {
        return $this->belongsTo(Sng::class);
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(Generator::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getFormattedDateTimeAttribute(): string
    {
        return $this->event_date->format('Y-m-d') . ' ' . $this->event_time->format('H:i');
    }

    public function isUpcoming(): bool
    {
        return $this->event_date >= now()->toDateString() && $this->status === 'scheduled';
    }

    public function isToday(): bool
    {
        return $this->event_date->isToday();
    }

    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', now()->toDateString())
                    ->where('status', 'scheduled');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('event_date', [$startDate, $endDate]);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Broadcasting is handled in EventController for better reliability
}