import { Form, router } from '@inertiajs/react';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/routes/lessons';

type CreateLessonDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    moduleId: number;
    moduleTitle: string;
};

export function CreateLessonDialog({
    open,
    onOpenChange,
    moduleId,
    moduleTitle,
}: CreateLessonDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Lesson</DialogTitle>
                    <DialogDescription>
                        Add a new lesson to{' '}
                        <span className="font-medium">{moduleTitle}</span>
                    </DialogDescription>
                </DialogHeader>

                <Form
                    method={store().method}
                    action={store().url}
                    disableWhileProcessing
                    className="space-y-6"
                    onSuccess={() => {
                        onOpenChange(false);
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="module_id"
                                value={moduleId}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="title">Lesson Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="e.g., Basic Greetings"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    placeholder="Describe what students will learn in this lesson..."
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration_minutes">
                                    Estimated Duration (minutes)
                                </Label>
                                <Input
                                    id="duration_minutes"
                                    name="duration_minutes"
                                    type="number"
                                    min="1"
                                    placeholder="e.g., 30"
                                />
                                <InputError message={errors.duration_minutes} />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner className="mr-2" />}
                                    Create Lesson
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
