<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('city_distances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_city_id')->constrained('cities')->onDelete('cascade');
            $table->foreignId('to_city_id')->constrained('cities')->onDelete('cascade');
            $table->decimal('travel_time_hours', 8, 2); // Travel time in hours
            $table->text('notes')->nullable();
            $table->timestamps();

            // Ensure unique combinations and prevent duplicate reverse pairs
            $table->unique(['from_city_id', 'to_city_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('city_distances');
    }
};