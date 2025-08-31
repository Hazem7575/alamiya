<?php

namespace App\Console\Commands;

use App\Models\City;
use App\Models\CityDistance;
use Illuminate\Console\Command;

class GenerateMissingDistances extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'cities:generate-missing-distances 
                            {--hours=5 : Default travel time in hours for missing distances}
                            {--dry-run : Show what would be created without actually creating}';

    /**
     * The console command description.
     */
    protected $description = 'Generate missing distances between cities with default travel time';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $defaultHours = $this->option('hours');
        $dryRun = $this->option('dry-run');

        $cities = City::where('is_active', true)->get();
        $missingPairs = [];

        $this->info("Checking for missing distances between {$cities->count()} active cities...");

        foreach ($cities as $fromCity) {
            foreach ($cities as $toCity) {
                if ($fromCity->id >= $toCity->id) continue;

                $exists = CityDistance::where(function ($query) use ($fromCity, $toCity) {
                    $query->where('from_city_id', $fromCity->id)
                          ->where('to_city_id', $toCity->id);
                })->orWhere(function ($query) use ($fromCity, $toCity) {
                    $query->where('from_city_id', $toCity->id)
                          ->where('to_city_id', $fromCity->id);
                })->exists();

                if (!$exists) {
                    $missingPairs[] = [
                        'from_city_id' => $fromCity->id,
                        'to_city_id' => $toCity->id,
                        'from_city_name' => $fromCity->name,
                        'to_city_name' => $toCity->name,
                    ];
                }
            }
        }

        if (empty($missingPairs)) {
            $this->info('✅ No missing distances found!');
            return self::SUCCESS;
        }

        $this->warn("Found {count($missingPairs)} missing distance pairs:");

        foreach ($missingPairs as $pair) {
            $this->line("- {$pair['from_city_name']} ↔ {$pair['to_city_name']}");
        }

        if ($dryRun) {
            $this->info("\n🔍 Dry run mode - no distances were created");
            return self::SUCCESS;
        }

        if ($this->confirm("Create missing distances with default {$defaultHours} hours travel time?")) {
            $created = 0;
            foreach ($missingPairs as $pair) {
                CityDistance::create([
                    'from_city_id' => $pair['from_city_id'],
                    'to_city_id' => $pair['to_city_id'],
                    'travel_time_hours' => $defaultHours,
                    'notes' => 'Auto-generated with default travel time',
                ]);
                $created++;
            }

            $this->info("✅ Created {$created} missing distances with {$defaultHours} hours travel time");
        } else {
            $this->info("Operation cancelled");
        }

        return self::SUCCESS;
    }
}