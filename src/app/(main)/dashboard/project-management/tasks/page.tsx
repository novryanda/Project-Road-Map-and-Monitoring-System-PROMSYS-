"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useAddTaskComment,
} from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import type { Task } from "@/hooks/use-tasks";
import {
  CheckSquare,
  GripVertical,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Send,
  User,
} from "lucide-react";
import { toast } from "sonner";

const STATUSES: { key: Task["status"]; label: string; color: string; bgColor: string }[] = [
  { key: "TODO", label: "To Do", color: "text-slate-700 dark:text-slate-300", bgColor: "bg-slate-100 dark:bg-slate-800" },
  { key: "IN_PROGRESS", label: "In Progress", color: "text-blue-700 dark:text-blue-300", bgColor: "bg-blue-100 dark:bg-blue-900" },
  { key: "SUBMITTED", label: "Submitted", color: "text-yellow-700 dark:text-yellow-300", bgColor: "bg-yellow-100 dark:bg-yellow-900" },
  { key: "REVISION", label: "Revision", color: "text-orange-700 dark:text-orange-300", bgColor: "bg-orange-100 dark:bg-orange-900" },
  { key: "DONE", label: "Done", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900" },
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const PRIORITY_DOT_COLORS: Record<string, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

const defaultForm = {
  projectId: "",
  title: "",
  description: "",
  assignedToId: "",
  deadline: "",
  priority: "MEDIUM" as Task["priority"],
};

export default function TasksKanbanPage() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(50); // Larger size for Kanban
  const { data: tasksRes, isLoading } = useTasks(page, size);
  const tasks = tasksRes?.data || [];
  const { data: projectsRes } = useProjects(1, 100); // Fetch up to 100 projects for the filter
  const projects = projectsRes?.data || [];
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const updateStatus = useUpdateTaskStatus();
  const addComment = useAddTaskComment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Task | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [comment, setComment] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const { data: selectedTask } = useTask(selectedTaskId);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const filtered = filterProject === "all"
      ? tasks
      : tasks.filter((t) => t.projectId === filterProject);

    const grouped: Record<string, Task[]> = {};
    for (const status of STATUSES) {
      grouped[status.key] = filtered.filter((t) => t.status === status.key);
    }
    return grouped;
  }, [tasks, filterProject]);

  const openCreate = (presetStatus?: Task["status"]) => {
    setEditItem(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditItem(t);
    setForm({
      projectId: t.projectId,
      title: t.title,
      description: t.description || "",
      assignedToId: t.assignedToId,
      deadline: t.deadline ? t.deadline.split("T")[0] : "",
      priority: t.priority,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await updateTask.mutateAsync({
          id: editItem.id,
          title: form.title,
          description: form.description || undefined,
          assignedToId: form.assignedToId,
          deadline: form.deadline,
          priority: form.priority,
        });
        toast.success("Task updated");
      } else {
        await createTask.mutateAsync({
          projectId: form.projectId,
          title: form.title,
          description: form.description || undefined,
          assignedToId: form.assignedToId,
          deadline: form.deadline,
          priority: form.priority,
        });
        toast.success("Task created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save task");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask.mutateAsync(deleteTarget.id);
      toast.success("Task deleted");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      await updateStatus.mutateAsync({ id: taskId, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAddComment = async () => {
    if (!selectedTaskId || !comment.trim()) return;
    try {
      await addComment.mutateAsync({ taskId: selectedTaskId, content: comment });
      toast.success("Comment added");
      setComment("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Task["status"]) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find((t) => t.id === draggedTaskId);
    if (task && task.status !== targetStatus) {
      await handleStatusChange(draggedTaskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 md:p-8 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Kanban board for task management</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => openCreate()}>
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {STATUSES.map((status) => (
            <div
              key={status.key}
              className="flex flex-col w-[300px] shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status.key)}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between rounded-t-lg px-3 py-2 ${status.bgColor}`}>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${status.color}`}>
                    {status.label}
                  </span>
                  <Badge variant="secondary" className="text-xs h-5 px-1.5">
                    {tasksByStatus[status.key]?.length || 0}
                  </Badge>
                </div>
              </div>

              {/* Column Body */}
              <div className="flex-1 space-y-2 rounded-b-lg border border-t-0 bg-muted/30 p-2 min-h-[200px]">
                {tasksByStatus[status.key]?.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow border-none bg-white dark:bg-slate-900"
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                  >
                    <CardContent className="p-3 space-y-2">
                      {/* Top: Project + Menu */}
                      <div className="flex items-start justify-between">
                        <p className="text-xs text-muted-foreground truncate flex-1">
                          {task.project?.name}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTaskId(task.id);
                                setDetailOpen(true);
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(task)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {task.status === "TODO" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}>
                                Start Work
                              </DropdownMenuItem>
                            )}
                            {task.status === "IN_PROGRESS" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, "SUBMITTED")}>
                                Submit
                              </DropdownMenuItem>
                            )}
                            {task.status === "SUBMITTED" && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "DONE")}>
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "REVISION")}>
                                  Revision
                                </DropdownMenuItem>
                              </>
                            )}
                            {task.status === "REVISION" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, "SUBMITTED")}>
                                Re-submit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setDeleteTarget(task);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Title */}
                      <p
                        className="font-medium text-sm leading-snug cursor-pointer hover:underline"
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setDetailOpen(true);
                        }}
                      >
                        {task.title}
                      </p>

                      {/* Bottom: Priority + Assignee + Deadline */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${PRIORITY_DOT_COLORS[task.priority]}`} />
                          <span className="text-xs text-muted-foreground">{task.priority}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.comments && task.comments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              {task.comments.length}
                            </span>
                          )}
                          {task.deadline && (
                            <span
                              className={`text-xs ${new Date(task.deadline) < new Date() && task.status !== "DONE"
                                ? "text-red-600 font-medium"
                                : "text-muted-foreground"
                                }`}
                            >
                              {new Date(task.deadline).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Assignee */}
                      {task.assignedTo && (
                        <div className="flex items-center gap-1.5 pt-1 border-t">
                          <div className="rounded-full bg-muted p-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span className="text-xs text-muted-foreground truncate">
                            {task.assignedTo.name}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Empty State */}
                {(!tasksByStatus[status.key] || tasksByStatus[status.key].length === 0) && (
                  <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Task" : "New Task"}</DialogTitle>
            <DialogDescription>
              {editItem ? "Update task details." : "Create a new task."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {!editItem && (
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v, assignedToId: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned To *</Label>
              <Select
                value={form.assignedToId}
                onValueChange={(v) => setForm({ ...form, assignedToId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {(projects.find((p) => p.id === form.projectId)?.members || []).map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.user.name} ({m.user.email})
                    </SelectItem>
                  ))}
                  {(!form.projectId || (projects.find((p) => p.id === form.projectId)?.members || []).length === 0) && (
                    <SelectItem value="_none" disabled>
                      {form.projectId ? "No members in this project" : "Select a project first"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v as Task["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.title.trim() || createTask.isPending || updateTask.isPending}
            >
              {editItem ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTask.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedTask?.title || "Task"}</SheetTitle>
            <SheetDescription>{selectedTask?.project?.name}</SheetDescription>
          </SheetHeader>
          {selectedTask && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    className={PRIORITY_COLORS[selectedTask.status] || ""}
                    variant="secondary"
                  >
                    {selectedTask.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <Badge
                    className={PRIORITY_COLORS[selectedTask.priority] || ""}
                    variant="secondary"
                  >
                    {selectedTask.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p className="text-sm font-medium">{selectedTask.assignedTo?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-medium">
                    {selectedTask.deadline
                      ? new Date(selectedTask.deadline).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedTask.description}</p>
                </div>
              )}

              {/* Comments */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    Comments ({selectedTask.comments?.length || 0})
                  </p>
                </div>
                <div className="space-y-2 mb-3">
                  {selectedTask.comments?.map((c) => (
                    <Card
                      key={c.id}
                      className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50"
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-medium">{c.user?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm mt-1">{c.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddComment} disabled={addComment.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
