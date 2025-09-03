<?php

namespace Database\Seeders;

use App\Models\Generator;
use Illuminate\Database\Seeder;

class GeneratorSeeder extends Seeder
{
    public function run(): void
    {
        $generators = [
            ['code' => 'GEN01'],
            ['code' => 'GEN02'],
            ['code' => 'GEN03'],
            ['code' => 'GEN04'],
            ['code' => 'GEN05']
        ];

        foreach ($generators as $generator) {
            Generator::create($generator);
        }
    }
}
