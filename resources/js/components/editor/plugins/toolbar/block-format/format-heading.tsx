import { HeadingTagType } from '@lexical/rich-text';

import { blockTypeToBlockName } from '@/components/editor/plugins/toolbar/block-format/block-format-data';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function FormatHeading({
    levels = [],
    onSelect,
}: {
    levels: HeadingTagType[];
    onSelect?: (value: string) => void;
}) {
    return levels.map((level) => (
        <DropdownMenuItem key={level} onSelect={() => onSelect?.(level)}>
            <div className="flex items-center gap-1">
                {blockTypeToBlockName[level].icon}
                <span>{blockTypeToBlockName[level].label}</span>
            </div>
        </DropdownMenuItem>
    ));
}
