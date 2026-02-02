<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LessonProgress>
 */
class LessonProgressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $isCompleted = fake()->boolean(60);

        return [
            'user_id' => \App\Models\User::factory(),
            'lesson_id' => \App\Models\Lesson::factory(),
            'is_completed' => $isCompleted,
            'completed_at' => $isCompleted ? fake()->dateTimeBetween('-3 months', 'now') : null,
        ];
    }
}
