<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $languages = [
            [
                'name' => 'Spanish',
                'code' => 'es',
                'flag_icon' => '🇪🇸',
                'is_active' => true,
            ],
            [
                'name' => 'French',
                'code' => 'fr',
                'flag_icon' => '🇫🇷',
                'is_active' => true,
            ],
            [
                'name' => 'German',
                'code' => 'de',
                'flag_icon' => '🇩🇪',
                'is_active' => true,
            ],
            [
                'name' => 'Italian',
                'code' => 'it',
                'flag_icon' => '🇮🇹',
                'is_active' => true,
            ],
            [
                'name' => 'Portuguese',
                'code' => 'pt',
                'flag_icon' => '🇵🇹',
                'is_active' => true,
            ],
            [
                'name' => 'Japanese',
                'code' => 'ja',
                'flag_icon' => '🇯🇵',
                'is_active' => true,
            ],
            [
                'name' => 'Korean',
                'code' => 'ko',
                'flag_icon' => '🇰🇷',
                'is_active' => true,
            ],
            [
                'name' => 'Chinese',
                'code' => 'zh',
                'flag_icon' => '🇨🇳',
                'is_active' => true,
            ],
            [
                'name' => 'Arabic',
                'code' => 'ar',
                'flag_icon' => '🇸🇦',
                'is_active' => true,
            ],
            [
                'name' => 'Russian',
                'code' => 'ru',
                'flag_icon' => '🇷🇺',
                'is_active' => true,
            ],
        ];

        foreach ($languages as $language) {
            Language::updateOrCreate(
                ['code' => $language['code']],
                $language
            );
        }
    }
}
