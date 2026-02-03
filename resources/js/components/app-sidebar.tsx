import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    Folder,
    FolderPlus,
    GraduationCap,
    LayoutGrid,
    MessageSquare,
    Plus,
    Settings,
} from 'lucide-react';
import { useState } from 'react';
import { CreateCourseDialog } from '@/components/create-course-dialog';
import { CreateModuleDialog } from '@/components/create-module-dialog';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const platformNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth, courses, languages, conversations } = usePage().props as any;
    const user = auth?.user;
    const isTeacher = user?.role === 'teacher';
    const [openCourses, setOpenCourses] = useState<Record<number, boolean>>({});
    const [createCourseOpen, setCreateCourseOpen] = useState(false);
    const [createModuleOpen, setCreateModuleOpen] = useState(false);
    const [selectedCourseForModule, setSelectedCourseForModule] = useState<{
        id: number;
        title: string;
    } | null>(null);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Platform Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <NavMain items={platformNavItems} />
                </SidebarGroup>

                {/* Teacher Courses Section */}
                {isTeacher && (
                    <SidebarGroup>
                        <div className="flex items-center justify-between">
                            <SidebarGroupLabel>Courses</SidebarGroupLabel>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="mr-2 h-6 w-6 p-0"
                                onClick={() => setCreateCourseOpen(true)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <SidebarMenu>
                            {!courses || courses.length === 0 ? (
                                <SidebarMenuItem>
                                    <div className="px-2 py-1 text-sm text-muted-foreground">
                                        No courses yet
                                    </div>
                                </SidebarMenuItem>
                            ) : (
                                courses.map((course: any) => (
                                    <Collapsible
                                        key={course.id}
                                        asChild
                                        open={openCourses[course.id] || false}
                                        onOpenChange={(open) =>
                                            setOpenCourses((prev) => ({
                                                ...prev,
                                                [course.id]: open,
                                            }))
                                        }
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <ContextMenu>
                                                <ContextMenuTrigger asChild>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton
                                                            tooltip={
                                                                course.title
                                                            }
                                                        >
                                                            <BookOpen />
                                                            <span>
                                                                {course.title}
                                                            </span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                </ContextMenuTrigger>
                                                <ContextMenuContent>
                                                    <ContextMenuItem asChild>
                                                        <Link
                                                            href={`/courses/${course.id}`}
                                                        >
                                                            <Settings className="mr-2 h-4 w-4" />
                                                            Manage Course
                                                        </Link>
                                                    </ContextMenuItem>
                                                    <ContextMenuItem
                                                        onClick={() => {
                                                            setSelectedCourseForModule(
                                                                {
                                                                    id: course.id,
                                                                    title: course.title,
                                                                },
                                                            );
                                                            setCreateModuleOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <FolderPlus className="mr-2 h-4 w-4" />
                                                        Add Module
                                                    </ContextMenuItem>
                                                </ContextMenuContent>
                                            </ContextMenu>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {course.modules?.map(
                                                        (module: any) => (
                                                            <SidebarMenuSubItem
                                                                key={module.id}
                                                            >
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={`/dashboard/module/${module.id}`}
                                                                    >
                                                                        <Folder className="h-4 w-4" />
                                                                        <span>
                                                                            {
                                                                                module.title
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ),
                                                    )}
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuSubButton
                                                            onClick={() => {
                                                                setSelectedCourseForModule(
                                                                    {
                                                                        id: course.id,
                                                                        title: course.title,
                                                                    },
                                                                );
                                                                setCreateModuleOpen(
                                                                    true,
                                                                );
                                                            }}
                                                            className="cursor-pointer text-muted-foreground"
                                                        >
                                                            <FolderPlus className="h-4 w-4" />
                                                            <span>
                                                                Add Module
                                                            </span>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {/* Chats Section - For Teachers and Students */}
                {(isTeacher || user?.role === 'student') && (
                    <SidebarGroup>
                        <SidebarGroupLabel>
                            {isTeacher ? 'Student Chats' : 'Messages'}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/conversations">
                                        <MessageSquare />
                                        <span>
                                            {isTeacher
                                                ? 'All Conversations'
                                                : 'My Messages'}
                                        </span>
                                        {conversations?.unreadCount > 0 && (
                                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                                                {conversations.unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>

            {/* Dialogs */}
            {isTeacher && languages && (
                <CreateCourseDialog
                    open={createCourseOpen}
                    onOpenChange={setCreateCourseOpen}
                    languages={languages}
                />
            )}
            {selectedCourseForModule && (
                <CreateModuleDialog
                    open={createModuleOpen}
                    onOpenChange={setCreateModuleOpen}
                    courseId={selectedCourseForModule.id}
                    courseTitle={selectedCourseForModule.title}
                />
            )}
        </Sidebar>
    );
}
