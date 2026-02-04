<?php

use App\Models\Exercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\User;

test('student can submit an exercise attempt', function () {
    $student = User::factory()->create(['role' => 'student']);
    $teacher = User::factory()->create(['role' => 'teacher']);
    $module = Module::factory()->create();
    $lesson = Lesson::factory()->create(['module_id' => $module->id]);
    $exercise = Exercise::factory()->create([
        'lesson_id' => $lesson->id,
        'passing_score' => 70,
    ]);

    $question = Question::factory()->create(['exercise_id' => $exercise->id]);
    $correctOption = QuestionOption::factory()->create([
        'question_id' => $question->id,
        'is_correct' => true,
    ]);
    $wrongOption = QuestionOption::factory()->create([
        'question_id' => $question->id,
        'is_correct' => false,
    ]);

    $response = $this->actingAs($student)->postJson("/exercises/{$exercise->id}/submit", [
        'answers' => [$question->id => $correctOption->id],
    ]);

    $response->assertSuccessful();
    $response->assertJson([
        'success' => true,
        'isPassed' => true,
        'score' => 100,
    ]);

    $this->assertDatabaseHas('exercise_attempts', [
        'user_id' => $student->id,
        'exercise_id' => $exercise->id,
        'is_passed' => true,
    ]);

    $this->assertDatabaseHas('lesson_progress', [
        'user_id' => $student->id,
        'lesson_id' => $lesson->id,
        'is_completed' => true,
        'attempts' => 1,
    ]);
});

test('lesson progress tracks multiple attempts', function () {
    $student = User::factory()->create(['role' => 'student']);
    $module = Module::factory()->create();
    $lesson = Lesson::factory()->create(['module_id' => $module->id]);
    $exercise = Exercise::factory()->create([
        'lesson_id' => $lesson->id,
        'passing_score' => 70,
    ]);

    $question = Question::factory()->create(['exercise_id' => $exercise->id]);
    $correctOption = QuestionOption::factory()->create([
        'question_id' => $question->id,
        'is_correct' => true,
    ]);
    $wrongOption = QuestionOption::factory()->create([
        'question_id' => $question->id,
        'is_correct' => false,
    ]);

    // First attempt - fail
    $this->actingAs($student)->postJson("/exercises/{$exercise->id}/submit", [
        'answers' => [$question->id => $wrongOption->id],
    ]);

    // Second attempt - pass
    $this->actingAs($student)->postJson("/exercises/{$exercise->id}/submit", [
        'answers' => [$question->id => $correctOption->id],
    ]);

    $lessonProgress = LessonProgress::where('user_id', $student->id)
        ->where('lesson_id', $lesson->id)
        ->first();

    expect($lessonProgress->attempts)->toBe(2);
    expect($lessonProgress->is_completed)->toBeTrue();
    expect((float) $lessonProgress->best_score)->toBe(100.0);
});

test('lesson without exercises is auto-completed on first view', function () {
    $student = User::factory()->create(['role' => 'student']);
    $module = Module::factory()->create();
    $lesson = Lesson::factory()->create(['module_id' => $module->id]);

    $this->actingAs($student)->get("/lessons/{$lesson->id}");

    $lessonProgress = LessonProgress::where('user_id', $student->id)
        ->where('lesson_id', $lesson->id)
        ->first();

    expect($lessonProgress)->not->toBeNull();
    expect($lessonProgress->views)->toBe(1);
    expect($lessonProgress->is_completed)->toBeTrue();
});
