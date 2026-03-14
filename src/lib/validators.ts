import { z } from "zod";

export const STATUS_VALUES = ["idea", "in_progress", "launched", "shelved"] as const;
export type Status = (typeof STATUS_VALUES)[number];

/**
 * Schema for creating a new idea.
 * Used by POST /api/ideas and the IdeaForm (create mode).
 */
export const CreateIdeaSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional(),
  status: z.enum(STATUS_VALUES, {
    errorMap: () => ({ message: "Invalid status value" }),
  }),
  tags: z
    .array(z.string().max(50, "Each tag must be 50 characters or fewer"))
    .max(5, "Maximum 5 tags allowed")
    .optional(),
  url: z
    .string()
    .url("Enter a valid URL (e.g. https://example.com)")
    .optional()
    .or(z.literal("")),
});

/**
 * Schema for patching the status of an existing idea.
 * Used by PATCH /api/ideas/[id].
 */
export const PatchStatusSchema = z.object({
  status: z.enum(STATUS_VALUES, {
    errorMap: () => ({ message: "Invalid status value" }),
  }),
});

/**
 * Schema for a full update of an existing idea.
 * Used by PUT /api/ideas/[id] and the IdeaForm (edit mode).
 * Same shape as CreateIdeaSchema — all fields re-validated on update.
 */
export const UpdateIdeaSchema = CreateIdeaSchema;

export type CreateIdeaInput = z.infer<typeof CreateIdeaSchema>;
export type PatchStatusInput = z.infer<typeof PatchStatusSchema>;
export type UpdateIdeaInput = z.infer<typeof UpdateIdeaSchema>;
