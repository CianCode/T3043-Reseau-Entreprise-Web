<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserCourse>
 */
class UserCourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $enrolledAt = fake()->dateTimeBetween('-6 months', 'now');

        return [
            'user_id' => \App\Models\User::factory(),
            'course_id' => \App\Models\Course::factory(),
            'enrolled_at' => $enrolledAt,
            'progress_percentage' => fake()->numberBetween(0, 100),
            'last_accessed_at' => fake()->dateTimeBetween($enrolledAt, 'now'),
            'completed_at' => fake()->boolean(30) ? fake()->dateTimeBetween($enrolledAt, 'now') : null,
        ];
    }
}
