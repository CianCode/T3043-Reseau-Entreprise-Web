<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $data = [
            'role' => $user->role,
        ];

        // Student-specific data
        if ($user->role === 'student') {
            $enrolledCourses = $user->enrolledCourses()
                ->with(['language', 'teacher'])
                ->wherePivot('completed_at', null)
                ->get();

            $data['enrolledCourses'] = $enrolledCourses;
        }

        return Inertia::render('dashboard', $data);
    }

    public function showModule(Request $request, int $moduleId): Response
    {
        $user = $request->user();

        $module = \App\Models\Module::with(['course', 'lessons.contents', 'lessons.exercises'])
            ->findOrFail($moduleId);

        // Verify teacher owns this module's course
        if ($user->role === 'teacher' && $module->course->teacher_id !== $user->id) {
            abort(403);
        }

        return Inertia::render('dashboard', [
            'role' => $user->role,
            'selectedModule' => $module,
            'courses' => $user->role === 'teacher'
                ? $user->taughtCourses()->with(['modules.lessons'])->orderBy('order')->get()
                : null,
            'languages' => $user->role === 'teacher'
                ? Language::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code'])
                : null,
        ]);
    }
}
