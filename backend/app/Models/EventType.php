<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'color',
        'is_active',
        'settings'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array'
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function getActiveEventsAttribute()
    {
        return $this->events()->where('status', '!=', 'cancelled')->count();
    }
}