<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventType;
use App\Models\City;
use App\Models\Venue;
use App\Models\Observer;
use App\Models\User;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample events data that matches the dashboard image
        $eventsData = [
            [
                'title' => 'Al Batin x Al Khaleej',
                'event_date' => '2025-08-25',
                'event_time' => '19:30',
                'event_type' => 'FDL',
                'city' => 'Hafar Al Batin',
                'venue' => 'Al Batin Club Stadium',
                'observer' => 'OB06',
                'description' => 'Football match between Al Batin and Al Khaleej',
            ],
            [
                'title' => 'Damac x Al Riyadh', 
                'event_date' => '2025-08-26',
                'event_time' => '21:00',
                'event_type' => 'RSL',
                'city' => 'Khamis Mushait',
                'venue' => 'Prince Sultan Bin Abdul Aziz Stadium',
                'observer' => 'OB07',
                'description' => 'Saudi Pro League match',
            ],
            [
                'title' => 'Al Wehda x Al Fateh',
                'event_date' => '2025-08-27',
                'event_time' => '18:00', 
                'event_type' => 'FDL',
                'city' => 'Makkah',
                'venue' => 'King Abdul Aziz Stadium',
                'observer' => 'OB08',
                'description' => 'First Division League match',
            ],
            [
                'title' => 'Al Hilal Women x Al Ahli Women',
                'event_date' => '2025-08-28',
                'event_time' => '15:30',
                'event_type' => 'WOMEN',
                'city' => 'Riyadh',
                'venue' => 'Prince Faisal Bin Fahd Stadium',
                'observer' => 'OB09',
                'description' => 'Women\'s football match',
            ],
            [
                'title' => 'NEOM FC x Al Orobah',
                'event_date' => '2025-08-29',
                'event_time' => '20:30',
                'event_type' => 'NEOM',
                'city' => 'NEOM',
                'venue' => 'NEOM Stadium',
                'observer' => 'OB10',
                'description' => 'NEOM league match',
            ],
            [
                'title' => 'Al Taawoun x Al Hazem',
                'event_date' => '2025-08-30',
                'event_time' => '19:15',
                'event_type' => 'FDL',
                'city' => 'Buraidah',
                'venue' => 'King Abdullah Sport City Stadium',
                'observer' => 'OB11',
                'description' => 'First Division League match',
            ],
            [
                'title' => 'Al Raed x Al Akhdoud',
                'event_date' => '2025-08-31',
                'event_time' => '22:00',
                'event_type' => 'RSL',
                'city' => 'Buraidah',
                'venue' => 'King Abdullah Sport City Stadium',
                'observer' => 'OB12',
                'description' => 'Saudi Pro League match',
            ],
            [
                'title' => 'Al Tai x Al Jubail',
                'event_date' => '2025-09-01',
                'event_time' => '17:30',
                'event_type' => 'FDL',
                'city' => 'Hail',
                'venue' => 'Prince Abdul Aziz Bin Musa\'ed Stadium',
                'observer' => 'OB13',
                'description' => 'First Division League match',
            ]
        ];

        // Get the first user as creator
        $creator = User::first();
        if (!$creator) {
            $this->command->error('No users found! Please run UserSeeder first.');
            return;
        }

        foreach ($eventsData as $eventData) {
            // Find or create event type
            $eventType = EventType::firstOrCreate(
                ['name' => $eventData['event_type']],
                [
                    'code' => strtolower($eventData['event_type']),
                    'description' => $eventData['event_type'] . ' League'
                ]
            );

            // Find or create city
            $city = City::firstOrCreate(
                ['name' => $eventData['city']],
                ['country' => 'Saudi Arabia', 'is_active' => true]
            );

            // Find or create venue
            $venue = Venue::firstOrCreate(
                ['name' => $eventData['venue']],
                [
                    'city_id' => $city->id,
                    'address' => $eventData['city'] . ', Saudi Arabia',
                    'capacity' => 30000,
                    'is_active' => true
                ]
            );

            // Find or create observer
            $observer = Observer::firstOrCreate(
                ['name' => $eventData['observer']],
                [
                    'email' => strtolower($eventData['observer']) . '@alamiya.sa',
                    'phone' => '+966501' . rand(100000, 999999),
                    'status' => 'active'
                ]
            );

            // Create event
            Event::create([
                'title' => $eventData['title'],
                'event_date' => $eventData['event_date'],
                'event_time' => $eventData['event_time'],
                'event_type_id' => $eventType->id,
                'city_id' => $city->id,
                'venue_id' => $venue->id,
                'observer_id' => $observer->id,
                'created_by' => $creator->id,
                'description' => $eventData['description'],
                'status' => 'scheduled',
                'teams' => explode(' x ', $eventData['title']),
            ]);
        }

        $this->command->info('Event data seeded successfully!');
    }
}
