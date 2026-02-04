import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RotateCcw, TrendingUp } from 'lucide-react';

export type Question = {
    id: number;
    question_text: string;
    options: Array<{
        id: number;
        option_text: string;
        is_correct: boolean;
    }>;
};

export default function LessonExercise({ exercise }: { exercise: any }) {
    const pageProps = usePage().props as any;
    const { lesson, auth, flash } = pageProps;
    const isAuthenticated = !!auth?.user;
    const lessonProgress = lesson?.progress;
    const exerciseAttempts = lesson?.exerciseAttempts?.[exercise.id] || [];

    const [selected, setSelected] = useState<{
        [questionId: number]: number | null;
    }>({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentAttempts, setCurrentAttempts] = useState(
        lessonProgress?.attempts || 0,
    );
    const [currentBestScore, setCurrentBestScore] = useState<number | null>(
        exerciseAttempts.length > 0
            ? Math.max(...exerciseAttempts.map((a: any) => a.score))
            : null,
    );

    // Check for flash data on component mount/update
    useEffect(() => {
        if (flash?.exerciseResult && !submitted) {
            const flashResult = flash.exerciseResult;
            setResult(flashResult);
            setSubmitted(true);
            // Restore user's selected answers from flash data
            if (flashResult.userAnswers) {
                setSelected(flashResult.userAnswers);
            }
            setCurrentAttempts(flashResult.lessonProgress.attempts);
            if (flashResult.score > (currentBestScore || 0)) {
                setCurrentBestScore(flashResult.score);
            }
        }
    }, [flash]);

    const handleSelect = (questionId: number, optionId: number) => {
        if (!submitted) {
            setSelected((prev) => ({ ...prev, [questionId]: optionId }));
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);

        router.post(
            `/exercises/${exercise.id}/submit`,
            { answers: selected },
            {
                preserveScroll: true,
                preserveState: false,
                onError: (errors: any) => {
                    alert('Error submitting exercise. Please try again.');
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    const handleRetry = () => {
        setSelected({});
        setSubmitted(false);
        setResult(null);
    };

    const bestAttempt =
        exerciseAttempts.length > 0
            ? exerciseAttempts.reduce((best: any, current: any) =>
                  current.score > best.score ? current : best,
              )
            : null;

    if (!exercise.questions || exercise.questions.length === 0) {
        return (
            <p className="text-muted-foreground">
                No questions for this exercise.
            </p>
        );
    }

    const allQuestionsAnswered = exercise.questions.every(
        (q: Question) =>
            selected[q.id] !== undefined && selected[q.id] !== null,
    );

    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{exercise.title}</CardTitle>
                        {exercise.instructions && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {exercise.instructions}
                            </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                            Passing Score: {exercise.passing_score}%
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                                Attempts: {currentAttempts}
                            </div>
                            {currentBestScore !== null && (
                                <div className="flex items-center gap-1 text-xs font-medium text-primary">
                                    <TrendingUp className="h-3 w-3" />
                                    Best: {Math.round(currentBestScore)}%
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {exercise.questions.map((q: Question, idx: number) => (
                    <div key={q.id} className="mb-6">
                        <div className="mb-2 font-medium">
                            {idx + 1}. {q.question_text}
                        </div>
                        <div className="space-y-2">
                            {q.options.map((opt) => {
                                const isSelected = selected[q.id] === opt.id;
                                const isCorrect = opt.is_correct;
                                const showCorrect = submitted && isCorrect;
                                const showIncorrect =
                                    submitted && isSelected && !isCorrect;

                                let borderColor = 'border-border';
                                let bgColor = '';

                                if (submitted) {
                                    if (isCorrect) {
                                        borderColor = 'border-green-500';
                                        bgColor =
                                            'bg-green-50 dark:bg-green-950/30';
                                    } else if (isSelected) {
                                        borderColor = 'border-red-500';
                                        bgColor =
                                            'bg-red-50 dark:bg-red-950/30';
                                    }
                                } else if (isSelected) {
                                    borderColor = 'border-primary';
                                    bgColor = 'bg-primary/10';
                                }

                                return (
                                    <label
                                        key={opt.id}
                                        className={`flex items-center gap-2 rounded border p-3 transition-all ${borderColor} ${bgColor} ${submitted ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50'}`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            value={opt.id}
                                            checked={isSelected}
                                            onChange={() =>
                                                handleSelect(q.id, opt.id)
                                            }
                                            disabled={submitted}
                                            className="cursor-pointer"
                                        />
                                        <span className="flex-1">
                                            {opt.option_text}
                                        </span>
                                        {showCorrect && (
                                            <span className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-300">
                                                <CheckCircle className="h-5 w-5" />
                                                Correct
                                            </span>
                                        )}
                                        {showIncorrect && (
                                            <span className="flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300">
                                                <XCircle className="h-5 w-5" />
                                                Wrong
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="mt-6 flex items-center justify-between border-t pt-4">
                    {!isAuthenticated ? (
                        <div className="flex w-full items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                You must be logged in to submit exercises
                            </p>
                            <Button
                                onClick={() => router.visit('/login')}
                                variant="outline"
                                size="sm"
                            >
                                Log In
                            </Button>
                        </div>
                    ) : !submitted ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={!allQuestionsAnswered || isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Exercise'}
                        </Button>
                    ) : (
                        <div className="w-full space-y-4">
                            <div
                                className={`rounded-lg border-2 p-6 ${result?.isPassed ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div
                                            className={`text-2xl font-bold ${result?.isPassed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}
                                        >
                                            {result?.isPassed
                                                ? '✓ Exercise Passed!'
                                                : '✗ Exercise Not Passed'}
                                        </div>
                                        <div
                                            className={`text-xl font-semibold ${result?.isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                        >
                                            Score: {result?.correctAnswers} /{' '}
                                            {result?.totalQuestions} (
                                            {Math.round(result?.score)}%)
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>
                                                Attempt #{result?.attemptNumber}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                Passing Score:{' '}
                                                {exercise.passing_score}%
                                            </span>
                                        </div>
                                    </div>
                                    {!result?.isPassed && (
                                        <Button
                                            onClick={handleRetry}
                                            size="lg"
                                            className="gap-2"
                                        >
                                            <RotateCcw className="h-5 w-5" />
                                            Try Again
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="mb-1 text-xs text-muted-foreground">
                                        Total Attempts
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {currentAttempts}
                                    </div>
                                </div>
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="mb-1 text-xs text-muted-foreground">
                                        Best Score
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {currentBestScore !== null
                                            ? Math.round(currentBestScore)
                                            : 0}
                                        %
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
