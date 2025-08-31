<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\CityDistance;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CityDistance>
 */
class CityDistanceFactory extends Factory
{
    protected $model = CityDistance::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'from_city_id' => City::factory(),
            'to_city_id' => City::factory(),
            'travel_time_hours' => $this->faker->randomFloat(2, 0.5, 24), // بين نصف ساعة و 24 ساعة
            'notes' => $this->faker->optional()->text(200),
        ];
    }

    /**
     * Configure the model factory for short distances.
     */
    public function shortDistance(): static
    {
        return $this->state(fn (array $attributes) => [
            'travel_time_hours' => $this->faker->randomFloat(2, 0.5, 4),
        ]);
    }

    /**
     * Configure the model factory for long distances.
     */
    public function longDistance(): static
    {
        return $this->state(fn (array $attributes) => [
            'travel_time_hours' => $this->faker->randomFloat(2, 8, 24),
        ]);
    }
}