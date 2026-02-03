import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    BookOpen,
    FileText,
    ClipboardList,
    Plus,
    Edit,
    MessageSquare,
    Users,
    GraduationCap,
    Eye,
    EyeOff,
} from 'lucide-react';
import { useState } from 'react';
import { CreateLessonDialog } from '@/components/create-lesson-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { update } from '@/actions/App/Http/Controllers/CourseController';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { auth, role, selectedModule, enrolledCourses, courses, stats } =
        usePage().props as any;
    const user = auth?.user;
    const [createLessonOpen, setCreateLessonOpen] = useState(false);

    const handlePublishToggle = async (
        courseId: number,
        currentStatus: boolean,
    ) => {
        router.patch(
            update({ course: courseId }).url,
            { is_published: !currentStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Success handled by backend
                },
            },
        );
    };

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
                                                        <div className="mb-2 flex items-start justify-between">
                                                            <h3 className="font-semibold">
                                                                {lesson.title}
                                                            </h3>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/lessons/${lesson.id}/edit`}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
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
                                {/* Welcome Header */}
                                <div>
                                    <h1 className="mb-2 text-2xl font-bold">
                                        Welcome back, {user?.name}!
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Here's an overview of your courses and
                                        students
                                    </p>
                                </div>

                                {/* Statistics Cards */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Total Courses
                                            </CardTitle>
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {stats?.totalCourses || 0}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Courses you've created
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Published
                                            </CardTitle>
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {stats?.publishedCourses || 0}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Visible to students
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Unpublished
                                            </CardTitle>
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {stats?.unpublishedCourses || 0}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                In draft mode
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Total Students
                                            </CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {stats?.totalStudents || 0}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Across all courses
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Courses List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold">
                                            Your Courses
                                        </h2>
                                    </div>

                                    {courses && courses.length > 0 ? (
                                        <div className="space-y-4">
                                            {courses.map((course: any) => (
                                                <Card key={course.id}>
                                                    <CardContent className="pt-6">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 space-y-1">
                                                                <div className="flex items-center gap-3">
                                                                    <h3 className="text-lg font-semibold">
                                                                        {
                                                                            course.title
                                                                        }
                                                                    </h3>
                                                                    {course.is_published ? (
                                                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30">
                                                                            Published
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/20 ring-inset dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/30">
                                                                            Draft
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {course.description ||
                                                                        'No description'}
                                                                </p>
                                                                <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                                                                    <div className="flex items-center gap-1">
                                                                        <GraduationCap className="h-4 w-4" />
                                                                        <span>
                                                                            {
                                                                                course
                                                                                    .language
                                                                                    ?.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Users className="h-4 w-4" />
                                                                        <span>
                                                                            {course.enrolled_students_count ||
                                                                                0}{' '}
                                                                            {course.enrolled_students_count ===
                                                                            1
                                                                                ? 'student'
                                                                                : 'students'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <BookOpen className="h-4 w-4" />
                                                                        <span>
                                                                            {course
                                                                                .modules
                                                                                ?.length ||
                                                                                0}{' '}
                                                                            {course
                                                                                .modules
                                                                                ?.length ===
                                                                            1
                                                                                ? 'module'
                                                                                : 'modules'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="capitalize">
                                                                        Level:{' '}
                                                                        {
                                                                            course.level
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-muted-foreground">
                                                                        Publish
                                                                    </span>
                                                                    <Switch
                                                                        checked={
                                                                            course.is_published
                                                                        }
                                                                        onCheckedChange={() =>
                                                                            handlePublishToggle(
                                                                                course.id,
                                                                                course.is_published,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={`/courses/${course.id}`}
                                                                    >
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Manage
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card>
                                            <CardContent className="py-12 text-center">
                                                <p className="text-muted-foreground">
                                                    You haven't created any
                                                    courses yet. Select a course
                                                    from the sidebar to get
                                                    started!
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Student Dashboard */}
                {role === 'student' && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="mb-2 text-2xl font-bold">
                                    Welcome back, {user?.name}!
                                </h1>
                                <p className="text-muted-foreground">
                                    Continue your learning journey
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/conversations">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Messages
                                </Link>
                            </Button>
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
