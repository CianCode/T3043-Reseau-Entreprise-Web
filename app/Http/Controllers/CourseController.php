<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseRequest;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function store(StoreCourseRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $course = Course::create([
            'teacher_id' => $request->user()->id,
            'language_id' => $validated['language_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'level' => $validated['level'],
            'thumbnail' => $validated['thumbnail'] ?? null,
            'is_published' => $validated['is_published'] ?? false,
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'Course created successfully!');
    }

    public function show(Course $course): Response
    {
        // Ensure the user owns this course
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $course->load(['modules' => function ($query) {
            $query->orderBy('order');
        }]);

        return Inertia::render('courses/show', [
            'course' => $course,
        ]);
    }
}
