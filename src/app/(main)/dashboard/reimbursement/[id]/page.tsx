"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import {
    useReimbursement,
    useApproveReimbursement,
    useRejectReimbursement,
    useMarkReimbursementPaid,
    useUploadReimbursementAttachment
} from "@/hooks/use-reimbursements";
import {
    ArrowLeft,
    FileText,
    Calendar,
    DollarSign,
    Tag,
    Briefcase,
    CheckCircle2,
    XCircle,
    Clock,
    Download,
    User,
    ShieldCheck,
    CreditCard,
    Upload,
    Loader2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200",
    APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200",
    PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200",
};

import { use } from "react";

export default function ReimbursementDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const { id } = use(params);
    const { data: reimbursement, isLoading, refetch } = useReimbursement(id);

    // Actions
    const approveMutation = useApproveReimbursement();
    const rejectMutation = useRejectReimbursement();
    const payMutation = useMarkReimbursementPaid();
    const uploadMutation = useUploadReimbursementAttachment();

    // Dialog States
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [payDialogOpen, setPayDialogOpen] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);

    if (isLoading) return <div className="p-8 text-center bg-slate-50 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
    if (!reimbursement) return <div className="p-8 text-center">Reimbursement not found</div>;

    const isAdminOrFinance = currentUser?.role === 'ADMIN' || currentUser?.role === 'FINANCE';
    const isOwner = currentUser?.id === reimbursement.submittedById;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(val);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleApprove = async () => {
        try {
            await approveMutation.mutateAsync(reimbursement.id);
            toast.success("Reimbursement approved successfully");
            refetch();
        } catch (error) {
            toast.error("Failed to approve reimbursement");
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) return toast.error("Please provide a reason");
        try {
            await rejectMutation.mutateAsync({ id: reimbursement.id, reason: rejectionReason });
            toast.success("Reimbursement rejected");
            setRejectDialogOpen(false);
            refetch();
        } catch (error) {
            toast.error("Failed to reject");
        }
    };

    const handlePay = async () => {
        if (!proofFile) return toast.error("Please upload proof of payment");
        try {
            // 1. Mark as Paid
            await payMutation.mutateAsync(reimbursement.id);
            // 2. Upload Attachment as PAYMENT type
            await uploadMutation.mutateAsync({
                reimbursementId: reimbursement.id,
                file: proofFile,
                type: 'PAYMENT'
            });
            toast.success("Reimbursement marked as PAID with proof");
            setPayDialogOpen(false);
            setProofFile(null);
            refetch();
        } catch (error) {
            toast.error("Failed to process payment");
        }
    };

    const submissionAttachments = reimbursement.attachments.filter(att => att.type === 'SUBMISSION' || !att.type);
    const paymentAttachments = reimbursement.attachments.filter(att => att.type === 'PAYMENT');

    const steps = [
        { label: "Submitted", date: reimbursement.createdAt, status: "completed", icon: <CheckCircle2 className="h-4 w-4" /> },
        {
            label: "Reviewed",
            date: (reimbursement.status === "APPROVED" || reimbursement.status === "REJECTED" || reimbursement.status === "PAID") ? reimbursement.updatedAt : null,
            status: reimbursement.status === "PENDING" ? "current" :
                (reimbursement.status === "REJECTED" ? "rejected" : "completed"),
            icon: reimbursement.status === "REJECTED" ? <XCircle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />
        },
        {
            label: "Payment Processed",
            date: reimbursement.status === "PAID" ? reimbursement.updatedAt : null,
            status: reimbursement.status === "PAID" ? "completed" :
                (reimbursement.status === "APPROVED" ? "current" : "pending"),
            icon: <CreditCard className="h-4 w-4" />
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50 pb-20">
            <div className="flex flex-col gap-6 p-6 md:p-8 max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{reimbursement.title}</h1>
                                <Badge className={`rounded-full px-3 py-1 border text-xs font-semibold ${STATUS_COLORS[reimbursement.status]}`} variant="outline">
                                    {reimbursement.status}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {formatDate(reimbursement.createdAt)}</span>
                                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {reimbursement.submittedBy.name}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Amount</span>
                        <span className="text-3xl font-black text-slate-900 tabular-nums">
                            {formatCurrency(reimbursement.amount)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left: Progress & Quick Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b py-4">
                                <CardTitle className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Workflow</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="relative pl-6 border-l-2 border-slate-100 space-y-10 pb-2">
                                    {steps.map((step, idx) => (
                                        <div key={idx} className="relative">
                                            <div className={`absolute -left-[31px] top-0 h-6 w-6 rounded-full border-2 flex items-center justify-center
                                                ${step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                                                    step.status === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
                                                        step.status === 'rejected' ? 'bg-red-500 border-red-500 text-white' :
                                                            'bg-white border-slate-200 text-slate-300'}`}
                                            >
                                                {step.icon}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <p className={`text-xs font-bold uppercase tracking-wide ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                                                    {step.label}
                                                </p>
                                                {step.date ? (
                                                    <p className="text-[10px] text-muted-foreground font-medium">
                                                        {formatDate(step.date as any)}
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] text-slate-300 italic">Waiting...</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white">
                            <CardHeader className="bg-slate-50 border-b py-4">
                                <CardTitle className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Properties</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Tag className="h-3.5 w-3.5 text-slate-400" />
                                        {reimbursement.category.name}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Project Link</label>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                        {reimbursement.project ? reimbursement.project.name : "N/A"}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle: Content */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="border-none shadow-sm bg-white">
                            <CardHeader className="py-4 border-b">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-900">Description & Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-8">
                                <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed italic">
                                    {reimbursement.description || "No detailed description provided by the applicant."}
                                </div>

                                {reimbursement.rejectionReason && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-sm font-bold text-red-900 uppercase tracking-tight">Declined Logic</span>
                                        </div>
                                        <p className="text-sm text-red-700 leading-relaxed font-medium">
                                            {reimbursement.rejectionReason}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="py-4 border-b">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-900">Supporting Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {submissionAttachments.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                        <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm text-slate-400 font-medium italic">No submission receipts provided.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {submissionAttachments.map((att) => (
                                            <div key={att.id} className="group flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-all">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-blue-50 dark:bg-blue-900/10 rounded-lg flex items-center justify-center">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0 pr-2">
                                                        <span className="text-sm font-bold text-slate-900 truncate">{att.fileName || "Attachment"}</span>
                                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                                                            {(att.fileSize / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                                    <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {(paymentAttachments.length > 0 || reimbursement.status === 'PAID') && (
                            <Card className="border-none shadow-sm bg-white overflow-hidden border-l-4 border-l-green-500">
                                <CardHeader className="py-4 border-b bg-green-50/30">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-green-900">Proof of Payment</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {paymentAttachments.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-xs text-muted-foreground italic tracking-wide">Processing official bank transfer slip...</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {paymentAttachments.map((att) => (
                                                <div key={att.id} className="group flex items-center justify-between p-4 border border-green-100 rounded-xl bg-green-50/20 hover:bg-green-50 transition-all">
                                                    <div className="flex items-center gap-4 overflow-hidden">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-green-100 rounded-lg flex items-center justify-center">
                                                            <CreditCard className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0 pr-2">
                                                            <span className="text-sm font-bold text-green-900 truncate">{att.fileName || "Transfer Slip"}</span>
                                                            <span className="text-xs text-green-600/70 font-medium uppercase tracking-widest">
                                                                {(att.fileSize / 1024 / 1024).toFixed(2)} MB
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity text-green-600" asChild>
                                                        <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            {isAdminOrFinance && reimbursement.status !== 'PAID' && reimbursement.status !== 'REJECTED' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t z-50 py-4 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-5">
                    <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Approval & Payment</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {reimbursement.status === 'PENDING' ? (
                                <>
                                    <Button variant="outline" className="rounded-full px-6 border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-100 hover:text-red-700 font-bold" onClick={() => setRejectDialogOpen(true)}>
                                        <XCircle className="h-4 w-4 mr-2" /> Decline Request
                                    </Button>
                                    <Button className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-bold" onClick={handleApprove} disabled={approveMutation.isPending}>
                                        {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />} Standard Approve
                                    </Button>
                                </>
                            ) : reimbursement.status === 'APPROVED' ? (
                                <Button className="rounded-full px-10 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 font-bold" onClick={() => setPayDialogOpen(true)}>
                                    <DollarSign className="h-4 w-4 mr-2" /> Mark as Paid
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Decline Reimbursement</DialogTitle>
                        <DialogDescription>Please provide a clear reason for declining this request.</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="e.g., Note is unclear or project allotment exceeded..."
                        className="min-h-[120px]"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
                            {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm Decline"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Payment</DialogTitle>
                        <DialogDescription>Attach proof of transfer to complete the payment workflow.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-10 px-6 gap-4 bg-slate-50/50">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Upload className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-900">{proofFile ? proofFile.name : "Select Transfer Slip"}</p>
                            <p className="text-xs text-slate-400 mt-1 font-medium">JPEG, PNG, or PDF up to 10MB</p>
                        </div>
                        <input
                            type="file"
                            id="proof-upload"
                            className="hidden"
                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                            accept="image/*,.pdf"
                        />
                        <Button variant="outline" size="sm" asChild className="rounded-full px-6 bg-white cursor-pointer">
                            <label htmlFor="proof-upload">Browse Files</label>
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => { setPayDialogOpen(false); setProofFile(null); }}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700 rounded-full px-8 font-bold" onClick={handlePay} disabled={payMutation.isPending || uploadMutation.isPending || !proofFile}>
                            {(payMutation.isPending || uploadMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />} Confirm & Pay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
