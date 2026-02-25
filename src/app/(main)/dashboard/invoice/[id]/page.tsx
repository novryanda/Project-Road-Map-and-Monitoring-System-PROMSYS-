"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useInvoice, useUploadInvoiceAttachment, useUpdateInvoiceStatus } from "@/hooks/use-invoices";
import { useReimbursement, useMarkReimbursementPaid, useUploadReimbursementAttachment } from "@/hooks/use-reimbursements";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    FileText,
    Calendar,
    DollarSign,
    Tag,
    Briefcase,
    Download,
    Upload,
    Clock,
    CheckCircle2,
    XCircle,
    Receipt,
    Printer,
    Share2,
    Trash2,
    Paperclip
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useRef, useState } from "react";
import { toast } from "sonner";
const STATUS_COLORS: Record<string, string> = {
    // Invoice
    PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    UNPAID: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    DEBT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    // Reimbursement
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

import { use } from "react";

export default function FinanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const searchParams = useSearchParams();
    const type = searchParams.get("type") || "INVOICE"; // Default to INVOICE if not specified

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto">
            {type === "REIMBURSEMENT" ? (
                <ReimbursementDetailView id={id} />
            ) : (
                <InvoiceDetailView id={id} />
            )}
        </div>
    );
}

function InvoiceDetailView({ id }: { id: string }) {
    const router = useRouter();
    const { data: invoice, isLoading } = useInvoice(id);

    if (isLoading) return <div className="p-12 text-center animate-pulse text-muted-foreground font-medium">Loading Invoice Data...</div>;
    if (!invoice) return <div className="p-12 text-center text-red-500 font-medium">Invoice not found</div>;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

    const formatDate = (date: any) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-8">
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tighter uppercase">{invoice.invoiceNumber}</h1>
                            <Badge className={`${STATUS_COLORS[invoice.status]} font-bold px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider`} variant="secondary">
                                {invoice.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm font-medium tracking-tight">
                            {invoice.category?.name} &bull; {invoice.project?.name || "General Business"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl font-bold text-xs" onClick={() => window.print()}>
                        <Printer className="mr-2 h-3.5 w-3.5" /> Print
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl font-bold text-xs">
                        <Download className="mr-2 h-3.5 w-3.5" /> Export PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Information Sections */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Parties Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Payee Information</h3>
                            <div className="p-6 rounded-2xl bg-muted/30 border border-muted-foreground/10 space-y-1">
                                <p className="font-black text-lg text-primary">{invoice.vendor?.name || "Internal"}</p>
                                {invoice.vendor?.location && <p className="text-sm text-muted-foreground leading-relaxed">{invoice.vendor.location}</p>}
                                {invoice.vendor?.email && <p className="text-sm text-muted-foreground font-medium">{invoice.vendor.email}</p>}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Billing Dates</h3>
                            <div className="p-6 rounded-2xl border border-muted-foreground/10 space-y-4 bg-white/50 dark:bg-slate-900/50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Issued Date</span>
                                    <span className="font-bold">{formatDate(invoice.createdAt)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Due Date</span>
                                    <span className="font-bold">{formatDate(invoice.dueDate)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Settled Date</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">{formatDate(invoice.paidAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description / Summary Table */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Financial Breakdown</h3>
                        <div className="overflow-hidden rounded-2xl border border-muted-foreground/10 shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-b-muted-foreground/10">
                                        <TableHead className="pl-6 h-12 text-[10px] font-black uppercase tracking-widest">Detail & Categorization</TableHead>
                                        <TableHead className="text-right pr-6 h-12 text-[10px] font-black uppercase tracking-widest">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="hover:bg-muted/20 border-b-muted-foreground/5 transition-colors">
                                        <TableCell className="pl-6 py-8">
                                            <div className="space-y-2">
                                                <p className="font-bold text-lg leading-tight">
                                                    {invoice.notes || invoice.category?.name || "Financial Transaction"}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] font-bold uppercase rounded-md tracking-tighter py-0 px-1.5 border-muted-foreground/20">
                                                        {invoice.type}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        Ref: {invoice.project?.name || "General"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 tabular-nums font-black text-lg">
                                            {formatCurrency(invoice.amount)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            {/* Calculation Summary */}
                            <div className="flex justify-end p-8 bg-muted/10 border-t border-muted-foreground/5">
                                <div className="w-full max-w-[240px] space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-widest">Base Amount</span>
                                        <span className="tabular-nums font-bold">{formatCurrency(invoice.amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-widest">Tax Impact ({invoice.tax?.percentage || 0}%)</span>
                                        <span className="tabular-nums font-bold">{formatCurrency(invoice.taxAmount)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-muted-foreground/20 flex justify-between items-baseline">
                                        <span className="text-sm font-black uppercase tracking-tighter">Grand Total</span>
                                        <span className="text-3xl font-black text-primary tracking-tighter tabular-nums">
                                            {formatCurrency(invoice.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Documents / Metadata */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Metadata Card */}
                    <Card className="rounded-2xl border-none bg-muted/20 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">System Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Tag className="h-4 w-4 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Category</p>
                                    <p className="text-sm font-black">{invoice.category?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Briefcase className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Scope / Project</p>
                                    <p className="text-sm font-black">{invoice.project?.name || "Global"}</p>
                                </div>
                            </div>
                            <Separator className="opacity-50" />
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5 text-xs text-muted-foreground italic">
                                    Created by {invoice.createdBy?.name || "System"} on {new Date(invoice.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attachments Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Supporting Documents</h3>
                        {invoice.attachments?.length > 0 ? (
                            <div className="space-y-2">
                                {invoice.attachments.map((att: any) => (
                                    <div key={att.id} className="group flex items-center justify-between p-4 rounded-xl border border-muted-foreground/10 hover:border-primary/50 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-xs font-black truncate leading-tight group-hover:text-primary">{att.file?.originalName || att.fileName}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold font-mono">
                                                    {att.file?.size || att.fileSize
                                                        ? `${((att.file?.size || att.fileSize) / 1024 / 1024).toFixed(2)} MB`
                                                        : "Size Unknown"}
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all" asChild>
                                            <a href={att.file?.url || att.fileUrl} target="_blank" rel="noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/10 opacity-60">
                                <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30 rotate-45" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Stored File Index Empty</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReimbursementDetailView({ id }: { id: string }) {
    const router = useRouter();
    const { data: reimbursement, isLoading } = useReimbursement(id);
    const markPaid = useMarkReimbursementPaid();
    const uploadAttachment = useUploadReimbursementAttachment();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    if (isLoading) return <div className="p-8 text-center">Loading Reimbursement...</div>;
    if (!reimbursement) return <div className="p-8 text-center">Reimbursement not found</div>;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await uploadAttachment.mutateAsync({ reimbursementId: id, file });
            toast.success("Payment proof uploaded");
        } catch {
            toast.error("Failed to upload proof");
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleMarkPaid = async () => {
        if (!confirm("Are you sure you want to mark this reimbursement as PAID? Ensure you have verified the transfer.")) return;
        try {
            await markPaid.mutateAsync(id);
            toast.success("Reimbursement marked as PAID");
        } catch {
            toast.error("Failed to update status");
        }
    };

    return (
        <>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">Reimbursement Request</h1>
                        <Badge className={STATUS_COLORS[reimbursement.status]} variant="secondary">{reimbursement.status}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">Submitted by {reimbursement.submittedBy.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Title</p>
                                    <p className="font-medium">{reimbursement.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                    <p className="text-xl font-bold">{formatCurrency(reimbursement.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                                    <p>{reimbursement.category.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Project</p>
                                    <p>{reimbursement.project?.name || "-"}</p>
                                </div>
                            </div>
                            {reimbursement.description && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                                    <p className="text-sm bg-muted/30 p-3 rounded">{reimbursement.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Attachments & Proofs</CardTitle></CardHeader>
                        <CardContent>
                            {reimbursement.attachments?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {reimbursement.attachments.map((att) => (
                                        <div key={att.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <span className="text-sm truncate">{att.fileName || "Unknown File"}</span>
                                            </div>
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={att.fileUrl} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No attachments</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="sticky top-6">
                        <CardHeader><CardTitle>Finance Actions</CardTitle><CardDescription>Process this reimbursement</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            {reimbursement.status === "APPROVED" && (
                                <>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">1. Upload Payment Proof</p>
                                        <div
                                            className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                accept="image/*,.pdf"
                                            />
                                            {isUploading ? (
                                                <Clock className="h-6 w-6 text-muted-foreground animate-spin" />
                                            ) : (
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2">Click to upload proof</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">2. Complete Payment</p>
                                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleMarkPaid}>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Mark as Paid
                                        </Button>
                                    </div>
                                </>
                            )}

                            {reimbursement.status === "PAID" && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded text-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="font-medium text-green-800 dark:text-green-200">Reimbursement Paid</p>
                                    <p className="text-xs text-green-600 dark:text-green-300">
                                        {reimbursement.updatedAt ? new Date(reimbursement.updatedAt).toLocaleDateString() : ""}
                                    </p>
                                </div>
                            )}

                            {reimbursement.status === "PENDING" && (
                                <div className="text-center p-4 bg-muted/50 rounded">
                                    <p className="text-sm text-muted-foreground">Waiting for manager approval.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
