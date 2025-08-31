<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'country',
        'latitude',
        'longitude',
        'is_active'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean'
    ];

    /**
     * Get distances from this city
     */
    public function distancesFrom(): HasMany
    {
        return $this->hasMany(CityDistance::class, 'from_city_id');
    }

    /**
     * Get distances to this city
     */
    public function distancesTo(): HasMany
    {
        return $this->hasMany(CityDistance::class, 'to_city_id');
    }

    /**
     * Get all distances related to this city
     */
    public function allDistances()
    {
        return CityDistance::where('from_city_id', $this->id)
            ->orWhere('to_city_id', $this->id);
    }

    /**
     * Get travel time to another city
     */
    public function getTravelTimeTo(City $toCity)
    {
        $distance = CityDistance::where(function ($query) use ($toCity) {
            $query->where('from_city_id', $this->id)
                  ->where('to_city_id', $toCity->id);
        })->orWhere(function ($query) use ($toCity) {
            $query->where('from_city_id', $toCity->id)
                  ->where('to_city_id', $this->id);
        })->first();

        return $distance ? $distance->travel_time_hours : null;
    }
}