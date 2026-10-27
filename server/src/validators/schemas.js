import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Enter a valid identifier.");
const nullableDate = z.union([z.null(), z.literal(""), z.coerce.date()]).optional().transform((value) => value ?? null);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
}).strict();

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
}).strict();

export const subjectCreateSchema = z.object({
  name: z.string().trim().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  description: z.string().trim().max(300).optional(),
}).strict();

export const subjectUpdateSchema = subjectCreateSchema.partial().extend({ archived: z.boolean().optional() }).strict();

export const taskCreateSchema = z.object({
  subjectId: objectId.nullable().optional(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(["assignment", "exam", "revision", "other"]).optional(),
  status: z.enum(["todo", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueAt: nullableDate,
  estimatedMinutes: z.number().int().min(1).max(10080).nullable().optional(),
}).strict();

export const taskUpdateSchema = taskCreateSchema.partial().strict();

export const taskQuerySchema = z.object({
  status: z.enum(["todo", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  type: z.enum(["assignment", "exam", "revision", "other"]).optional(),
  subjectId: objectId.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sort: z.enum(["dueAt", "createdAt", "priority"]).default("dueAt"),
  order: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
}).strict();

export const sessionQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export const sessionCreateSchema = z.object({
  subjectId: objectId.nullable().optional(),
  taskId: objectId.nullable().optional(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
  durationMinutes: z.number().int().positive().max(720).optional(),
  note: z.string().trim().max(500).optional(),
  mode: z.enum(["focus", "manual"]).default("focus"),
}).strict();

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    weeklyGoalMinutes: z.number().int().min(0).max(10080).optional(),
  }).strict().optional(),
}).strict();

export const idSchema = objectId;