<?php

namespace App\Http\Middleware;

use App\Models\Language;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        $sharedData = [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'exerciseResult' => $request->session()->get('exerciseResult'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];

        // Pour les enseignants
        if ($user && $user->role === 'teacher') {
            $sharedData['courses'] = $user->taughtCourses()
                ->with(['modules.lessons'])
                ->orderBy('order', 'asc')
                ->get();

            $sharedData['languages'] = Language::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code']);

            $sharedData['conversations'] = [
                'unreadCount' => \App\Models\Conversation::where('teacher_id', $user->id)
                    ->whereHas('messages', function ($query) use ($user) {
                        $query->where('is_read', false)
                            ->where('sender_id', '!=', $user->id);
                    })
                    ->count(),
            ];
        }

        // Pour les étudiants
        if ($user && $user->role === 'student') {
            $enrolledCourses = $user->enrolledCourses()
                ->with([
                    'modules.lessons.exercises',
                    'modules.lessons.progress' => function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    },
                ])
                ->orderBy('courses.order', 'asc')
                ->get(['courses.*']);

            // Calculate progress for each module
            foreach ($enrolledCourses as $course) {
                foreach ($course->modules as $module) {
                    $totalLessons = $module->lessons->count();
                    $completedLessons = 0;
                    $failedLessons = 0;

                    foreach ($module->lessons as $lesson) {
                        $progress = $lesson->progress->first();
                        $hasExercises = $lesson->exercises->count() > 0;

                        if ($hasExercises && $progress) {
                            // Lesson with exercises: check passing score
                            if ($progress->is_completed) {
                                $completedLessons++;
                            } elseif ($progress->attempts > 0) {
                                $failedLessons++;
                            }
                        } elseif (! $hasExercises && $progress && $progress->views > 0) {
                            // Lesson without exercises: completed on first view
                            $completedLessons++;
                        }
                    }

                    $percentage = $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;
                    $variant = 'neutral';

                    if ($completedLessons === $totalLessons && $totalLessons > 0) {
                        $variant = 'success';
                    } elseif ($failedLessons > 0) {
                        $variant = 'danger';
                    } elseif ($completedLessons > 0) {
                        $variant = 'success';
                    }

                    $module->progress = [
                        'percentage' => round($percentage, 1),
                        'variant' => $variant,
                        'completed' => $completedLessons,
                        'total' => $totalLessons,
                        'failed' => $failedLessons,
                    ];
                }
            }

            $sharedData['enrolledCourses'] = $enrolledCourses;

            $sharedData['conversations'] = [
                'unreadCount' => \App\Models\Conversation::where('student_id', $user->id)
                    ->whereHas('messages', function ($query) use ($user) {
                        $query->where('is_read', false)
                            ->where('sender_id', '!=', $user->id);
                    })
                    ->count(),
            ];
        }

        return $sharedData;
    }
}
