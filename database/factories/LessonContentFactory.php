<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LessonContent>
 */
class LessonContentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $contentType = fake()->randomElement(['text', 'video', 'audio', 'image']);
        $content = match ($contentType) {
            'text' => fake()->paragraphs(3, true),
            'video' => fake()->url().'/video.mp4',
            'audio' => fake()->url().'/audio.mp3',
            'image' => fake()->imageUrl(),
        };

        return [
            'lesson_id' => \App\Models\Lesson::factory(),
            'content_type' => $contentType,
            'content' => $content,
            'order' => fake()->numberBetween(1, 10),
        ];
    }
}
