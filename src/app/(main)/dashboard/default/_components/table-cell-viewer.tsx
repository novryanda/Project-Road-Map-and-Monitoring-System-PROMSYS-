import { CalendarDays, ListTodo, Users } from "lucide-react";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

import type { recentProjectSchema } from "./schema";

const statusMap: Record<string, { label: string; color: string }> = {
  PLANNING: { label: "Planning", color: "bg-blue-500" },
  ACTIVE: { label: "Active", color: "bg-green-500" },
  ON_HOLD: { label: "On Hold", color: "bg-yellow-500" },
  COMPLETED: { label: "Completed", color: "bg-emerald-500" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500" },
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function TableCellViewer({ item }: { item: z.infer<typeof recentProjectSchema> }) {
  const isMobile = useIsMobile();
  const statusCfg = statusMap[item.status] ?? { label: item.status, color: "bg-gray-500" };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>
            {item.clientName ? `Client: ${item.clientName}` : "Project Details"}
            {item.ptName ? ` — ${item.ptName}` : ""}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {/* Status & Key Info */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5">
              <span className={`size-2 rounded-full ${statusCfg.color}`} />
              {statusCfg.label}
            </Badge>
            {item.contractValue != null && (
              <Badge variant="secondary" className="font-mono">
                {formatCurrency(item.contractValue)}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Start Date</span>
              <div className="flex items-center gap-1.5 font-medium">
                <CalendarDays className="size-3.5 text-muted-foreground" />
                {formatDate(item.startDate)}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">End Date</span>
              <div className="flex items-center gap-1.5 font-medium">
                <CalendarDays className="size-3.5 text-muted-foreground" />
                {formatDate(item.endDate)}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Tasks</span>
              <div className="flex items-center gap-1.5 font-medium">
                <ListTodo className="size-3.5 text-muted-foreground" />
                {item._count.tasks} tasks
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Members</span>
              <div className="flex items-center gap-1.5 font-medium">
                <Users className="size-3.5 text-muted-foreground" />
                {item._count.members} members
              </div>
            </div>
          </div>

          <Separator />

          {/* Created Info */}
          <div className="grid gap-2">
            <div className="flex gap-2 text-muted-foreground">
              Created by <span className="font-medium text-foreground">{item.createdBy.name}</span>
            </div>
            <div className="text-muted-foreground">
              {formatDate(item.createdAt)}
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button
            onClick={() => {
              window.location.href = `/dashboard/project-management/project/${item.id}`;
            }}
          >
            View Project
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
