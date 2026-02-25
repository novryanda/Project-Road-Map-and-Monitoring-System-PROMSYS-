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
import { useCreateReimbursement, useUploadReimbursementAttachment } from "@/hooks/use-reimbursements";
import { useProjects } from "@/hooks/use-projects";
import { useCategories } from "@/hooks/use-categories";
import {
    ArrowLeft,
    Upload,
    FileText,
    X,
    Plus,
    Trash2
} from "lucide-react";
import { toast } from "sonner";

export default function CreateReimbursementPage() {
    const router = useRouter();
    const createReimbursement = useCreateReimbursement();
    const uploadAttachment = useUploadReimbursementAttachment();
    const { data: projectsRes } = useProjects(1, 100);
    const projects = projectsRes?.data || [];
    const { data: categories = [] } = useCategories();

    // Filter only EXPENSE categories for reimbursement
    const expenseCategories = categories.filter(c => c.type === "EXPENSE");

    const [form, setForm] = useState({
        title: "",
        description: "",
        amount: "",
        projectId: "none",
        categoryId: "",
    });

    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(val);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!form.title || !form.amount || !form.categoryId) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            // 1. Create Reimbursement
            const reimbursement = await (createReimbursement.mutateAsync as any)({
                title: form.title,
                description: form.description,
                amount: parseFloat(form.amount),
                categoryId: form.categoryId,
                projectId: form.projectId === "none" ? undefined : form.projectId,
            });

            // 2. Upload Files if any
            if (files.length > 0) {
                const uploadPromises = files.map(file =>
                    uploadAttachment.mutateAsync({
                        reimbursementId: reimbursement.id,
                        file
                    })
                );

                await Promise.all(uploadPromises);
            }

            toast.success("Reimbursement request submitted successfully");
            router.push("/dashboard/reimbursement");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit reimbursement request");
        }
    };

    const isValid = form.title && form.amount && form.categoryId;

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Request Reimbursement</h1>
                    <p className="text-muted-foreground">
                        Submit a new reimbursement request for approval
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                        <CardHeader>
                            <CardTitle>Reimbursement Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input
                                    placeholder="e.g. Travel Expenses for Client Meeting"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Amount (IDR) *</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category *</Label>
                                    <Select
                                        value={form.categoryId}
                                        onValueChange={(v) => setForm({ ...form, categoryId: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expenseCategories.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Project (Optional)</Label>
                                <Select
                                    value={form.projectId}
                                    onValueChange={(v) => setForm({ ...form, projectId: v })}
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

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Describe the expense details..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Attachments */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50 h-full">
                        <CardHeader>
                            <CardTitle>Attachments</CardTitle>
                            <CardDescription>Upload receipts or proofs</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    accept="image/*,.pdf"
                                />
                                <div className="p-3 bg-primary/10 rounded-full mb-3">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm font-medium">Click to upload files</p>
                                <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB</p>
                            </div>

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Selected Files ({files.length})</Label>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border text-sm group">
                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                    <FileText className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleSubmit}
                        disabled={!isValid || createReimbursement.isPending || uploadAttachment.isPending}
                    >
                        {(createReimbursement.isPending || uploadAttachment.isPending) ? (
                            <>Submitting...</>
                        ) : (
                            <>Submit Reimbursement</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
