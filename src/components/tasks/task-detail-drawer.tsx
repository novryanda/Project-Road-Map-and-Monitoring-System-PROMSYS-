"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    useTask,
    useUpdateTaskStatus,
    useAddTaskComment,
} from "@/hooks/use-tasks";
import { useSession } from "@/lib/auth-client";
import {
    MessageSquare,
    MoreHorizontal,
    Upload,
    Send,
    User,
    Calendar,
    Flag,
    Layout,
    Paperclip,
    X,
    ChevronRight,
    Clock,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
    TODO: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    SUBMITTED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    REVISION: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    DONE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const PRIORITY_DOT_COLORS: Record<string, string> = {
    LOW: "bg-slate-400",
    MEDIUM: "bg-blue-500",
    HIGH: "bg-orange-500",
    URGENT: "bg-red-500",
};

interface TaskDetailDrawerProps {
    taskId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (task: any) => void;
}

export function TaskDetailDrawer({ taskId, open, onOpenChange, onEdit }: TaskDetailDrawerProps) {
    const { data: task, isLoading } = useTask(taskId || "");
    const { data: session } = useSession();
    const userRole = session?.user?.role?.toLowerCase();

    const updateStatus = useUpdateTaskStatus();
    const addComment = useAddTaskComment();
    const [comment, setComment] = useState("");

    const handleStatusChange = async (taskId: string, status: any) => {
        try {
            await updateStatus.mutateAsync({ id: taskId, status });
            toast.success("Status updated");
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleAddComment = async () => {
        if (!taskId || !comment.trim()) return;
        try {
            await addComment.mutateAsync({ taskId, content: comment });
            toast.success("Comment added");
            setComment("");
        } catch {
            toast.error("Failed to add comment");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl p-0 flex flex-col gap-0 bg-white dark:bg-slate-950 border-l border-border shadow-2xl h-full">
                <SheetHeader className="sr-only">
                    <SheetTitle>Task Details</SheetTitle>
                    <SheetDescription>View and edit task details</SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground italic">
                        Loading task details...
                    </div>
                ) : task ? (
                    <>
                        {/* Header (Fixed) */}
                        <div className="flex-none flex items-center justify-between px-6 py-4 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{task.project?.name}</span>
                                <ChevronRight className="h-4 w-4" />
                                <span>{task.id.slice(0, 8)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={STATUS_COLORS[task.status]}>{task.status.replace("_", " ")}</Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {onEdit && userRole !== "employees" && (
                                            <DropdownMenuItem onClick={() => { onOpenChange(false); onEdit(task); }}>
                                                Edit Task
                                            </DropdownMenuItem>
                                        )}
                                        {userRole !== "employees" && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive font-medium"
                                                    onClick={() => toast.info("Delete via Tasks page")}
                                                >
                                                    Delete Task
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Scrollable Content (Flex-1) */}
                        <div className="flex-1 overflow-y-auto min-h-0">
                            <div className="p-6 space-y-8">
                                {/* Title */}
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4 leading-tight">
                                        {task.title}
                                    </h2>

                                    {/* Properties Grid */}
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 p-4 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                                <User className="h-3.5 w-3.5" /> Assignee
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                    {task.assignedTo?.name?.charAt(0) || "?"}
                                                </div>
                                                <span className="text-sm font-medium">{task.assignedTo?.name}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                                <Calendar className="h-3.5 w-3.5" /> Due Date
                                            </div>
                                            <div className={`text-sm font-medium ${new Date(task.deadline) < new Date() && task.status !== "DONE" ? "text-red-600" : ""}`}>
                                                {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : "-"}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                                <Flag className="h-3.5 w-3.5" /> Priority
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${PRIORITY_DOT_COLORS[task.priority]}`} />
                                                <span className="text-sm font-medium">{task.priority}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                                <Layout className="h-3.5 w-3.5" /> Project
                                            </div>
                                            <span className="text-sm font-medium truncate max-w-[150px] block" title={task.project?.name}>
                                                {task.project?.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        Description
                                    </h3>
                                    <div className="prose prose-sm dark:prose-invert text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {task.description || <span className="italic text-muted-foreground/60">No description provided.</span>}
                                    </div>
                                </div>

                                {/* Attachments */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Paperclip className="h-4 w-4" /> Attachments
                                    </h3>
                                    {!task.attachments?.length ? (
                                        <p className="text-sm text-muted-foreground italic">No attachments.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {task.attachments.map((att) => (
                                                <a
                                                    key={att.id}
                                                    href={att.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-md border border-border bg-white dark:bg-slate-900 hover:bg-muted/50 transition-colors group"
                                                >
                                                    <div className="h-8 w-8 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                        <Upload className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate text-foreground group-hover:underline">{att.fileName}</p>
                                                        <p className="text-xs text-muted-foreground">{(att.fileSize / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Comments */}
                                <div className="space-y-4 pt-6 border-t pb-20">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" /> Activity & Comments
                                    </h3>

                                    <div className="space-y-6 relative ml-2">
                                        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
                                        {task.comments?.map((c) => (
                                            <div key={c.id} className="relative pl-10">
                                                <div className="absolute left-0 top-0 h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center z-10">
                                                    <span className="text-[10px] font-bold text-muted-foreground">
                                                        {c.user.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold">{c.user.name}</span>
                                                        <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-foreground">{c.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {!task.comments?.length && (
                                            <p className="text-sm text-muted-foreground pl-10 italic">No activity yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions (Fixed) */}
                        <div className="flex-none p-4 border-t bg-background z-10 flex flex-col gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                            <div className="flex gap-2">
                                {task.status === "TODO" && (
                                    <Button className="flex-1" onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}>
                                        Start Work
                                    </Button>
                                )}
                                {task.status === "IN_PROGRESS" && (
                                    <Button className="flex-1" onClick={() => handleStatusChange(task.id, "SUBMITTED")}>
                                        Submit for Review
                                    </Button>
                                )}
                            </div>

                            <div className="relative">
                                <Input
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="pr-12 bg-muted/50 border-transparent focus:bg-background transition-colors"
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-1 top-1 h-8 w-8 text-primary hover:bg-primary/10"
                                    onClick={handleAddComment}
                                    disabled={!comment.trim() || addComment.isPending}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Task not found
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
