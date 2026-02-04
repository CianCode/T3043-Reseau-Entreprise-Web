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
        Schema::create('exercise_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
            $table->decimal('score', 5, 2);
            $table->decimal('max_score', 5, 2);
            $table->boolean('is_passed')->default(false);
            $table->json('answers');
            $table->integer('attempt_number')->default(1);
            $table->timestamps();

            $table->index('user_id');
            $table->index('exercise_id');
            $table->index(['user_id', 'exercise_id', 'attempt_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercise_attempts');
    }
};
