<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $isRead = fake()->boolean(70);

        return [
            'conversation_id' => \App\Models\Conversation::factory(),
            'sender_id' => \App\Models\User::factory(),
            'message' => fake()->paragraph(),
            'is_read' => $isRead,
            'read_at' => $isRead ? fake()->dateTimeBetween('-1 week', 'now') : null,
        ];
    }
}
