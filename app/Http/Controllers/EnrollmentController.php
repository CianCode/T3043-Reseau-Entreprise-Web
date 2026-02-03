<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class EnrollmentController extends Controller
{
    public function enroll(Request $request, Course $course): RedirectResponse
    {
        $user = $request->user();
        // Attach only if not already enrolled
        if (!$user->enrolledCourses()->where('course_id', $course->id)->exists()) {
            $user->enrolledCourses()->attach($course->id, [
                'enrolled_at' => now(),
            ]);
        }
        return redirect()->route('dashboard')->with('success', 'You are now enrolled in this course!');
    }
}
