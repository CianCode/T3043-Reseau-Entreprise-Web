<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => \App\Models\User::factory(),
            'teacher_id' => \App\Models\User::factory()->teacher(),
            'last_message_id' => null,
            'last_message_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ];
    }
}
