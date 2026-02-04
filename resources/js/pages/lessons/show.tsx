import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BookOpen, Clock, FileText, ClipboardList } from 'lucide-react';
import LessonExercise from '@/components/lesson-exercise';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { PageProps } from '@/types';

export default function ShowLesson({ lesson }: PageProps<{ lesson: any }>) {
    return (
        <AppLayout>
            <Head title={lesson.title} />
            <div className="w-full px-0 py-10 sm:px-4 md:px-8">
                <div className="w-full rounded-2xl border border-border bg-linear-to-br from-white/90 to-gray-50 p-8 shadow-xl transition-colors duration-300 dark:from-muted dark:to-muted-foreground/10">
                    <div className="mb-6 flex items-center gap-4">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="mb-1 text-3xl leading-tight font-bold">
                                {lesson.title}
                            </h1>
                            {lesson.module?.course?.title && (
                                <div className="text-xs font-medium text-muted-foreground">
                                    Course: {lesson.module.course.title}
                                </div>
                            )}
                        </div>
                    </div>
                    {lesson.description && (
                        <p className="mb-4 text-base text-muted-foreground italic">
                            {lesson.description}
                        </p>
                    )}
                    <div className="mb-6 flex items-center gap-4">
                        {lesson.duration_minutes && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                <Clock className="h-4 w-4" />
                                {lesson.duration_minutes} min
                            </span>
                        )}
                        {lesson.module?.title && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/20 px-3 py-1 text-xs font-medium text-secondary-foreground">
                                <FileText className="h-4 w-4" />
                                Module: {lesson.module.title}
                            </span>
                        )}
                    </div>

                    <div className="mt-8">
                        <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                            <FileText className="h-5 w-5 text-primary" />
                            Lesson Content
                        </h2>
                        {lesson.contents && lesson.contents.length > 0 ? (
                            <div className="space-y-4">
                                {lesson.contents.map(
                                    (content: any, idx: number) => (
                                        <div
                                            key={content.id}
                                            className="rounded-lg border border-border bg-linear-to-br from-muted/60 to-white/80 p-6 transition-colors duration-300 hover:shadow-md dark:from-muted/80 dark:to-muted-foreground/10"
                                        >
                                            <div className="prose prose-sm max-w-none md:prose-base dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:border prose-pre:border-border prose-pre:bg-muted">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeRaw]}
                                                >
                                                    {content.content ||
                                                        'No content available'}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                No content available.
                            </p>
                        )}
                    </div>

                    {lesson.exercises && lesson.exercises.length > 0 && (
                        <div className="mt-10">
                            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                                <ClipboardList className="h-5 w-5 text-primary" />
                                Exercises
                            </h2>
                            <div className="space-y-6">
                                {lesson.exercises.map((exercise: any) => (
                                    <LessonExercise
                                        key={exercise.id}
                                        exercise={exercise}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
