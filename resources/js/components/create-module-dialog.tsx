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
import { store } from '@/routes/modules';

type CreateModuleDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: number;
    courseTitle: string;
};

export function CreateModuleDialog({
    open,
    onOpenChange,
    courseId,
    courseTitle,
}: CreateModuleDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Module</DialogTitle>
                    <DialogDescription>
                        Add a new module to{' '}
                        <span className="font-medium">{courseTitle}</span>
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
                        router.reload({ only: ['courses'] });
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="course_id"
                                value={courseId}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="title">Module Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="e.g., Introduction to Spanish"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    placeholder="Describe what students will learn in this module..."
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner className="mr-2" />}
                                    Create Module
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
