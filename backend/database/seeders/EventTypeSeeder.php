<?php

namespace Database\Seeders;

use App\Models\EventType;
use Illuminate\Database\Seeder;

class EventTypeSeeder extends Seeder
{
    public function run(): void
    {
        $eventTypes = [
            [
                'code' => 'FDL',
                'name' => 'First Division League',
                'description' => 'دوري الدرجة الأولى السعودي',
                'color' => '#3B82F6',
                'settings' => [
                    'duration_minutes' => 90,
                    'requires_observer' => true,
                    'max_teams' => 2
                ]
            ],
            [
                'code' => 'RSL',
                'name' => 'Roshn Saudi League',
                'description' => 'دوري روشن السعودي للمحترفين',
                'color' => '#10B981',
                'settings' => [
                    'duration_minutes' => 90,
                    'requires_observer' => true,
                    'max_teams' => 2,
                    'is_professional' => true
                ]
            ],
            [
                'code' => 'WOMEN',
                'name' => 'Women\'s League',
                'description' => 'دوري السيدات السعودي',
                'color' => '#F59E0B',
                'settings' => [
                    'duration_minutes' => 90,
                    'requires_observer' => true,
                    'max_teams' => 2,
                    'gender' => 'female'
                ]
            ],
            [
                'code' => 'NEOM',
                'name' => 'NEOM League',
                'description' => 'دوري نيوم',
                'color' => '#8B5CF6',
                'settings' => [
                    'duration_minutes' => 90,
                    'requires_observer' => true,
                    'max_teams' => 2,
                    'location' => 'NEOM'
                ]
            ],
            [
                'code' => 'YOUTH',
                'name' => 'Youth League',
                'description' => 'دوري الشباب',
                'color' => '#EF4444',
                'settings' => [
                    'duration_minutes' => 80,
                    'requires_observer' => true,
                    'max_teams' => 2,
                    'age_category' => 'youth'
                ]
            ]
        ];

        foreach ($eventTypes as $eventType) {
            EventType::create($eventType);
        }
    }
}