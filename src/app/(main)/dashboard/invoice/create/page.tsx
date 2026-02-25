"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateInvoice, useUploadInvoiceAttachment } from "@/hooks/use-invoices";
import { useProjects } from "@/hooks/use-projects";
import { useCategories } from "@/hooks/use-categories";
import { useTaxes } from "@/hooks/use-taxes";
import { useVendors } from "@/hooks/use-vendors";
import { ArrowLeft, Upload, FileText, X, Paperclip, Clock } from "lucide-react";
import { toast } from "sonner";

export default function CreateInvoicePage() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const uploadAttachment = useUploadInvoiceAttachment();

  const { data: projectsRes } = useProjects(1, 100);
  const projects = projectsRes?.data || [];

  const { data: categories = [] } = useCategories();
  const { data: taxes = [] } = useTaxes();

  const { data: vendorsRes } = useVendors(1, 100);
  const vendors = vendorsRes?.data || [];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const filteredCategories = categories.filter((c) => c.type === form.type);
  const activeTaxes = taxes.filter((t) => t.isActive);

  const selectedTax = activeTaxes.find((t) => t.id === form.taxId);
  const subtotalValue = parseFloat(form.subtotal) || 0;
  const taxAmount = selectedTax ? subtotalValue * (selectedTax.percentage / 100) : 0;
  const total = subtotalValue + taxAmount;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const invoice = await (createInvoice.mutateAsync as any)({
        type: form.type,
        projectId: form.projectId && form.projectId !== "none" ? form.projectId : undefined,
        categoryId: form.categoryId,
        vendorId: form.vendorId && form.vendorId !== "none" ? form.vendorId : undefined,
        taxId: form.taxId && form.taxId !== "none" ? form.taxId : undefined,
        amount: subtotalValue,
        dueDate: form.dueDate,
        notes: form.notes || undefined,
      });

      // Upload files if any
      if (selectedFiles.length > 0) {
        toast.info(`Uploading ${selectedFiles.length} attachments...`);
        for (const file of selectedFiles) {
          await uploadAttachment.mutateAsync({ invoiceId: invoice.id, file });
        }
      }

      toast.success("Invoice created successfully");
      router.push("/dashboard/invoice");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = form.categoryId && subtotalValue > 0 && form.dueDate;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Invoice Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <SelectItem value="INCOME">Income (Pemasukan)</SelectItem>
                      <SelectItem value="EXPENSE">Expense (Pengeluaran)</SelectItem>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <SelectItem value="none">No Vendor</SelectItem>
                      {vendors.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="min-h-[100px]"
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(subtotalValue)}
                  </span>
                </div>
                {selectedTax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tax ({selectedTax.name} - {selectedTax.percentage}%)
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="tabular-nums text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  className="px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Invoice"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Invoice Attachments */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-primary" />
                Invoice Attachments
              </CardTitle>
              <CardDescription>
                Upload supporting documents for this invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                />
                <div className="p-4 rounded-full bg-primary/10 mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB</p>
              </div>

              {selectedFiles.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Selected Files ({selectedFiles.length})
                  </p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-slate-800 group animate-in slide-in-from-right-2"
                      >
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <FileText className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs italic">No documents attached yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-primary/5 dark:bg-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Receipt className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="text-sm font-semibold">Accounting Tip</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Always attach original receipts or invoices for better audit tracking and tax compliance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Receipt } from "lucide-react";
