"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateInvoice, useUploadInvoiceAttachment } from "@/hooks/use-invoices";
import {
  useReimbursements,
  useUploadReimbursementAttachment,
} from "@/hooks/use-reimbursements";
import { useProjects } from "@/hooks/use-projects";
import { useCategories } from "@/hooks/use-categories";
import { useTaxes } from "@/hooks/use-taxes";
import { useVendors } from "@/hooks/use-vendors";
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  Receipt,
  CheckCircle,
  Clock,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";

const REIMBURSEMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const uploadInvoiceAttachment = useUploadInvoiceAttachment();
  const uploadReimbursementAttachment = useUploadReimbursementAttachment();
  const { data: projectsRes } = useProjects(1, 100);
  const projects = projectsRes?.data || [];
  const { data: categories = [] } = useCategories();
  const { data: taxes = [] } = useTaxes();
  const { data: vendorsRes } = useVendors(1, 100);
  const vendors = vendorsRes?.data || [];
  const { data: reimbursementsRes } = useReimbursements({ status: "APPROVED", page: 1, size: 100 });
  const reimbursements = reimbursementsRes?.data || [];

  const [form, setForm] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    projectId: "",
    categoryId: "",
    vendorId: "",
    taxId: "",
    subtotal: "",
    dueDate: "",
    notes: "",
  });

  // Reimbursement upload state
  const [reimbursementFiles, setReimbursementFiles] = useState<
    { reimbursementId: string; file: File }[]
  >([]);
  const [uploadingReimbursement, setUploadingReimbursement] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeReimbursementId, setActiveReimbursementId] = useState("");

  const filteredCategories = categories.filter((c) => c.type === form.type);
  const activeTaxes = taxes.filter((t) => t.isActive);

  const selectedTax = activeTaxes.find((t) => t.id === form.taxId);
  const subtotal = parseFloat(form.subtotal) || 0;
  const taxAmount = selectedTax ? subtotal * (selectedTax.percentage / 100) : 0;
  const total = subtotal + taxAmount;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  const handleSubmit = async () => {
    try {
      await createInvoice.mutateAsync({
        type: form.type,
        projectId: form.projectId || undefined,
        categoryId: form.categoryId,
        vendorId: form.vendorId || undefined,
        taxId: form.taxId || undefined,
        subtotal,
        dueDate: form.dueDate,
        notes: form.notes || undefined,
      });
      toast.success("Invoice created successfully");
      router.push("/dashboard/invoice");
    } catch {
      toast.error("Failed to create invoice");
    }
  };

  const handleReimbursementFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !activeReimbursementId) return;

      // Upload immediately
      setUploadingReimbursement(activeReimbursementId);
      uploadReimbursementAttachment.mutate(
        { reimbursementId: activeReimbursementId, file },
        {
          onSuccess: () => {
            toast.success("File uploaded to reimbursement");
            setUploadingReimbursement(null);
          },
          onError: () => {
            toast.error("Failed to upload file");
            setUploadingReimbursement(null);
          },
        }
      );

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [activeReimbursementId, uploadReimbursementAttachment]
  );

  const triggerFileUpload = (reimbursementId: string) => {
    setActiveReimbursementId(reimbursementId);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const isValid = form.categoryId && subtotal > 0 && form.dueDate;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">
            Fill in the details to create a new invoice
          </p>
        </div>
      </div>

      {/* Hidden file input for reimbursement uploads */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
        onChange={handleReimbursementFileSelect}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Invoice Form */}
        <div className="lg:col-span-3">
          <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v: string) =>
                      setForm({
                        ...form,
                        type: v as "INCOME" | "EXPENSE",
                        categoryId: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Income</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={form.projectId}
                    onValueChange={(v: string) => setForm({ ...form, projectId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Project</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v: string) => setForm({ ...form, categoryId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Select
                    value={form.vendorId}
                    onValueChange={(v: string) => setForm({ ...form, vendorId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subtotal (IDR) *</Label>
                  <Input
                    type="number"
                    value={form.subtotal}
                    onChange={(e) =>
                      setForm({ ...form, subtotal: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax</Label>
                  <Select
                    value={form.taxId}
                    onValueChange={(v: string) => setForm({ ...form, taxId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No tax" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Tax</SelectItem>
                      {activeTaxes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} ({t.percentage}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                />
              </div>

              {/* Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {selectedTax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tax ({selectedTax.name} - {selectedTax.percentage}%)
                    </span>
                    <span className="tabular-nums">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || createInvoice.isPending}
                >
                  {createInvoice.isPending ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Reimbursement Upload Panel */}
        <div className="lg:col-span-2">
          <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50 sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Reimbursement Uploads
              </CardTitle>
              <CardDescription>
                Upload supporting documents for approved reimbursements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reimbursements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <Receipt className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No approved reimbursements to upload documents for
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reimbursements.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border bg-white/80 dark:bg-slate-800/80 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{r.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.project?.name || "No Project"}
                          </p>
                        </div>
                        <Badge
                          className={REIMBURSEMENT_STATUS_COLORS[r.status] || ""}
                          variant="secondary"
                        >
                          {r.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="tabular-nums font-medium text-foreground">
                          {formatCurrency(r.amount)}
                        </span>
                        <span>{r.submittedBy?.name}</span>
                      </div>

                      {/* Existing attachments */}
                      {r.attachments && r.attachments.length > 0 && (
                        <div className="space-y-1">
                          {r.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1"
                            >
                              <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="truncate flex-1">
                                {att.file.originalName}
                              </span>
                              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={uploadingReimbursement === r.id}
                        onClick={() => triggerFileUpload(r.id)}
                      >
                        {uploadingReimbursement === r.id ? (
                          <>
                            <Clock className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-3.5 w-3.5" />
                            Upload Document
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
