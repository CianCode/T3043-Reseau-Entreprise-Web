import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import {
    Send,
    User,
    Search,
    MoreVertical,
    Check,
    CheckCheck,
    Plus,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    message: string;
    is_read: boolean;
    created_at: string;
    sender: User;
}

interface Conversation {
    id: number;
    student: User;
    teacher: User;
}

interface ConversationListItem {
    id: number;
    student: User;
    teacher: User;
    last_message: { id: number; message: string; created_at: string } | null;
    last_message_at: string;
    unread_count: number;
}

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface Props {
    conversation: Conversation;
    messages: Message[];
    allConversations: ConversationListItem[];
    availableTeachers?: Teacher[];
}

export default function ConversationShow({
    conversation,
    messages,
    allConversations,
    availableTeachers = [],
}: Props) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const [allMessages, setAllMessages] = useState<Message[]>(messages);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [conversations, setConversations] =
        useState<ConversationListItem[]>(allConversations);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data, setData, post, reset, processing } = useForm({
        message: '',
        conversation_id: conversation.id,
    });

    const handleStartConversation = (teacherId: number) => {
        router.post('/conversations/get-or-create', {
            teacher_id: teacherId,
        });
        setIsPopoverOpen(false);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Conversations',
            href: '/conversations',
        },
        {
            title:
                user?.role === 'teacher'
                    ? conversation.student.name
                    : conversation.teacher.name,
            href: `/conversations/${conversation.id}`,
        },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [allMessages]);

    // Listen for new messages via WebSocket
    useEffect(() => {
        const channel = window.Echo.private(`conversation.${conversation.id}`);

        channel.listen('.message.sent', (event: { message: Message }) => {
            // If receiving a message from someone else, mark it as read immediately
            if (event.message.sender_id !== user?.id) {
                // Add message as already read since we're viewing the conversation
                setAllMessages((prev) => [
                    ...prev,
                    { ...event.message, is_read: true },
                ]);

                // Notify sender that message was read
                fetch(`/conversations/${conversation.id}/mark-as-read`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                        Accept: 'application/json',
                    },
                });
            } else {
                // Add our own sent message
                setAllMessages((prev) => [...prev, event.message]);
            }
        });

        channel.listen(
            '.messages.read',
            (event: { conversation_id: number; read_by_user_id: number }) => {
                // Update all messages sent by current user to be marked as read
                if (event.read_by_user_id !== user?.id) {
                    setAllMessages((prev) =>
                        prev.map((msg) =>
                            msg.sender_id === user?.id
                                ? { ...msg, is_read: true }
                                : msg,
                        ),
                    );
                }

                // Update conversation list - reset unread count for this conversation
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === event.conversation_id
                            ? { ...conv, unread_count: 0 }
                            : conv,
                    ),
                );
            },
        );

        return () => {
            channel.stopListening('.message.sent');
            channel.stopListening('.messages.read');
            window.Echo.leave(`conversation.${conversation.id}`);
        };
    }, [conversation.id, user?.id]);

    // Listen for messages in other conversations to update unread counts
    useEffect(() => {
        const channels: any[] = [];

        conversations.forEach((conv) => {
            if (conv.id !== conversation.id) {
                const channel = window.Echo.private(`conversation.${conv.id}`);

                channel.listen(
                    '.message.sent',
                    (event: { message: Message }) => {
                        // Only increment if message is from someone else
                        if (event.message.sender_id !== user?.id) {
                            setConversations((prev) =>
                                prev.map((c) =>
                                    c.id === conv.id
                                        ? {
                                              ...c,
                                              unread_count: c.unread_count + 1,
                                              last_message: {
                                                  id: event.message.id,
                                                  message:
                                                      event.message.message,
                                                  created_at:
                                                      event.message.created_at,
                                              },
                                              last_message_at:
                                                  event.message.created_at,
                                          }
                                        : c,
                                ),
                            );
                        }
                    },
                );

                channels.push(channel);
            }
        });

        return () => {
            channels.forEach((ch) => {
                ch.stopListening('.message.sent');
            });
        };
    }, [conversations.map((c) => c.id).join(','), conversation.id, user?.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.message.trim()) return;

        post('/conversations/messages', {
            preserveScroll: true,
            onSuccess: () => {
                reset('message');
            },
        });
    };

    const otherUser =
        user?.role === 'teacher' ? conversation.student : conversation.teacher;

    const filteredConversations = conversations.filter((conv) => {
        const otherUser =
            user?.role === 'teacher' ? conv.student : conv.teacher;
        return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chat with ${otherUser.name}`} />
            <div className="flex h-[calc(100vh-5.5rem)] overflow-hidden rounded-xl border border-sidebar-border/70 bg-background dark:border-sidebar-border">
                {/* Left Sidebar - Conversations List */}
                <div className="flex w-80 shrink-0 flex-col border-r border-sidebar-border/70 dark:border-sidebar-border">
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
                                <p className="text-sm text-muted-foreground">
                                    No conversations found
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                {filteredConversations.map((conv) => {
                                    const convOtherUser =
                                        user?.role === 'teacher'
                                            ? conv.student
                                            : conv.teacher;
                                    const isSelected =
                                        conv.id === conversation.id;

                                    return (
                                        <Link
                                            key={conv.id}
                                            href={`/conversations/${conv.id}`}
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
                                                        {convOtherUser.name}
                                                    </p>
                                                    {conv.last_message_at && (
                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    conv.last_message_at,
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
                                                        {conv.last_message
                                                            ?.message ||
                                                            'No messages yet'}
                                                    </p>
                                                    {conv.unread_count > 0 && (
                                                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                                                            {conv.unread_count}
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

                {/* Right Panel - Chat */}
                <div className="flex flex-1 flex-col">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between border-b border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-semibold">
                                        {otherUser.name}
                                    </h2>
                                    {allMessages.filter(
                                        (m) =>
                                            m.sender_id !== user?.id &&
                                            !m.is_read,
                                    ).length > 0 && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                                            {
                                                allMessages.filter(
                                                    (m) =>
                                                        m.sender_id !==
                                                            user?.id &&
                                                        !m.is_read,
                                                ).length
                                            }
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {otherUser.email}
                                </p>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Mute Conversation
                                </DropdownMenuItem>
                                <DropdownMenuItem variant="destructive">
                                    Delete Conversation
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-4">
                            {allMessages.length === 0 ? (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm text-muted-foreground">
                                        No messages yet. Start the conversation!
                                    </p>
                                </div>
                            ) : (
                                allMessages.map((message) => {
                                    const isOwnMessage =
                                        message.sender_id === user?.id;
                                    return (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                'flex',
                                                isOwnMessage
                                                    ? 'justify-end'
                                                    : 'justify-start',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[70%] rounded-2xl px-4 py-2',
                                                    isOwnMessage
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted',
                                                )}
                                            >
                                                <p className="text-sm">
                                                    {message.message}
                                                </p>
                                                <div
                                                    className={cn(
                                                        'mt-1 flex items-center gap-1 text-xs',
                                                        isOwnMessage
                                                            ? 'text-primary-foreground/70'
                                                            : 'text-muted-foreground',
                                                    )}
                                                >
                                                    <span>
                                                        {format(
                                                            new Date(
                                                                message.created_at,
                                                            ),
                                                            'p',
                                                        )}
                                                    </span>
                                                    {isOwnMessage && (
                                                        <span className="ml-1">
                                                            {message.is_read ? (
                                                                <CheckCheck className="h-3 w-3" />
                                                            ) : (
                                                                <Check className="h-3 w-3" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Textarea
                                value={data.message}
                                onChange={(e) =>
                                    setData('message', e.target.value)
                                }
                                placeholder="Type a message..."
                                className="min-h-15 resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={processing || !data.message.trim()}
                                className="h-15 w-15"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
