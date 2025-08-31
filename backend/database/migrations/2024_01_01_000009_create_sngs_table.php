<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sngs', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // SNG01, SNG02, etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sngs');
    }
};
