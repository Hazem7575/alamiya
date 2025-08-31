<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // اسم المباراة/الحدث
            $table->date('event_date');
            $table->time('event_time');
            $table->foreignId('event_type_id')->constrained('event_types')->onDelete('cascade');
            $table->foreignId('city_id')->constrained('cities')->onDelete('cascade');
            $table->foreignId('venue_id')->constrained('venues')->onDelete('cascade');
            $table->foreignId('observer_id')->nullable()->constrained('observers')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'])->default('scheduled');
            $table->json('teams')->nullable(); // معلومات الفرق
            $table->json('metadata')->nullable(); // بيانات إضافية
            $table->timestamps();

            $table->index(['event_date', 'status']);
            $table->index(['city_id', 'event_date']);
            $table->index(['event_type_id', 'event_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};