import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1),
  //slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
