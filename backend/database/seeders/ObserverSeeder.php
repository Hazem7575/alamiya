<?php

namespace Database\Seeders;

use App\Models\Observer;
use Illuminate\Database\Seeder;

class ObserverSeeder extends Seeder
{
    public function run(): void
    {
        $observers = [
            [
                'code' => 'OB01',
                'name' => 'أحمد محمد الأحمد',
                'email' => 'ahmed.alahmed@example.com',
                'phone' => '+966501234567',
                'specialization' => 'مراقب مباريات دوري المحترفين',
                'certifications' => ['FIFA Level 1', 'SPL Certified'],
                'status' => 'available',
                'rating' => 4.8
            ],
            [
                'code' => 'OB02',
                'name' => 'فيصل عبدالله السالم',
                'email' => 'faisal.alsalem@example.com',
                'phone' => '+966502345678',
                'specialization' => 'مراقب مباريات الدرجة الأولى',
                'certifications' => ['AFC Level 2', 'Local Certified'],
                'status' => 'available',
                'rating' => 4.6
            ],
            [
                'code' => 'OB03',
                'name' => 'محمد سعد الغامدي',
                'email' => 'mohammed.alghamdi@example.com',
                'phone' => '+966503456789',
                'specialization' => 'مراقب مباريات السيدات',
                'certifications' => ['FIFA Women Football', 'SPL Women Certified'],
                'status' => 'available',
                'rating' => 4.9
            ],
            [
                'code' => 'OB04',
                'name' => 'عبدالرحمن علي القحطاني',
                'email' => 'abdulrahman.alqahtani@example.com',
                'phone' => '+966504567890',
                'specialization' => 'مراقب مباريات عام',
                'certifications' => ['Local Certified', 'First Aid Certified'],
                'status' => 'busy',
                'rating' => 4.4
            ],
            [
                'code' => 'OB05',
                'name' => 'خالد يوسف الشهري',
                'email' => 'khalid.alshahri@example.com',
                'phone' => '+966505678901',
                'specialization' => 'مراقب مباريات الشباب',
                'certifications' => ['Youth Football Certified', 'AFC Level 1'],
                'status' => 'available',
                'rating' => 4.7
            ]
        ];

        foreach ($observers as $observer) {
            Observer::create($observer);
        }
    }
}