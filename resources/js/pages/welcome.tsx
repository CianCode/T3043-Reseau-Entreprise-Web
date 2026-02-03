import { Head, router, usePage } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function Welcome({
    canRegister = true,
    courses = [],
}: {
    canRegister?: boolean;
    courses?: Array<{
        id: number;
        title: string;
        description?: string;
        level?: string;
        language_id?: number;
        is_published?: boolean;
    }>;
}) {
    const { role } = usePage().props as any;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <Navbar canRegister={canRegister} />

            <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Hero Section */}
                <section className="flex min-h-screen items-center justify-center px-6 py-20 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-6 text-5xl leading-tight font-bold lg:text-7xl">
                            Welcome to{' '}
                            <span className="font-extrabold">BardeLingo</span>
                        </h1>
                        <p className="mb-8 text-lg text-gray-600 lg:text-xl dark:text-gray-400">
                            Your journey to mastering new languages starts here.
                            Learn, practice, and excel with our innovative
                            platform.
                        </p>
                    </div>
                </section>

                {/* Courses Browser Section */}
                {role === 'student' && (
                    <section className="px-6 py-12 lg:px-8">
                        <div className="mx-auto max-w-4xl">
                            <h2 className="mb-6 text-3xl font-bold text-center">
                                Browse Courses
                            </h2>
                            {courses.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {courses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-neutral-900 shadow-sm"
                                        >
                                            <h3 className="text-xl font-semibold mb-2">
                                                {course.title}
                                            </h3>
                                            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                                                {course.description || 'No description'}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                                <span>Level: {course.level || 'N/A'}</span>
                                                <span
                                                    className={
                                                        course.is_published
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }
                                                >
                                                    {course.is_published
                                                        ? 'Publié'
                                                        : 'Non publié'}
                                                </span>
                                            </div>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button className="rounded-full px-6 py-2 text-sm font-medium">
                                                        Start Course
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Confirmer
                                                            l'inscription
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Êtes-vous sûr de
                                                            vouloir commencer
                                                            le cours «{' '}
                                                            {course.title} » ?
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter className="flex flex-col gap-2 items-center">
                                                        <Button
                                                            onClick={() => {
                                                                router.post(
                                                                    `/courses/${course.id}/enroll`,
                                                                    {},
                                                                    {
                                                                        onSuccess: () =>
                                                                            router.visit(
                                                                                '/dashboard'
                                                                            ),
                                                                    }
                                                                );
                                                            }}
                                                            className="w-56 max-w-full"
                                                        >
                                                            Oui, commencer le cours
                                                        </Button>
                                                        <DialogClose asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="w-56 max-w-full"
                                                            >
                                                                Annuler
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground">
                                    No courses available at the moment.
                                </p>
                            )}
                        </div>
                    </section>
                )}

                {/* Contact Section */}
                <section
                    id="contact"
                    className="scroll-mt-20 px-6 py-20 lg:px-8"
                >
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="mb-6 text-4xl font-bold">
                            Get in Touch
                        </h2>
                        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                            Have questions or feedback? We'd love to hear from
                            you.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <a
                                href="mailto:contact@bardelingo.com"
                                className="inline-block rounded-full border border-[#19140035] px-8 py-3 text-sm font-medium transition-all hover:border-[#1915014a] hover:shadow-md dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                            >
                                Email Us
                            </a>
                            <a
                                href="#"
                                className="inline-block rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-all hover:shadow-lg dark:bg-white dark:text-black"
                            >
                                Join Our Community
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-[#19140035] px-6 py-8 text-center dark:border-[#3E3E3A]">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        © {new Date().getFullYear()} BardeLingo. All rights
                        reserved.
                    </p>
                </footer>
            </div>
        </>
    );
}
