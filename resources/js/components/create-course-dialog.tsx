import { Form, router } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/routes/courses';

type Language = {
    id: number;
    name: string;
    code: string;
};

type CreateCourseDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    languages: Language[];
};

export function CreateCourseDialog({
    open,
    onOpenChange,
    languages,
}: CreateCourseDialogProps) {
    const [languageId, setLanguageId] = useState<string>('');
    const [level, setLevel] = useState<string>('beginner');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>
                        Create a new course for your students to learn from.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    method={store().method}
                    action={store().url}
                    resetOnSuccess
                    disableWhileProcessing
                    className="space-y-6"
                    onSuccess={() => {
                        onOpenChange(false);
                        setLanguageId('');
                        setLevel('beginner');
                        router.reload({ only: ['courses'] });
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="e.g., Spanish for Beginners"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    placeholder="Describe what students will learn in this course..."
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="language_id">Language</Label>
                                <Select
                                    value={languageId}
                                    onValueChange={setLanguageId}
                                    required
                                >
                                    <SelectTrigger id="language_id">
                                        <SelectValue placeholder="Select a language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map((language) => (
                                            <SelectItem
                                                key={language.id}
                                                value={language.id.toString()}
                                            >
                                                {language.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    name="language_id"
                                    value={languageId}
                                />
                                <InputError message={errors.language_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="level">Difficulty Level</Label>
                                <Select
                                    value={level}
                                    onValueChange={setLevel}
                                    required
                                >
                                    <SelectTrigger id="level">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">
                                            Beginner
                                        </SelectItem>
                                        <SelectItem value="intermediate">
                                            Intermediate
                                        </SelectItem>
                                        <SelectItem value="advanced">
                                            Advanced
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    name="level"
                                    value={level}
                                />
                                <InputError message={errors.level} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="thumbnail">
                                    Thumbnail URL (Optional)
                                </Label>
                                <Input
                                    id="thumbnail"
                                    name="thumbnail"
                                    type="text"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <InputError message={errors.thumbnail} />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner className="mr-2" />}
                                    Create Course
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
