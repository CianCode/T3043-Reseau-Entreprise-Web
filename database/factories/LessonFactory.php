<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lesson>
 */
class LessonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'module_id' => \App\Models\Module::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'order' => fake()->numberBetween(1, 30),
            'duration_minutes' => fake()->randomElement([15, 20, 30, 45, 60]),
        ];
    }
}
