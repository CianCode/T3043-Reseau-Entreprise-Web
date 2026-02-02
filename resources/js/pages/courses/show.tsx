import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FolderPlus } from 'lucide-react';
import { SortableModuleList } from '@/components/sortable-module-list';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

type Module = {
    id: number;
    title: string;
    description?: string;
    order: number;
};

type Course = {
    id: number;
    title: string;
    description?: string;
    level: string;
    modules: Module[];
};

export default function ShowCourse({ course }: { course: Course }) {
    return (
        <AppLayout>
            <Head title={`${course.title} - Manage Modules`} />
            <div className="mx-auto max-w-4xl py-8">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link href={dashboard()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">
                                {course.title}
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {course.description || 'No description'}
                            </p>
                            <div className="mt-2 text-sm text-muted-foreground">
                                Level:{' '}
                                <span className="font-medium capitalize">
                                    {course.level}
                                </span>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href={`/courses/${course.id}/modules/create`}>
                                <FolderPlus className="mr-2 h-4 w-4" />
                                Add Module
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Modules</h2>
                        <p className="text-sm text-muted-foreground">
                            Drag to reorder modules
                        </p>
                    </div>

                    {course.modules && course.modules.length > 0 ? (
                        <SortableModuleList
                            courseId={course.id}
                            initialModules={course.modules}
                        />
                    ) : (
                        <div className="rounded-lg border border-dashed p-12 text-center">
                            <p className="mb-4 text-muted-foreground">
                                No modules yet. Create your first module to get
                                started.
                            </p>
                            <Button asChild>
                                <Link
                                    href={`/courses/${course.id}/modules/create`}
                                >
                                    <FolderPlus className="mr-2 h-4 w-4" />
                                    Create First Module
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
