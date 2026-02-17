import { z } from "zod";

export const recentProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  clientName: z.string().nullable(),
  ptName: z.string().nullable(),
  status: z.string(),
  contractValue: z.number().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  createdAt: z.string(),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  _count: z.object({
    tasks: z.number(),
    members: z.number(),
  }),
});
