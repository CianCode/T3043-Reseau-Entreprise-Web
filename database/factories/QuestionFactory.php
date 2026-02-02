<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $questionType = fake()->randomElement(['multiple_choice', 'fill_in_blank', 'translation', 'matching']);

        return [
            'exercise_id' => \App\Models\Exercise::factory(),
            'question_type' => $questionType,
            'question_text' => fake()->sentence().'?',
            'correct_answer' => in_array($questionType, ['fill_in_blank', 'translation']) ? fake()->word() : null,
            'points' => fake()->numberBetween(1, 5),
            'order' => fake()->numberBetween(1, 20),
        ];
    }
}
