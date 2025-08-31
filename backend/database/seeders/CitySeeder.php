<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = [
            ['name' => 'الرياض', 'country' => 'السعودية', 'latitude' => 24.7136, 'longitude' => 46.6753],
            ['name' => 'جدة', 'country' => 'السعودية', 'latitude' => 21.4858, 'longitude' => 39.1925],
            ['name' => 'مكة المكرمة', 'country' => 'السعودية', 'latitude' => 21.3891, 'longitude' => 39.8579],
            ['name' => 'المدينة المنورة', 'country' => 'السعودية', 'latitude' => 24.5247, 'longitude' => 39.5692],
            ['name' => 'الدمام', 'country' => 'السعودية', 'latitude' => 26.4207, 'longitude' => 50.0888],
            ['name' => 'الخبر', 'country' => 'السعودية', 'latitude' => 26.2172, 'longitude' => 50.1971],
            ['name' => 'الطائف', 'country' => 'السعودية', 'latitude' => 21.2703, 'longitude' => 40.4158],
            ['name' => 'بريدة', 'country' => 'السعودية', 'latitude' => 26.3260, 'longitude' => 43.9750],
            ['name' => 'تبوك', 'country' => 'السعودية', 'latitude' => 28.3838, 'longitude' => 36.5550],
            ['name' => 'خميس مشيط', 'country' => 'السعودية', 'latitude' => 18.3106, 'longitude' => 42.7347],
        ];

        foreach ($cities as $city) {
            City::create($city);
        }
    }
}