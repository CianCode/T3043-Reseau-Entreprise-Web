import { router } from '@inertiajs/react';
import {
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

type Module = {
    id: number;
    title: string;
    description?: string;
    order: number;
};

type SortableModuleItemProps = {
    module: Module;
    onEdit?: (module: Module) => void;
};

function SortableModuleItem({ module, onEdit }: SortableModuleItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 rounded-lg border bg-card p-4"
        >
            <button
                className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-5 w-5" />
            </button>
            <div className="flex-1">
                <h3 className="font-semibold">{module.title}</h3>
                {module.description && (
                    <p className="text-sm text-muted-foreground">
                        {module.description}
                    </p>
                )}
            </div>
            {onEdit && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(module)}
                >
                    Edit
                </Button>
            )}
        </div>
    );
}

type SortableModuleListProps = {
    courseId: number;
    initialModules: Module[];
    onReorder?: (modules: Module[]) => void;
};

export function SortableModuleList({
    courseId,
    initialModules,
    onReorder,
}: SortableModuleListProps) {
    const [modules, setModules] = useState<Module[]>(initialModules);
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setModules((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.id === active.id,
                );
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update order values
                const updatedItems = newItems.map((item, index) => ({
                    ...item,
                    order: index,
                }));

                // Call the callback if provided
                if (onReorder) {
                    onReorder(updatedItems);
                }

                // Automatically save to backend
                saveOrder(updatedItems);

                return updatedItems;
            });
        }
    };

    const saveOrder = async (reorderedModules: Module[]) => {
        setIsSaving(true);
        router.post(
            `/courses/${courseId}/modules/reorder`,
            {
                modules: reorderedModules.map((m) => ({
                    id: m.id,
                    order: m.order,
                })),
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                },
                onError: () => {
                    setIsSaving(false);
                },
            },
        );
    };

    return (
        <div className="space-y-4">
            {isSaving && (
                <div className="text-sm text-muted-foreground">
                    Saving new order...
                </div>
            )}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={modules.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {modules.map((module) => (
                            <SortableModuleItem
                                key={module.id}
                                module={module}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
