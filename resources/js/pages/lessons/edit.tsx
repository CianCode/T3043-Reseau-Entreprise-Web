import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SerializedEditorState } from 'lexical';
import { Editor } from '@/components/blocks/editor-md/editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import InputError from '@/components/input-error';
import { QuestionCard } from '@/components/question-card';
import AppLayout from '@/layouts/app-layout';
import { update } from '@/routes/lessons';

type QuestionOption = {
    id?: number;
    option_text: string;
    is_correct: boolean;
};

type Question = {
    id?: number;
    question_text: string;
    options: QuestionOption[];
};

type Exercise = {
    id: number;
    title: string;
    passing_score: number;
    questions: Question[];
};

type Lesson = {
    id: number;
    title: string;
    description?: string;
    content?: string;
    duration_minutes?: number;
    exercises?: Exercise[];
    module: {
        id: number;
        title: string;
        course: {
            id: number;
            title: string;
        };
    };
};

const defaultEditorState = {
    root: {
        children: [
            {
                children: [],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
            },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
    },
} as unknown as SerializedEditorState;

export default function EditLesson({ lesson }: { lesson: Lesson }) {
    const existingQuestions =
        lesson.exercises?.[0]?.questions.map((q) => ({
            id: q.id,
            question_text: q.question_text,
            options: q.options || [],
        })) || [];

    const { data, setData, patch, processing, errors } = useForm({
        title: lesson.title,
        description: lesson.description || '',
        content: lesson.content || '',
        duration_minutes: lesson.duration_minutes || '',
        questions: existingQuestions,
        passing_score: lesson.exercises?.[0]?.passing_score || 70,
    });

    const [editorState, setEditorState] =
        useState<SerializedEditorState>(defaultEditorState);
    const [isEditorReady, setIsEditorReady] = useState(false);

    // Initialize editor with existing content
    useEffect(() => {
        if (lesson.content) {
            try {
                const parsedContent = JSON.parse(lesson.content);
                setEditorState(parsedContent);
            } catch (e) {
                console.error('Failed to parse lesson content:', e);
            }
        }
        setIsEditorReady(true);
    }, [lesson.content]);

    // Update form data when editor changes
    useEffect(() => {
        if (isEditorReady) {
            setData('content', JSON.stringify(editorState));
        }
    }, [editorState, isEditorReady]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(update(lesson.id));
    };

    const addQuestion = () => {
        setData('questions', [
            ...data.questions,
            {
                question_text: '',
                options: [
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                ],
            },
        ]);
    };

    const updateQuestion = (index: number, question: Question) => {
        const newQuestions = [...data.questions];
        newQuestions[index] = question;
        setData('questions', newQuestions);
    };

    const removeQuestion = (index: number) => {
        setData(
            'questions',
            data.questions.filter((_, i) => i !== index),
        );
    };

    return (
        <AppLayout>
            <Head title={`Edit ${lesson.title}`} />
            <div className="mx-auto w-full max-w-[1400px] px-4 py-8">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link href={`/dashboard/module/${lesson.module.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Module
                        </Link>
                    </Button>

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">Edit Lesson</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Course: {lesson.module.course.title} → Module:{' '}
                            {lesson.module.title}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Lesson Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration_minutes">
                                    Duration (minutes)
                                </Label>
                                <Input
                                    id="duration_minutes"
                                    type="number"
                                    min="1"
                                    value={data.duration_minutes}
                                    onChange={(e) =>
                                        setData(
                                            'duration_minutes',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.duration_minutes} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Brief description of what students will learn..."
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Lesson Content
                                <span className="ml-2 text-xs text-muted-foreground">
                                    Use the rich text editor below to create
                                    your lesson. You can format text, add
                                    images, videos, code blocks, and more.
                                </span>
                            </Label>
                            <div className="min-h-[500px]">
                                {isEditorReady && (
                                    <Editor
                                        editorSerializedState={editorState}
                                        onSerializedChange={(value) =>
                                            setEditorState(value)
                                        }
                                    />
                                )}
                            </div>
                            <InputError message={errors.content} />
                        </div>

                        <Separator className="my-8" />

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold">
                                        Questions
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Add multiple choice questions to test
                                        students' understanding
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label
                                            htmlFor="passing_score"
                                            className="whitespace-nowrap"
                                        >
                                            Pass with:
                                        </Label>
                                        <Input
                                            id="passing_score"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={data.passing_score}
                                            onChange={(e) =>
                                                setData(
                                                    'passing_score',
                                                    parseInt(e.target.value) ||
                                                        70,
                                                )
                                            }
                                            className="w-20"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            %
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={addQuestion}
                                        variant="outline"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Question
                                    </Button>
                                </div>
                            </div>

                            {data.questions.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-12 text-center">
                                    <p className="mb-4 text-muted-foreground">
                                        No questions yet. Add questions to test
                                        your students.
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={addQuestion}
                                        variant="outline"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Question
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.questions.map((question, index) => (
                                        <QuestionCard
                                            key={index}
                                            question={question}
                                            index={index}
                                            onUpdate={updateQuestion}
                                            onRemove={removeQuestion}
                                            errors={errors}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-4 border-t pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    router.visit(
                                        `/dashboard/module/${lesson.module.id}`,
                                    )
                                }
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Lesson
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
