import { Head, Link, router, usePage } from '@inertiajs/react';
import { MessageSquare, User, Search, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Conversations',
        href: '/conversations',
    },
];

interface Message {
    id: number;
    message: string;
    created_at: string;
}

interface Conversation {
    id: number;
    student: {
        id: number;
        name: string;
        email: string;
    };
    teacher: {
        id: number;
        name: string;
        email: string;
    };
    last_message: Message | null;
    last_message_at: string;
    unread_count: number;
}

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface Props {
    conversations: Conversation[];
    selectedConversationId?: number;
    availableTeachers?: Teacher[];
}

export default function ConversationsIndex({
    conversations,
    selectedConversationId,
    availableTeachers = [],
}: Props) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const [searchQuery, setSearchQuery] = useState('');
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleStartConversation = (teacherId: number) => {
        router.post('/conversations/get-or-create', {
            teacher_id: teacherId,
        });
        setIsPopoverOpen(false);
    };

    const filteredConversations = conversations.filter((conv) => {
        const otherUser =
            user?.role === 'teacher' ? conv.student : conv.teacher;
        return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conversations" />
            <div className="flex h-[calc(100vh-5.5rem)] overflow-hidden rounded-xl border border-sidebar-border/70 bg-background dark:border-sidebar-border">
                {/* Left Sidebar - Conversations List */}
                <div className="flex w-80 flex-col border-r border-sidebar-border/70 dark:border-sidebar-border">
                    {/* Header */}
                    <div className="border-b border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Messages</h2>
                            {user?.role === 'student' &&
                                availableTeachers.length > 0 && (
                                    <Popover
                                        open={isPopoverOpen}
                                        onOpenChange={setIsPopoverOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-64 p-2"
                                            align="end"
                                        >
                                            <div className="space-y-1">
                                                <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                                                    Start conversation with
                                                </p>
                                                {availableTeachers.map(
                                                    (teacher) => (
                                                        <button
                                                            key={teacher.id}
                                                            onClick={() =>
                                                                handleStartConversation(
                                                                    teacher.id,
                                                                )
                                                            }
                                                            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent"
                                                        >
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                                <User className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate font-medium">
                                                                    {
                                                                        teacher.name
                                                                    }
                                                                </p>
                                                                <p className="truncate text-xs text-muted-foreground">
                                                                    {
                                                                        teacher.email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                        </div>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                    No conversations found
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {searchQuery
                                        ? 'Try a different search'
                                        : 'Start a new conversation'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                {filteredConversations.map((conversation) => {
                                    const otherUser =
                                        user?.role === 'teacher'
                                            ? conversation.student
                                            : conversation.teacher;
                                    const isSelected =
                                        conversation.id ===
                                        selectedConversationId;

                                    return (
                                        <Link
                                            key={conversation.id}
                                            href={`/conversations/${conversation.id}`}
                                            className={cn(
                                                'flex items-start gap-3 p-4 transition-colors hover:bg-accent',
                                                isSelected && 'bg-accent',
                                            )}
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center justify-between gap-2">
                                                    <p className="truncate text-sm font-semibold">
                                                        {otherUser.name}
                                                    </p>
                                                    {conversation.last_message_at && (
                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    conversation.last_message_at,
                                                                ),
                                                                {
                                                                    addSuffix: false,
                                                                },
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="flex-1 truncate text-xs text-muted-foreground">
                                                        {conversation
                                                            .last_message
                                                            ?.message ||
                                                            'No messages yet'}
                                                    </p>
                                                    {conversation.unread_count >
                                                        0 && (
                                                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                                                            {
                                                                conversation.unread_count
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Empty State */}
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="text-center">
                        <MessageSquare className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">
                            Select a conversation
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Choose a conversation from the list to start
                            messaging
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
