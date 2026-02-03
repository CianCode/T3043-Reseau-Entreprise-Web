<?php

use App\Models\Course;
use App\Models\Language;
use App\Models\User;

test('teacher can view dashboard with course statistics', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $language = Language::factory()->create();

    $publishedCourse = Course::factory()->create([
        'teacher_id' => $teacher->id,
        'language_id' => $language->id,
        'is_published' => true,
    ]);

    $draftCourse = Course::factory()->create([
        'teacher_id' => $teacher->id,
        'language_id' => $language->id,
        'is_published' => false,
    ]);

    $this->actingAs($teacher);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('stats')
        ->where('stats.totalCourses', 2)
        ->where('stats.publishedCourses', 1)
        ->where('stats.unpublishedCourses', 1)
        ->has('courses', 2)
    );
});

test('teacher can see enrolled student count for their courses', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $language = Language::factory()->create();
    $student1 = User::factory()->create(['role' => 'student']);
    $student2 = User::factory()->create(['role' => 'student']);

    $course = Course::factory()->create([
        'teacher_id' => $teacher->id,
        'language_id' => $language->id,
    ]);

    $course->enrolledStudents()->attach($student1->id, ['enrolled_at' => now()]);
    $course->enrolledStudents()->attach($student2->id, ['enrolled_at' => now()]);

    $this->actingAs($teacher);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('courses', 1)
        ->where('courses.0.enrolled_students_count', 2)
        ->where('stats.totalStudents', 2)
    );
});

test('teacher can toggle course publication status', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $language = Language::factory()->create();

    $course = Course::factory()->create([
        'teacher_id' => $teacher->id,
        'language_id' => $language->id,
        'is_published' => false,
    ]);

    $this->actingAs($teacher);

    $response = $this->patch(route('courses.update', $course), [
        'is_published' => true,
    ]);

    $response->assertRedirect();
    expect($course->fresh()->is_published)->toBeTrue();
});

test('teacher cannot update another teachers course', function () {
    $teacher1 = User::factory()->create(['role' => 'teacher']);
    $teacher2 = User::factory()->create(['role' => 'teacher']);
    $language = Language::factory()->create();

    $course = Course::factory()->create([
        'teacher_id' => $teacher1->id,
        'language_id' => $language->id,
    ]);

    $this->actingAs($teacher2);

    $response = $this->patch(route('courses.update', $course), [
        'is_published' => true,
    ]);

    $response->assertForbidden();
});

test('student cannot access teacher dashboard', function () {
    $student = User::factory()->create(['role' => 'student']);

    $this->actingAs($student);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('role', 'student')
        ->missing('stats')
        ->missing('courses')
    );
});

test('teacher dashboard shows only their own courses', function () {
    $teacher1 = User::factory()->create(['role' => 'teacher']);
    $teacher2 = User::factory()->create(['role' => 'teacher']);
    $language = Language::factory()->create();

    Course::factory()->create([
        'teacher_id' => $teacher1->id,
        'language_id' => $language->id,
    ]);

    Course::factory()->create([
        'teacher_id' => $teacher2->id,
        'language_id' => $language->id,
    ]);

    $this->actingAs($teacher1);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('courses', 1)
        ->where('courses.0.teacher_id', $teacher1->id)
    );
});
