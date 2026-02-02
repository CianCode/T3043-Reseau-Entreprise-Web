<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'language_id' => \App\Models\Language::factory(),
            'teacher_id' => \App\Models\User::factory()->teacher(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'level' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'thumbnail' => fake()->imageUrl(640, 480, 'education'),
            'is_published' => fake()->boolean(70),
            'order' => fake()->numberBetween(1, 100),
        ];
    }
}
