import { z } from 'zod';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: z.string().email('Please enter a valid email').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

// ─── Member Schema ────────────────────────────────────────────────────────────

export const memberSchema = z.object({
  name: z.string().min(1, 'Member name is required').max(100).trim(),
  email: z.string().email('Member email must be valid').toLowerCase().trim(),
  role: z.string().min(1, 'Member role is required').max(50).trim(),
  isLead: z.boolean().default(false),
});

// ─── Project Schema ───────────────────────────────────────────────────────────

export const projectSchema = z.object({
  title: z
    .string()
    .min(3, 'Project title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  groupName: z
    .string()
    .min(1, 'Group name is required')
    .max(100, 'Group name cannot exceed 100 characters')
    .trim(),
  batchName: z
    .string()
    .min(1, 'Batch name is required')
    .max(50, 'Batch name cannot exceed 50 characters')
    .trim(),
  abstract: z
    .string()
    .min(50, 'Abstract must be at least 50 characters')
    .max(5000, 'Abstract cannot exceed 5000 characters'),
  githubUrl: z
    .string()
    .url('GitHub URL must be a valid URL')
    .regex(/^https?:\/\/(www\.)?github\.com\/.+/, 'Must be a valid GitHub repository URL'),
  youtubeUrl: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((v) => v ?? ''),
  members: z
    .array(memberSchema)
    .min(1, 'At least one member is required')
    .max(20, 'Cannot have more than 20 members')
    .refine(
      (members) => members.filter((m) => m.isLead).length <= 1,
      'Only one member can be the project lead'
    ),
  mentorName: z.string().max(100).trim().optional().or(z.literal('')),
  tags: z.array(z.string().trim().min(1).max(30)).max(10, 'Cannot have more than 10 tags').default([]),
});

// ─── Search Schema ────────────────────────────────────────────────────────────

export const searchSchema = z.object({
  q: z.string().max(200).optional().default(''),
  batch: z.string().max(50).optional().default(''),
  tags: z.string().max(200).optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sortBy: z.string().optional().default('newest'),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MemberInput = z.infer<typeof memberSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
