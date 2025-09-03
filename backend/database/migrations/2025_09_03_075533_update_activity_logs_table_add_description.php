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
        Schema::table('activity_logs', function (Blueprint $table) {
            // Add description column
            $table->text('description')->nullable()->after('action');
            
            // Drop old_values and new_values columns
            $table->dropColumn(['old_values', 'new_values']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            // Remove description column
            $table->dropColumn('description');
            
            // Add back old_values and new_values columns
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
        });
    }
};
