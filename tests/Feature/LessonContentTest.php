<?php

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\User;

test('lesson content is saved to lesson_contents table when updating lesson', function () {
    // Create a teacher user
    $teacher = User::factory()->create(['role' => 'teacher']);

    // Create a course, module, and lesson
    $course = Course::factory()->create(['teacher_id' => $teacher->id]);
    $module = Module::factory()->create(['course_id' => $course->id]);
    $lesson = Lesson::factory()->create(['module_id' => $module->id]);

    // Simulate Lexical editor state with markdown content
    $editorState = json_encode([
        'root' => [
            'children' => [
                [
                    'type' => 'heading',
                    'tag' => 'h1',
                    'children' => [
                        ['type' => 'text', 'text' => 'Welcome to the Lesson'],
                    ],
                ],
                [
                    'type' => 'paragraph',
                    'children' => [
                        ['type' => 'text', 'text' => 'This is a '],
                        ['type' => 'text', 'text' => 'sample', 'format' => 1], // bold
                        ['type' => 'text', 'text' => ' lesson content.'],
                    ],
                ],
            ],
        ],
    ]);

    // Update the lesson with content
    $response = $this->actingAs($teacher)->patch("/lessons/{$lesson->id}", [
        'title' => 'Updated Lesson',
        'description' => 'Updated description',
        'content' => $editorState,
    ]);

    $response->assertRedirect("/lessons/{$lesson->id}/edit");

    // Assert that content was saved to lesson_contents table
    expect($lesson->contents()->count())->toBe(1);

    $lessonContent = $lesson->contents()->first();
    expect($lessonContent->content_type)->toBe('text');
    expect($lessonContent->content)->toContain('# Welcome to the Lesson');
    expect($lessonContent->content)->toContain('**sample**');
});

test('lesson with markdown content is displayed correctly on show page', function () {
    // Create a student user
    $student = User::factory()->create(['role' => 'student']);

    // Create a course, module, and lesson with content
    $course = Course::factory()->create();
    $module = Module::factory()->create(['course_id' => $course->id]);
    $lesson = Lesson::factory()->create(['module_id' => $module->id]);

    // Create lesson content with markdown
    $lesson->contents()->create([
        'content_type' => 'text',
        'content' => '# Introduction to Spanish

This lesson covers **basic greetings** and *common phrases*.

## Topics Covered
- Hello and Goodbye
- How are you?
- Basic introductions',
        'order' => 0,
    ]);

    // View the lesson
    $response = $this->actingAs($student)->get("/lessons/{$lesson->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('lessons/show')
        ->has('lesson.contents', 1)
        ->where('lesson.contents.0.content_type', 'text')
        ->where('lesson.contents.0.content', fn ($content) => str_contains($content, '# Introduction to Spanish'))
    );
});

test('empty or invalid editor content is handled gracefully', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $course = Course::factory()->create(['teacher_id' => $teacher->id]);
    $module = Module::factory()->create(['course_id' => $course->id]);
    $lesson = Lesson::factory()->create(['module_id' => $module->id]);

    // Update with empty content
    $this->actingAs($teacher)->patch("/lessons/{$lesson->id}", [
        'title' => 'Lesson with no content',
        'content' => json_encode(['root' => ['children' => []]]),
    ]);

    // Should handle gracefully without creating content
    expect($lesson->contents()->count())->toBe(0);
});
