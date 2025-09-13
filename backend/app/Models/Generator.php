<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Generator extends Model
{
    use HasFactory;

    protected $fillable = [
        'code'
    ];

    protected $casts = [];

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_generators', 'generator_id', 'event_id')
                    ->withTimestamps()
                    ->withPivot('id');
    }

    public function getUpcomingEventsAttribute()
    {
        return $this->events()
            ->where('event_date', '>=', now()->toDateString())
            ->where('status', 'scheduled')
            ->count();
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function getCompletedEventsCountAttribute()
    {
        return $this->events()->where('status', 'completed')->count();
    }
}
