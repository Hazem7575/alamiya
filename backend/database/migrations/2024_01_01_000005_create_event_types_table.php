<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // FDL, RSL, WOMEN, NEOM
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color')->default('#3B82F6'); // Default blue color
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable(); // Additional settings for each event type
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_types');
    }
};