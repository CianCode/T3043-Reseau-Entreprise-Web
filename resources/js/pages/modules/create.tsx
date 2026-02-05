import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { store } from '@/routes/modules';

type Course = {
    id: number;
    title: string;
    description?: string;
    level: string;
};

export default function CreateModule({ course }: { course: Course }) {
    return (
        <AppLayout>
            <Head title={`Create Module - ${course.title}`} />
            <div className="mx-auto max-w-2xl py-8">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link href={`/courses/${course.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Course
                        </Link>
                    </Button>

                    <h1 className="text-3xl font-bold">Create New Module</h1>
                    <p className="mt-2 text-muted-foreground">
                        Add a new module to {course.title}
                    </p>
                </div>

                <Form
                    method={store().method}
                    action={store().url}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="course_id"
                                value={course.id}
                            />

                            <div>
                                <Label htmlFor="title">Module Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    className="mt-1"
                                    placeholder="Introduction to the Language"
                                    autoFocus
                                    required
                                />
                                <InputError
                                    message={errors.title}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    className="mt-1"
                                    rows={4}
                                    placeholder="A brief overview of what students will learn in this module..."
                                />
                                <InputError
                                    message={errors.description}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    )}
                                    <Save className="mr-2 h-4 w-4" />
                                    Create Module
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    asChild
                                    disabled={processing}
                                >
                                    <Link href={`/courses/${course.id}`}>
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
