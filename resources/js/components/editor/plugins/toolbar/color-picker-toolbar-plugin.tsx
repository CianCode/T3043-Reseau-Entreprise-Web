import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Paintbrush } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

const COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
];

export function ColorPickerToolbarPlugin() {
    const [editor] = useLexicalComposerContext();

    const applyColor = (color: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const nodes = selection.getNodes();
                nodes.forEach((node) => {
                    const parent = node.getParent();
                    if (parent) {
                        parent.setStyle(`color: ${color}`);
                    }
                });
            }
        });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    type="button"
                    title="Text Color"
                >
                    <Paintbrush className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
                <div className="mb-2 text-sm font-medium">Text Color</div>
                <div className="grid grid-cols-5 gap-2">
                    {COLORS.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => applyColor(color.value)}
                            className="h-8 w-8 rounded border hover:ring-2 hover:ring-offset-1"
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                </div>
                <Separator className="my-3" />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyColor('#000000')}
                    className="w-full"
                    type="button"
                >
                    Reset Color
                </Button>
            </PopoverContent>
        </Popover>
    );
}
