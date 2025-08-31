<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sng extends Model
{
    use HasFactory;

    protected $fillable = [
        'code'
    ];

    protected $casts = [];

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

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function getCompletedEventsCountAttribute()
    {
        return $this->events()->where('status', 'completed')->count();
    }
}
