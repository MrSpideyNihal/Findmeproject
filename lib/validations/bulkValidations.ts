import { z } from 'zod';

// ─── Relaxed Member Schema for Bulk Import ────────────────────────────────────

export const bulkMemberSchema = z.object({
  name: z.string().min(1, 'Member name is required').max(100).trim(),
  email: z.string().email('Member email must be valid').toLowerCase().trim(),
  role: z.string().min(1, 'Member role is required').max(100).trim(),
  isLead: z.boolean().default(false),
});

// ─── Relaxed Project Schema for Bulk Import ───────────────────────────────────
// More lenient than the standard projectSchema to handle real-world Excel data

export const bulkProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'Project title must be at least 3 characters')
    .max(300, 'Title cannot exceed 300 characters')
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
    .min(10, 'Abstract must be at least 10 characters')
    .max(10000, 'Abstract cannot exceed 10000 characters'),
  githubUrl: z
    .string()
    .url('GitHub URL must be a valid URL')
    .default('https://github.com/pending-upload'),
  youtubeUrl: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((v) => v ?? ''),
  members: z
    .array(bulkMemberSchema)
    .min(1, 'At least one member is required')
    .max(20, 'Cannot have more than 20 members'),
  mentorName: z.string().max(200).trim().optional().or(z.literal('')),
  tags: z.array(z.string().trim().min(1).max(50)).max(15).default([]),
});

// ─── Bulk Import Request Schema ───────────────────────────────────────────────

export const bulkImportSchema = z.object({
  projects: z
    .array(bulkProjectSchema)
    .min(1, 'At least one project is required')
    .max(200, 'Cannot import more than 200 projects at once'),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type BulkMemberInput = z.infer<typeof bulkMemberSchema>;
export type BulkProjectInput = z.infer<typeof bulkProjectSchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
