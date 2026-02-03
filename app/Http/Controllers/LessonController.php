<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLessonRequest;
use App\Http\Requests\UpdateLessonRequest;
use App\Models\Exercise;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;
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

    public function edit(Lesson $lesson): Response
    {
        // Ensure the user owns this lesson's course
        if ($lesson->module->course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $lesson->load(['module.course', 'exercises.questions.options']);

        return Inertia::render('lessons/edit', [
            'lesson' => $lesson,
        ]);
    }

    public function update(UpdateLessonRequest $request, Lesson $lesson): RedirectResponse
    {
        $validated = $request->validated();

        $lesson->update($validated);

        // Handle questions if provided
        if (isset($validated['questions'])) {
            $this->syncQuestions(
                $lesson,
                $validated['questions'],
                $validated['passing_score'] ?? null
            );
        }

        return redirect()->route('lessons.edit', $lesson)
            ->with('success', 'Lesson updated successfully!');
    }

    private function syncQuestions(Lesson $lesson, array $questionsData, ?int $passingScore = null): void
    {
        // Get or create the default exercise for this lesson
        $exercise = $lesson->exercises()->firstOrCreate(
            ['title' => 'Lesson Quiz'],
            ['instructions' => 'Answer the following questions', 'passing_score' => $passingScore ?? 70]
        );

        // Update passing score if provided
        if ($passingScore !== null) {
            $exercise->update(['passing_score' => $passingScore]);
        }

        $existingQuestionIds = [];

        foreach ($questionsData as $index => $questionData) {
            if (isset($questionData['id'])) {
                // Update existing question
                $question = $exercise->questions()->find($questionData['id']);
                if ($question) {
                    $question->update([
                        'question_text' => $questionData['question_text'],
                        'question_type' => 'multiple_choice',
                        'order' => $index,
                    ]);
                    $existingQuestionIds[] = $question->id;
                }
            } else {
                // Create new question
                $question = $exercise->questions()->create([
                    'question_text' => $questionData['question_text'],
                    'question_type' => 'multiple_choice',
                    'order' => $index,
                ]);
                $existingQuestionIds[] = $question->id;
            }

            // Sync options
            $existingOptionIds = [];
            foreach ($questionData['options'] as $optionIndex => $optionData) {
                if (isset($optionData['id'])) {
                    // Update existing option
                    $option = $question->options()->find($optionData['id']);
                    if ($option) {
                        $option->update([
                            'option_text' => $optionData['option_text'],
                            'is_correct' => $optionData['is_correct'],
                            'order' => $optionIndex,
                        ]);
                        $existingOptionIds[] = $option->id;
                    }
                } else {
                    // Create new option
                    $option = $question->options()->create([
                        'option_text' => $optionData['option_text'],
                        'is_correct' => $optionData['is_correct'],
                        'order' => $optionIndex,
                    ]);
                    $existingOptionIds[] = $option->id;
                }
            }

            // Delete removed options
            $question->options()->whereNotIn('id', $existingOptionIds)->delete();
        }

        // Delete removed questions
        $exercise->questions()->whereNotIn('id', $existingQuestionIds)->delete();
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
