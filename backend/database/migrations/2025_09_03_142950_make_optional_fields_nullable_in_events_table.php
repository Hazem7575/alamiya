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
        Schema::table('events', function (Blueprint $table) {
            // Make optional fields nullable
            $table->foreignId('city_id')->nullable()->change();
            $table->foreignId('venue_id')->nullable()->change();
            $table->time('event_time')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Revert back to not nullable (be careful with existing data)
            $table->foreignId('city_id')->nullable(false)->change();
            $table->foreignId('venue_id')->nullable(false)->change();
            $table->time('event_time')->nullable(false)->change();
        });
    }
};
