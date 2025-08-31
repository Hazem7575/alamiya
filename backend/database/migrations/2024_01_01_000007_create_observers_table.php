<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('observers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // OB01, OB02, etc.
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('specialization')->nullable(); // تخصص المراقب
            $table->json('certifications')->nullable(); // الشهادات
            $table->enum('status', ['available', 'busy', 'inactive'])->default('available');
            $table->json('availability')->nullable(); // أوقات التوفر
            $table->decimal('rating', 3, 2)->nullable(); // تقييم من 5
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('observers');
    }
};