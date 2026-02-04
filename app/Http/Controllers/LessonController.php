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
    /**
     * Display the specified lesson (lecture seule pour étudiants).
     */
    public function show(Lesson $lesson): Response
    {
        $user = auth()->user();

        // On charge le module, le cours, les contenus et exercices de la leçon
        $lesson->load(['module.course', 'contents', 'exercises.questions.options']);

        // Track lesson view and auto-complete for lessons without exercises
        if ($user && $user->role === 'student') {
            $progress = $lesson->progress()->firstOrCreate(
                ['user_id' => $user->id, 'lesson_id' => $lesson->id],
                ['is_completed' => false, 'attempts' => 0, 'views' => 0]
            );

            // Increment view count
            $progress->increment('views');

            // Auto-complete if no exercises and first view
            if ($lesson->exercises->count() === 0 && $progress->views === 1) {
                $progress->update([
                    'is_completed' => true,
                    'completed_at' => now(),
                ]);
            }

            // Load student's exercise attempts for this lesson
            $exerciseAttempts = $user->exerciseAttempts()
                ->whereHas('exercise', fn ($q) => $q->where('lesson_id', $lesson->id))
                ->get()
                ->groupBy('exercise_id');

            $lesson->progress = $progress;
            $lesson->exerciseAttempts = $exerciseAttempts;
        }

        return Inertia::render('lessons/show', [
            'lesson' => $lesson,
        ]);
    }

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

        $lesson->load(['module.course', 'exercises.questions.options', 'contents']);

        return Inertia::render('lessons/edit', [
            'lesson' => $lesson,
        ]);
    }

    public function update(UpdateLessonRequest $request, Lesson $lesson): RedirectResponse
    {
        $validated = $request->validated();

        // Extract content before updating lesson
        $content = $validated['content'] ?? null;
        unset($validated['content']);

        $lesson->update($validated);

        // Handle markdown content - save to lesson_contents table
        if ($content !== null) {
            $this->syncLessonContent($lesson, $content);
        }

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

    private function syncLessonContent(Lesson $lesson, string $content): void
    {
        // Parse the Lexical editor state to extract markdown
        try {
            $editorState = json_decode($content, true);
            $markdown = $this->convertLexicalToMarkdown($editorState);

            // Delete existing content and create new one
            $lesson->contents()->delete();

            if (! empty($markdown)) {
                $lesson->contents()->create([
                    'content_type' => 'text',
                    'content' => $markdown,
                    'order' => 0,
                ]);
            }
        } catch (\Exception $e) {
            // If parsing fails, save as plain text
            $lesson->contents()->delete();
            $lesson->contents()->create([
                'content_type' => 'text',
                'content' => $content,
                'order' => 0,
            ]);
        }
    }

    private function convertLexicalToMarkdown(array $editorState): string
    {
        if (! isset($editorState['root']['children'])) {
            return '';
        }

        $markdown = '';
        foreach ($editorState['root']['children'] as $node) {
            $markdown .= $this->processNode($node)."\n\n";
        }

        return trim($markdown);
    }

    private function processNode(array $node): string
    {
        $type = $node['type'] ?? '';
        $text = '';

        switch ($type) {
            case 'paragraph':
                $text = $this->processChildren($node['children'] ?? []);
                break;
            case 'heading':
                $level = $node['tag'] ?? 'h1';
                $headingLevel = (int) str_replace('h', '', $level);
                $text = str_repeat('#', $headingLevel).' '.$this->processChildren($node['children'] ?? []);
                break;
            case 'list':
                $listTag = $node['listType'] ?? 'bullet';
                $items = $node['children'] ?? [];
                foreach ($items as $index => $item) {
                    if ($listTag === 'number') {
                        $text .= ($index + 1).'. '.$this->processNode($item)."\n";
                    } else {
                        $text .= '- '.$this->processNode($item)."\n";
                    }
                }
                $text = rtrim($text);
                break;
            case 'listitem':
                $text = $this->processChildren($node['children'] ?? []);
                break;
            case 'quote':
                $quoteText = $this->processChildren($node['children'] ?? []);
                $text = '> '.str_replace("\n", "\n> ", $quoteText);
                break;
            case 'code':
                $language = $node['language'] ?? '';
                $codeText = $this->processChildren($node['children'] ?? []);
                $text = "```{$language}\n{$codeText}\n```";
                break;
            case 'text':
                $text = $node['text'] ?? '';
                // Apply formatting
                if (isset($node['format'])) {
                    $format = $node['format'];
                    if ($format & 1) { // bold
                        $text = "**{$text}**";
                    }
                    if ($format & 2) { // italic
                        $text = "*{$text}*";
                    }
                    if ($format & 8) { // code
                        $text = "`{$text}`";
                    }
                }
                break;
            case 'link':
                $url = $node['url'] ?? '';
                $linkText = $this->processChildren($node['children'] ?? []);
                $text = "[{$linkText}]({$url})";
                break;
            default:
                if (isset($node['children'])) {
                    $text = $this->processChildren($node['children']);
                }
                break;
        }

        return $text;
    }

    private function processChildren(array $children): string
    {
        $text = '';
        foreach ($children as $child) {
            $text .= $this->processNode($child);
        }

        return $text;
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
                } else {
                    // Si la question n'existe pas, on saute la synchronisation des options
                    continue;
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

            // Sync options seulement si $question n'est pas null
            if ($question) {
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
