<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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

    public function observers(): BelongsToMany
    {
        return $this->belongsToMany(Observer::class, 'event_observers', 'event_id', 'observer_id')
                    ->withTimestamps()
                    ->withPivot('id');
    }

    public function sngs(): BelongsToMany
    {
        return $this->belongsToMany(Sng::class, 'event_sngs', 'event_id', 'sng_id')
                    ->withTimestamps()
                    ->withPivot('id');
    }

    public function generators(): BelongsToMany
    {
        return $this->belongsToMany(Generator::class, 'event_generators', 'event_id', 'generator_id')
                    ->withTimestamps()
                    ->withPivot('id');
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

    // دوال مساعدة للتوافق مع الكود الموجود (backward compatibility)
    public function getObserverAttribute()
    {
        return $this->observers()->first();
    }

    public function getSngAttribute()
    {
        return $this->sngs()->first();
    }

    public function getGeneratorAttribute()
    {
        return $this->generators()->first();
    }

    // Backward compatibility for IDs
    public function getObserverIdAttribute()
    {
        $observer = $this->observers()->first();
        return $observer ? $observer->id : null;
    }

    public function getSngIdAttribute()
    {
        $sng = $this->sngs()->first();
        return $sng ? $sng->id : null;
    }

    public function getGeneratorIdAttribute()
    {
        $generator = $this->generators()->first();
        return $generator ? $generator->id : null;
    }

    // دوال للحصول على جميع العلاقات
    public function getAllObserversAttribute()
    {
        return $this->observers;
    }

    public function getAllSngsAttribute()
    {
        return $this->sngs;
    }

    public function getAllGeneratorsAttribute()
    {
        return $this->generators;
    }

    // Broadcasting is handled in EventController for better reliability
}
