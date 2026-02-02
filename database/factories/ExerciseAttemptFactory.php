<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExerciseAttempt>
 */
class ExerciseAttemptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $maxScore = fake()->numberBetween(50, 100);
        $score = fake()->numberBetween(0, $maxScore);

        return [
            'user_id' => \App\Models\User::factory(),
            'exercise_id' => \App\Models\Exercise::factory(),
            'score' => $score,
            'max_score' => $maxScore,
            'is_passed' => $score >= ($maxScore * 0.7),
            'answers' => [
                'question_1' => fake()->word(),
                'question_2' => fake()->word(),
            ],
            'attempt_number' => fake()->numberBetween(1, 3),
        ];
    }
}
