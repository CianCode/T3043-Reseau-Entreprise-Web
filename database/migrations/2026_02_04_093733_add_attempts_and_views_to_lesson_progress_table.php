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
        Schema::table('lesson_progress', function (Blueprint $table) {
            $table->integer('attempts')->default(0)->after('is_completed');
            $table->integer('views')->default(0)->after('attempts');
            $table->decimal('best_score', 5, 2)->nullable()->after('views');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lesson_progress', function (Blueprint $table) {
            $table->dropColumn(['attempts', 'views', 'best_score']);
        });
    }
};
