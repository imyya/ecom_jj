import { z } from "zod";


export const CategorySchema = z.object({
  name: z.string().trim().min(1, "Le nom est obligatoire").max(80, "80 caractères maximum"),
  description: z.string().trim().max(500, "500 caractères maximum").optional(),
  parentId: z.string().min(1).optional(),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

export type CategoryFormState =
  | {
      message?: string;
      fieldErrors?: Partial<Record<keyof CategoryInput, string[]>>;
    }
  | undefined;
