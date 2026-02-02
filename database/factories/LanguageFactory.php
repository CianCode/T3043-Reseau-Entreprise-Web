<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Language>
 */
class LanguageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $languages = [
            ['name' => 'Spanish', 'code' => 'es', 'flag_icon' => '🇪🇸'],
            ['name' => 'French', 'code' => 'fr', 'flag_icon' => '🇫🇷'],
            ['name' => 'German', 'code' => 'de', 'flag_icon' => '🇩🇪'],
            ['name' => 'Italian', 'code' => 'it', 'flag_icon' => '🇮🇹'],
            ['name' => 'Portuguese', 'code' => 'pt', 'flag_icon' => '🇵🇹'],
            ['name' => 'Japanese', 'code' => 'ja', 'flag_icon' => '🇯🇵'],
            ['name' => 'Chinese', 'code' => 'zh', 'flag_icon' => '🇨🇳'],
            ['name' => 'Korean', 'code' => 'ko', 'flag_icon' => '🇰🇷'],
        ];

        $language = fake()->randomElement($languages);

        return [
            'name' => $language['name'],
            'code' => $language['code'].fake()->unique()->randomNumber(3),
            'flag_icon' => $language['flag_icon'],
            'is_active' => true,
        ];
    }
}
