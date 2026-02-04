'use client';

import * as React from 'react';
import {
    $isListNode,
    ListNode,
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
} from '@lexical/list';
import {
    $createHeadingNode,
    $isHeadingNode,
    HeadingTagType,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $findMatchingParent, $getNearestNodeOfType } from '@lexical/utils';
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    $isRootOrShadowRoot,
    BaseSelection,
} from 'lexical';
import { $createCodeNode } from '@lexical/code';
import { $createQuoteNode } from '@lexical/rich-text';
import { ChevronDownIcon } from 'lucide-react';

import { useToolbarContext } from '@/components/editor/context/toolbar-context';
import { useUpdateToolbarHandler } from '@/components/editor/editor-hooks/use-update-toolbar';
import { blockTypeToBlockName } from '@/components/editor/plugins/toolbar/block-format/block-format-data';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function BlockFormatDropDown({
    children,
}: {
    children: React.ReactNode;
}) {
    const { activeEditor, blockType, setBlockType } = useToolbarContext();

    function $updateToolbar(selection: BaseSelection) {
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            let element =
                anchorNode.getKey() === 'root'
                    ? anchorNode
                    : $findMatchingParent(anchorNode, (e) => {
                          const parent = e.getParent();
                          return parent !== null && $isRootOrShadowRoot(parent);
                      });

            if (element === null) {
                element = anchorNode.getTopLevelElementOrThrow();
            }

            const elementKey = element.getKey();
            const elementDOM = activeEditor.getElementByKey(elementKey);

            if (elementDOM !== null) {
                // setSelectedElementKey(elementKey);
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType<ListNode>(
                        anchorNode,
                        ListNode,
                    );
                    const type = parentList
                        ? parentList.getListType()
                        : element.getListType();
                    setBlockType(type);
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType();
                    if (type in blockTypeToBlockName) {
                        setBlockType(type as keyof typeof blockTypeToBlockName);
                    }
                }
            }
        }
    }

    useUpdateToolbarHandler($updateToolbar);

    const formatBlock = (value: string) => {
        if (blockType === value) return;

        activeEditor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            if (value === 'paragraph') {
                $setBlocksType(selection, () => $createParagraphNode());
            } else if (value === 'h1' || value === 'h2' || value === 'h3') {
                $setBlocksType(selection, () =>
                    $createHeadingNode(value as HeadingTagType),
                );
            } else if (value === 'bullet') {
                if (blockType !== 'bullet') {
                    activeEditor.dispatchCommand(
                        INSERT_UNORDERED_LIST_COMMAND,
                        undefined,
                    );
                } else {
                    activeEditor.dispatchCommand(
                        REMOVE_LIST_COMMAND,
                        undefined,
                    );
                }
            } else if (value === 'number') {
                if (blockType !== 'number') {
                    activeEditor.dispatchCommand(
                        INSERT_ORDERED_LIST_COMMAND,
                        undefined,
                    );
                } else {
                    activeEditor.dispatchCommand(
                        REMOVE_LIST_COMMAND,
                        undefined,
                    );
                }
            } else if (value === 'check') {
                if (blockType !== 'check') {
                    activeEditor.dispatchCommand(
                        INSERT_CHECK_LIST_COMMAND,
                        undefined,
                    );
                } else {
                    activeEditor.dispatchCommand(
                        REMOVE_LIST_COMMAND,
                        undefined,
                    );
                }
            } else if (value === 'code') {
                $setBlocksType(selection, () => $createCodeNode());
            } else if (value === 'quote') {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });

        setBlockType(value as keyof typeof blockTypeToBlockName);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                    {blockTypeToBlockName[blockType].icon}
                    <span>{blockTypeToBlockName[blockType].label}</span>
                    <ChevronDownIcon className="size-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(
                            child as React.ReactElement<any>,
                            {
                                onSelect: formatBlock,
                            },
                        );
                    }
                    return child;
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
