<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // إنشاء جدول event_observers للعلاقة many-to-many بين Events و Observers
        Schema::create('event_observers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('observer_id')->constrained('observers')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['event_id', 'observer_id']);
            $table->index(['event_id']);
            $table->index(['observer_id']);
        });

        // إنشاء جدول event_sngs للعلاقة many-to-many بين Events و SNGs
        Schema::create('event_sngs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('sng_id')->constrained('sngs')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['event_id', 'sng_id']);
            $table->index(['event_id']);
            $table->index(['sng_id']);
        });

        // إنشاء جدول event_generators للعلاقة many-to-many بين Events و Generators
        Schema::create('event_generators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('generator_id')->constrained('generators')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['event_id', 'generator_id']);
            $table->index(['event_id']);
            $table->index(['generator_id']);
        });

        // نقل البيانات الموجودة من جدول events إلى الجداول الجديدة
        
        // نقل بيانات observers
        DB::statement("
            INSERT INTO event_observers (event_id, observer_id, created_at, updated_at)
            SELECT id, observer_id, created_at, updated_at
            FROM events
            WHERE observer_id IS NOT NULL
        ");

        // نقل بيانات SNGs
        DB::statement("
            INSERT INTO event_sngs (event_id, sng_id, created_at, updated_at)
            SELECT id, sng_id, created_at, updated_at
            FROM events
            WHERE sng_id IS NOT NULL
        ");

        // نقل بيانات Generators
        DB::statement("
            INSERT INTO event_generators (event_id, generator_id, created_at, updated_at)
            SELECT id, generator_id, created_at, updated_at
            FROM events
            WHERE generator_id IS NOT NULL
        ");

        // حذف الأعمدة القديمة من جدول events
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['observer_id']);
            $table->dropForeign(['sng_id']);
            $table->dropForeign(['generator_id']);
            
            $table->dropColumn(['observer_id', 'sng_id', 'generator_id']);
        });
    }

    public function down(): void
    {
        // إعادة إضافة الأعمدة القديمة لجدول events
        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('observer_id')->nullable()->after('venue_id')->constrained('observers')->onDelete('set null');
            $table->foreignId('sng_id')->nullable()->after('observer_id')->constrained('sngs')->onDelete('set null');
            $table->foreignId('generator_id')->nullable()->after('sng_id')->constrained('generators')->onDelete('set null');
        });

        // نقل البيانات مرة أخرى إلى جدول events (أول علاقة فقط لكل event)
        DB::statement("
            UPDATE events 
            SET observer_id = (
                SELECT observer_id 
                FROM event_observers 
                WHERE event_observers.event_id = events.id 
                LIMIT 1
            )
        ");

        DB::statement("
            UPDATE events 
            SET sng_id = (
                SELECT sng_id 
                FROM event_sngs 
                WHERE event_sngs.event_id = events.id 
                LIMIT 1
            )
        ");

        DB::statement("
            UPDATE events 
            SET generator_id = (
                SELECT generator_id 
                FROM event_generators 
                WHERE event_generators.event_id = events.id 
                LIMIT 1
            )
        ");

        // حذف الجداول الجديدة
        Schema::dropIfExists('event_generators');
        Schema::dropIfExists('event_sngs');
        Schema::dropIfExists('event_observers');
    }
};
