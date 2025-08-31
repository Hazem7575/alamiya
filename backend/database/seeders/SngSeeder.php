<?php

namespace Database\Seeders;

use App\Models\Sng;
use Illuminate\Database\Seeder;

class SngSeeder extends Seeder
{
    public function run(): void
    {
        $sngs = [
            ['code' => 'SNG01'],
            ['code' => 'SNG02'],
            ['code' => 'SNG03'],
            ['code' => 'SNG04'],
            ['code' => 'SNG05']
        ];

        foreach ($sngs as $sng) {
            Sng::create($sng);
        }
    }
}