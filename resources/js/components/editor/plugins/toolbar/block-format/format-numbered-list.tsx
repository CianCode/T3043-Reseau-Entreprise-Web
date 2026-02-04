import { blockTypeToBlockName } from '@/components/editor/plugins/toolbar/block-format/block-format-data';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const BLOCK_FORMAT_VALUE = 'number';

export function FormatNumberedList({
    onSelect,
}: {
    onSelect?: (value: string) => void;
}) {
    return (
        <DropdownMenuItem onSelect={() => onSelect?.(BLOCK_FORMAT_VALUE)}>
            <div className="flex items-center gap-1">
                {blockTypeToBlockName[BLOCK_FORMAT_VALUE].icon}
                <span>{blockTypeToBlockName[BLOCK_FORMAT_VALUE].label}</span>
            </div>
        </DropdownMenuItem>
    );
}
