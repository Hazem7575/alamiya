<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CityDistance extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_city_id',
        'to_city_id',
        'travel_time_hours',
        'notes'
    ];

    protected $casts = [
        'travel_time_hours' => 'decimal:2'
    ];

    /**
     * Get the from city
     */
    public function fromCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'from_city_id');
    }

    /**
     * Get the to city
     */
    public function toCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'to_city_id');
    }

    /**
     * Boot method to add model events
     */
    protected static function boot()
    {
        parent::boot();

        // Prevent saving if from_city_id equals to_city_id
        static::saving(function ($model) {
            if ($model->from_city_id === $model->to_city_id) {
                throw new \Exception('Cannot create distance between the same city');
            }
        });
    }
}