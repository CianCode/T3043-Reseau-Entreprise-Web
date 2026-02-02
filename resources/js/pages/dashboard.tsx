import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, FileText, ClipboardList, Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateLessonDialog } from '@/components/create-lesson-dialog';
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { auth, role, selectedModule, enrolledCourses } = usePage()
        .props as any;
    const user = auth?.user;
    const [createLessonOpen, setCreateLessonOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Teacher Dashboard */}
                {role === 'teacher' && (
                    <>
                        {selectedModule ? (
                            <div className="space-y-6">
                                {/* Module Header */}
                                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                                    <div className="mb-2 flex items-center gap-3">
                                        <BookOpen className="h-6 w-6 text-primary" />
                                        <h1 className="text-2xl font-bold">
                                            {selectedModule.title}
                                        </h1>
                                    </div>
                                    <p className="text-muted-foreground">
                                        {selectedModule.description ||
                                            'No description available'}
                                    </p>
                                    <div className="mt-4 text-sm text-muted-foreground">
                                        Course:{' '}
                                        <span className="font-medium">
                                            {selectedModule.course?.title}
                                        </span>
                                    </div>
                                </div>

                                {/* Lessons */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                                            <FileText className="h-5 w-5" />
                                            Lessons
                                        </h2>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setCreateLessonOpen(true)
                                            }
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Lesson
                                        </Button>
                                    </div>
                                    {selectedModule.lessons &&
                                    selectedModule.lessons.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {selectedModule.lessons.map(
                                                (lesson: any) => (
                                                    <div
                                                        key={lesson.id}
                                                        className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                                                    >
                                                        <div className="mb-2">
                                                            <h3 className="font-semibold">
                                                                {lesson.title}
                                                            </h3>
                                                        </div>
                                                        <p className="mb-3 text-sm text-muted-foreground">
                                                            {lesson.description ||
                                                                'No description'}
                                                        </p>
                                                        {lesson.duration_minutes && (
                                                            <div className="text-xs text-muted-foreground">
                                                                Duration:{' '}
                                                                {
                                                                    lesson.duration_minutes
                                                                }{' '}
                                                                minutes
                                                            </div>
                                                        )}
                                                        {lesson.contents &&
                                                            lesson.contents
                                                                .length > 0 && (
                                                                <div className="mt-2 text-xs text-muted-foreground">
                                                                    {
                                                                        lesson
                                                                            .contents
                                                                            .length
                                                                    }{' '}
                                                                    content
                                                                    item(s)
                                                                </div>
                                                            )}
                                                        {lesson.exercises &&
                                                            lesson.exercises
                                                                .length > 0 && (
                                                                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <ClipboardList className="h-3 w-3" />
                                                                    {
                                                                        lesson
                                                                            .exercises
                                                                            .length
                                                                    }{' '}
                                                                    exercise(s)
                                                                </div>
                                                            )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-sidebar-border/70 p-8 text-center dark:border-sidebar-border">
                                            <p className="text-muted-foreground">
                                                No lessons in this module yet
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h1 className="mb-2 text-2xl font-bold">
                                        Welcome back, {user?.name}!
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Select a module from the sidebar to view
                                        its content
                                    </p>
                                </div>
                                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                    </div>
                                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                    </div>
                                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Student Dashboard */}
                {role === 'student' && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="mb-2 text-2xl font-bold">
                                Welcome back, {user?.name}!
                            </h1>
                            <p className="text-muted-foreground">
                                Continue your learning journey
                            </p>
                        </div>

                        {enrolledCourses && enrolledCourses.length > 0 ? (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">
                                    Your Courses
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {enrolledCourses.map((course: any) => (
                                        <div
                                            key={course.id}
                                            className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                                        >
                                            <h3 className="mb-2 font-semibold">
                                                {course.title}
                                            </h3>
                                            <p className="mb-3 text-sm text-muted-foreground">
                                                {course.description ||
                                                    'No description'}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>
                                                    {course.language?.name}
                                                </span>
                                                <span>
                                                    Level: {course.level}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-sidebar-border/70 p-8 text-center dark:border-sidebar-border">
                                <p className="text-muted-foreground">
                                    You're not enrolled in any courses yet.
                                    Browse available courses to get started!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Admin Dashboard */}
                {role === 'admin' && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="mb-2 text-2xl font-bold">
                                Admin Dashboard
                            </h1>
                            <p className="text-muted-foreground">
                                Manage your language learning platform
                            </p>
                        </div>
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Lesson Dialog */}
            {selectedModule && (
                <CreateLessonDialog
                    open={createLessonOpen}
                    onOpenChange={setCreateLessonOpen}
                    moduleId={selectedModule.id}
                    moduleTitle={selectedModule.title}
                />
            )}
        </AppLayout>
    );
}
