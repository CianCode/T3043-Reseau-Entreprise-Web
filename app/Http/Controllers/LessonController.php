<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLessonRequest;
use App\Models\Lesson;
use App\Models\LessonContent;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LessonController extends Controller
{
    public function store(StoreLessonRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $module = Module::findOrFail($validated['module_id']);

        // Get the next order number
        $maxOrder = $module->lessons()->max('order') ?? -1;

        $lesson = Lesson::create([
            'module_id' => $validated['module_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'duration_minutes' => $validated['duration_minutes'] ?? null,
            'order' => $maxOrder + 1,
        ]);

        return redirect()->route('dashboard.module', $module)
            ->with('success', 'Lesson created successfully!');
    }

    public function destroy(Lesson $lesson): RedirectResponse
    {
        // Ensure the user owns this lesson's course
        if ($lesson->module->course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $lesson->delete();

        return redirect()->route('dashboard')
            ->with('success', 'Lesson deleted successfully!');
    }
}
