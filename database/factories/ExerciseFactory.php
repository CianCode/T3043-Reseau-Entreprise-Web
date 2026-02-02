<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Exercise>
 */
class ExerciseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lesson_id' => \App\Models\Lesson::factory(),
            'title' => fake()->sentence(4),
            'instructions' => fake()->paragraph(),
            'passing_score' => fake()->randomElement([60, 70, 80]),
            'order' => fake()->numberBetween(1, 10),
        ];
    }
}
