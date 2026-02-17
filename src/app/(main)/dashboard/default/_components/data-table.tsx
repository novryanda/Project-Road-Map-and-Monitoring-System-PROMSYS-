"use client";
"use no memo";

import * as React from "react";
import type { z } from "zod";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { dashboardColumns } from "./columns";
import type { recentProjectSchema } from "./schema";

export function DataTable({ data: initialData }: { data: z.infer<typeof recentProjectSchema>[] }) {
  const [data, setData] = React.useState(() => initialData);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const table = useDataTableInstance({
    data,
    columns: dashboardColumns,
    getRowId: (row) => row.id,
  });

  return (
    <Tabs defaultValue="all" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between">
        <TabsList className="**:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <TabsContent value="all" className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-lg border">
          <DataTableNew table={table} columns={dashboardColumns} />
        </div>
        <DataTablePagination table={table} />
      </TabsContent>
      <TabsContent value="active" className="relative flex flex-col gap-4 overflow-auto">
        <ActiveProjectsTable data={data.filter((p) => p.status === "ACTIVE")} />
      </TabsContent>
      <TabsContent value="completed" className="relative flex flex-col gap-4 overflow-auto">
        <ActiveProjectsTable data={data.filter((p) => p.status === "COMPLETED")} />
      </TabsContent>
    </Tabs>
  );
}

function ActiveProjectsTable({ data }: { data: z.infer<typeof recentProjectSchema>[] }) {
  const table = useDataTableInstance({
    data,
    columns: dashboardColumns,
    getRowId: (row) => row.id,
  });

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <DataTableNew table={table} columns={dashboardColumns} />
      </div>
      <DataTablePagination table={table} />
    </>
  );
}
