<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('venues', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('city_id')->constrained('cities')->onDelete('cascade');
            $table->text('address')->nullable();
            $table->integer('capacity')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('facilities')->nullable(); // مرافق الملعب
            $table->json('contact_info')->nullable(); // معلومات الاتصال
            $table->boolean('is_active')->default(true);
            $table->string('image')->nullable();
            $table->timestamps();

            $table->index(['city_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('venues');
    }
};