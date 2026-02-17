"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useProject,
  useUpdateProject,
  useAddProjectMember,
  useRemoveProjectMember,
  useProjectUsers,
  useProjectDocuments,
  useCreateProjectDocument,
  useDeleteProjectDocument,
  useProjectActivities,
  useCreateProjectActivity,
  useDeleteProjectActivity,
} from "@/hooks/use-projects";
import type { DocumentType } from "@/hooks/use-projects";
import { useProjectTasks, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { useInvoices } from "@/hooks/use-invoices";
import type { Task } from "@/hooks/use-tasks";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  Clock,
  DollarSign,
  Download,
  FileText,
  FolderOpen,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  ON_HOLD: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const TASK_STATUS_COLORS: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  SUBMITTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  REVISION: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  DONE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const formatCurrency = (val: number | null) => {
  if (!val) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);
  const { data: tasksRes } = useProjectTasks(id, 1, 100);
  const tasks = tasksRes?.data || [];
  const { data: invoicesRes } = useInvoices({ projectId: id, page: 1, size: 100 });
  const invoices = invoicesRes?.data || [];
  const { data: documents = [] } = useProjectDocuments(id);
  const { data: activities = [] } = useProjectActivities(id);
  const updateProject = useUpdateProject();
  const addMember = useAddProjectMember();
  const removeMember = useRemoveProjectMember();
  const updateTaskStatus = useUpdateTaskStatus();
  const createDocument = useCreateProjectDocument();
  const deleteDocument = useDeleteProjectDocument();
  const createActivity = useCreateProjectActivity();
  const deleteActivity = useDeleteProjectActivity();

  // Member picker
  const [memberSearch, setMemberSearch] = useState("");
  const { data: availableUsers = [] } = useProjectUsers(memberSearch);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [memberRole, setMemberRole] = useState("member");

  // Document upload
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState<DocumentType>("PROPOSAL");
  const [docFile, setDocFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Activity
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityDate, setActivityDate] = useState("");

  // Edit project
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    clientName: "",
    ptName: "",
    description: "",
    startDate: "",
    endDate: "",
    contractValue: "",
    status: "PLANNING" as string,
  });

  const openEdit = () => {
    if (!project) return;
    setEditForm({
      name: project.name,
      clientName: project.clientName || "",
      ptName: project.ptName || "",
      description: project.description || "",
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      endDate: project.endDate ? project.endDate.split("T")[0] : "",
      contractValue: project.contractValue ? String(project.contractValue) : "",
      status: project.status,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await updateProject.mutateAsync({
        id,
        name: editForm.name,
        clientName: editForm.clientName || undefined,
        ptName: editForm.ptName || undefined,
        description: editForm.description || undefined,
        startDate: editForm.startDate || undefined,
        endDate: editForm.endDate || undefined,
        contractValue: editForm.contractValue ? parseFloat(editForm.contractValue) : undefined,
        status: editForm.status as any,
      });
      toast.success("Project updated");
      setEditDialogOpen(false);
    } catch {
      toast.error("Failed to update project");
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    try {
      await addMember.mutateAsync({ projectId: id, userId: selectedUserId, role: memberRole });
      toast.success("Member added");
      setSelectedUserId("");
      setMemberRole("member");
      setMemberDialogOpen(false);
    } catch {
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember.mutateAsync({ projectId: id, userId });
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      await updateTaskStatus.mutateAsync({ id: taskId, status });
      toast.success("Task status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleUploadDocument = async () => {
    if (!docName.trim() || !docFile) return;
    try {
      await createDocument.mutateAsync({ projectId: id, name: docName, type: docType, file: docFile });
      toast.success("Document uploaded");
      setDocDialogOpen(false);
      setDocName("");
      setDocType("PROPOSAL");
      setDocFile(null);
    } catch {
      toast.error("Failed to upload document");
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument.mutateAsync({ projectId: id, documentId });
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const handleCreateActivity = async () => {
    if (!activityTitle.trim()) return;
    try {
      await createActivity.mutateAsync({
        projectId: id,
        title: activityTitle,
        description: activityDescription || undefined,
        activityDate: activityDate || undefined,
      });
      toast.success("Activity added");
      setActivityDialogOpen(false);
      setActivityTitle("");
      setActivityDescription("");
      setActivityDate("");
    } catch {
      toast.error("Failed to add activity");
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity.mutateAsync({ projectId: id, activityId });
      toast.success("Activity deleted");
    } catch {
      toast.error("Failed to delete activity");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdueTasks = tasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "DONE").length;

  const totalInvoiceIncome = invoices
    .filter((i) => i.type === "INCOME")
    .reduce((s, i) => s + (i.total || 0), 0);
  const totalInvoiceExpense = invoices
    .filter((i) => i.type === "EXPENSE")
    .reduce((s, i) => s + (i.total || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-muted-foreground">Project not found</div>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <Badge className={STATUS_COLORS[project.status] || ""} variant="secondary">
                {project.status.replace("_", " ")}
              </Badge>
            </div>
            {project.clientName && (
              <p className="text-muted-foreground mt-1">{project.clientName}</p>
            )}
            {project.ptName && (
              <p className="text-sm text-muted-foreground">{project.ptName}</p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={openEdit}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <CheckSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tasks</p>
                <p className="text-lg font-bold tabular-nums">
                  {completedTasks}/{totalTasks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-lg font-bold tabular-nums">{inProgressTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contract</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatCurrency(project.contractValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
                <Calendar className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Overdue Tasks</p>
                <p className="text-lg font-bold tabular-nums text-red-600">{overdueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({totalTasks})</TabsTrigger>
          <TabsTrigger value="members">Members ({project.members?.length || 0})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{project.description}</p>
                  </div>
                )}
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString("id-ID") : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="text-sm font-medium">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString("id-ID") : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contract Value</p>
                    <p className="text-sm font-medium tabular-nums">
                      {formatCurrency(project.contractValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created By</p>
                    <p className="text-sm font-medium">{project.createdBy?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Income</span>
                  <span className="font-medium text-green-600 tabular-nums">
                    {formatCurrency(totalInvoiceIncome)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Expense</span>
                  <span className="font-medium text-red-600 tabular-nums">
                    {formatCurrency(totalInvoiceExpense)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Net</span>
                  <span className={`font-bold text-lg tabular-nums ${totalInvoiceIncome - totalInvoiceExpense >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(totalInvoiceIncome - totalInvoiceExpense)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Task Progress */}
            <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50 lg:col-span-2">
              <CardHeader>
                <CardTitle>Task Progress</CardTitle>
                <CardDescription>Distribution of tasks by status</CardDescription>
              </CardHeader>
              <CardContent>
                {totalTasks > 0 ? (
                  <div className="space-y-3">
                    <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
                      {(["TODO", "IN_PROGRESS", "SUBMITTED", "REVISION", "DONE"] as const).map((status) => {
                        const count = tasks.filter((t) => t.status === status).length;
                        const pct = (count / totalTasks) * 100;
                        if (pct === 0) return null;
                        const colors: Record<string, string> = {
                          TODO: "bg-slate-400",
                          IN_PROGRESS: "bg-blue-500",
                          SUBMITTED: "bg-yellow-500",
                          REVISION: "bg-orange-500",
                          DONE: "bg-green-500",
                        };
                        return (
                          <div
                            key={status}
                            className={`h-full ${colors[status]}`}
                            style={{ width: `${pct}%` }}
                            title={`${status}: ${count}`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {(["TODO", "IN_PROGRESS", "SUBMITTED", "REVISION", "DONE"] as const).map((status) => {
                        const count = tasks.filter((t) => t.status === status).length;
                        if (count === 0) return null;
                        const colors: Record<string, string> = {
                          TODO: "bg-slate-400",
                          IN_PROGRESS: "bg-blue-500",
                          SUBMITTED: "bg-yellow-500",
                          REVISION: "bg-orange-500",
                          DONE: "bg-green-500",
                        };
                        return (
                          <div key={status} className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${colors[status]}`} />
                            <span className="text-sm text-muted-foreground">
                              {status.replace("_", " ")} ({count})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">No tasks yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks */}
        <TabsContent value="tasks">
          <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <Button
                  size="sm"
                  onClick={() => router.push("/dashboard/project-management/tasks")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Manage Tasks
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {task.assignedTo?.name}
                            </span>
                            {task.deadline && (
                              <span className={`text-xs ${new Date(task.deadline) < new Date() && task.status !== "DONE" ? "text-red-600" : "text-muted-foreground"}`}>
                                · {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={PRIORITY_COLORS[task.priority] || ""} variant="secondary">
                          {task.priority}
                        </Badge>
                        <Badge className={TASK_STATUS_COLORS[task.status] || ""} variant="secondary">
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No tasks assigned to this project</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members */}
        <TabsContent value="members">
          <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage project members</CardDescription>
                </div>
                <Button size="sm" onClick={() => setMemberDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.members?.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.user.email} · {m.role}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(m.userId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!project.members || project.members.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No members assigned yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices">
          <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoices</CardTitle>
                <Button
                  size="sm"
                  onClick={() => router.push("/dashboard/invoice/create")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={inv.type === "INCOME" ? "default" : "destructive"}>
                          {inv.type}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {inv.status} · {inv.category?.name}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm font-bold tabular-nums ${inv.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(inv.total)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No invoices for this project</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Documents</CardTitle>
                  <CardDescription>Upload and manage project documents</CardDescription>
                </div>
                <Button size="sm" onClick={() => setDocDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" /> Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900 shrink-0">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-xs">
                              {doc.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {doc.fileName} · {formatFileSize(doc.fileSize)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Uploaded by {doc.uploadedBy?.name} · {new Date(doc.createdAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {doc.fileUrl && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setDocDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" /> Upload First Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities */}
        <TabsContent value="activities">
          <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Record and track project activities</CardDescription>
                </div>
                <Button size="sm" onClick={() => setActivityDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-6">
                    {activities.map((activity) => (
                      <div key={activity.id} className="relative pl-10">
                        <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                        <div className="rounded-lg border p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium">{activity.title}</p>
                              {activity.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {activity.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {activity.createdBy?.name}
                                </span>
                                <span className="text-xs text-muted-foreground">·</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(activity.activityDate).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => handleDeleteActivity(activity.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No activities recorded yet</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setActivityDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add First Activity
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Project name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input
                  value={editForm.clientName}
                  onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>PT Name</Label>
                <Input
                  value={editForm.ptName}
                  onChange={(e) => setEditForm({ ...editForm, ptName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contract Value</Label>
                <Input
                  type="number"
                  value={editForm.contractValue}
                  onChange={(e) => setEditForm({ ...editForm, contractValue: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!editForm.name.trim() || updateProject.isPending}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>Search and select a user to add to this project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Search User</Label>
              <Input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search by name or email..."
              />
            </div>
            <div className="space-y-2">
              <Label>Select User</Label>
              <div className="max-h-48 overflow-y-auto rounded-md border">
                {availableUsers
                  .filter((u) => !project?.members?.some((m) => m.userId === u.id))
                  .map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/50 transition-colors ${selectedUserId === user.id ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="rounded-full bg-muted p-1.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                {availableUsers.filter((u) => !project?.members?.some((m) => m.userId === u.id)).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No users found</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role in Project</Label>
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!selectedUserId || addMember.isPending}>
              <UserPlus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Add a document to this project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Document Name *</Label>
              <Input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Proposal Q1 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROPOSAL">Proposal</SelectItem>
                  <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="REPORT">Report</SelectItem>
                  <SelectItem value="MINUTES">Minutes</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File *</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {docFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{docFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(docFile.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocFile(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Click to select a file</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 25MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setDocFile(f);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadDocument}
              disabled={!docName.trim() || !docFile || createDocument.isPending}
            >
              {createDocument.isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
            <DialogDescription>Record a project activity or note.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                placeholder="e.g. Client meeting"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                placeholder="Additional details..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Activity Date</Label>
              <Input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateActivity}
              disabled={!activityTitle.trim() || createActivity.isPending}
            >
              Add Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
