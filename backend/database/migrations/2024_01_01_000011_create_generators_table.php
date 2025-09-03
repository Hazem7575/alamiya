<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('generators', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // GEN01, GEN02, etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('generators');
    }
};
