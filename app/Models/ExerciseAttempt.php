<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExerciseAttempt extends Model
{
    /** @use HasFactory<\Database\Factories\ExerciseAttemptFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'exercise_id',
        'score',
        'max_score',
        'is_passed',
        'answers',
        'attempt_number',
    ];

    protected function casts(): array
    {
        return [
            'is_passed' => 'boolean',
            'answers' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}
