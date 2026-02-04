<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseRecapController extends Controller
{
    public function show(Request $request, Course $course): Response
    {
        $user = $request->user();

        // Load course with relationships
        $course->load(['language', 'teacher', 'modules.lessons']);

        // Calculate progress for the student
        $progress = $course->getProgressForUser($user->id);

        return Inertia::render('courses/recap', [
            'course' => array_merge($course->toArray(), [
                'progress' => $progress,
            ]),
        ]);
    }
}
