<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonContent extends Model
{
    /** @use HasFactory<\Database\Factories\LessonContentFactory> */
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'content_type',
        'content',
        'order',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
