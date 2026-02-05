<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreModuleRequest;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    public function create(Course $course): Response
    {
        // Ensure the user owns this course
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('modules/create', [
            'course' => $course,
        ]);
    }

    public function store(StoreModuleRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $course = Course::findOrFail($validated['course_id']);

        // Get the next order number
        $maxOrder = $course->modules()->max('order') ?? -1;

        $module = Module::create([
            'course_id' => $validated['course_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'order' => $maxOrder + 1,
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'Module created successfully!');
    }

    public function reorder(Request $request, Course $course): RedirectResponse
    {
        // Ensure the user owns this course
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'modules' => ['required', 'array'],
            'modules.*.id' => ['required', 'exists:modules,id'],
            'modules.*.order' => ['required', 'integer', 'min:0'],
        ]);

        // Update each module's order
        foreach ($validated['modules'] as $moduleData) {
            Module::where('id', $moduleData['id'])
                ->where('course_id', $course->id)
                ->update(['order' => $moduleData['order']]);
        }

        return back()->with('success', 'Module order updated successfully!');
    }
}
