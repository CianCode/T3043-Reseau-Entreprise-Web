<?php

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\User;

test('module progress is calculated correctly for a user', function () {
    $student = User::factory()->create(['role' => 'student']);
    $course = Course::factory()->create();
    $module = Module::factory()->create(['course_id' => $course->id]);

    // Create 5 lessons in the module
    $lessons = Lesson::factory()->count(5)->create(['module_id' => $module->id]);

    // Mark 2 lessons as completed
    LessonProgress::factory()->create([
        'user_id' => $student->id,
        'lesson_id' => $lessons[0]->id,
        'is_completed' => true,
    ]);

    LessonProgress::factory()->create([
        'user_id' => $student->id,
        'lesson_id' => $lessons[1]->id,
        'is_completed' => true,
    ]);

    $progress = $module->getProgressForUser($student->id);

    expect($progress['total'])->toBe(5)
        ->and($progress['completed'])->toBe(2)
        ->and($progress['percentage'])->toBe(40.0);
});

test('course progress is calculated correctly for a user', function () {
    $student = User::factory()->create(['role' => 'student']);
    $course = Course::factory()->create();

    // Create 2 modules with lessons
    $module1 = Module::factory()->create(['course_id' => $course->id]);
    $module2 = Module::factory()->create(['course_id' => $course->id]);

    $lessons1 = Lesson::factory()->count(3)->create(['module_id' => $module1->id]);
    $lessons2 = Lesson::factory()->count(2)->create(['module_id' => $module2->id]);

    // Complete all lessons in module 1
    foreach ($lessons1 as $lesson) {
        LessonProgress::factory()->create([
            'user_id' => $student->id,
            'lesson_id' => $lesson->id,
            'is_completed' => true,
        ]);
    }

    // Complete 1 lesson in module 2
    LessonProgress::factory()->create([
        'user_id' => $student->id,
        'lesson_id' => $lessons2[0]->id,
        'is_completed' => true,
    ]);

    $progress = $course->getProgressForUser($student->id);

    expect($progress['total'])->toBe(5)
        ->and($progress['completed'])->toBe(4)
        ->and($progress['percentage'])->toBe(80.0)
        ->and($progress['isCompleted'])->toBeFalse();
});

test('course is marked as completed when all lessons are done', function () {
    $student = User::factory()->create(['role' => 'student']);
    $course = Course::factory()->create();
    $module = Module::factory()->create(['course_id' => $course->id]);
    $lessons = Lesson::factory()->count(3)->create(['module_id' => $module->id]);

    // Complete all lessons
    foreach ($lessons as $lesson) {
        LessonProgress::factory()->create([
            'user_id' => $student->id,
            'lesson_id' => $lesson->id,
            'is_completed' => true,
        ]);
    }

    $progress = $course->getProgressForUser($student->id);

    expect($progress['percentage'])->toBe(100.0)
        ->and($progress['isCompleted'])->toBeTrue();
});

test('student can view course recap page', function () {
    $student = User::factory()->create(['role' => 'student']);
    $course = Course::factory()->create();
    $module = Module::factory()->create(['course_id' => $course->id]);
    Lesson::factory()->count(2)->create(['module_id' => $module->id]);

    $response = $this->actingAs($student)->get("/courses/{$course->id}/recap");

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('courses/recap')
            ->has('course.progress')
            ->where('course.progress.total', 2)
        );
});
