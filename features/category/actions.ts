"use server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { CreateCategorySchema } from "./schema";
import { slugify } from "@/lib/slugify";
import { revalidatePath } from "next/cache";

// const CreateCategorySchema = z.object({
//   name: z.string().min(1),
//   slug: z.string().min(1).regex(/^[a-z0-9-]+$/),   // ou tu le génères depuis name
//   description: z.string().optional(),
//   parentId: z.string().optional(),
// });

export async function createCategory(formData: FormData) {
  const form = Object.fromEntries(formData);
  const parsed = CreateCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten() };
  }

  try {
    const slug = slugify(parsed.data.name);
    const existingCategWithSlug = await prisma.category.findUnique({
      where: {
        slug: slug,
      },
    });
    if (existingCategWithSlug)
      throw new Error("Une categorie du meme slug existe deja");
    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: slug,
        parentId: parsed.data.parentId ?? null,
        description: parsed.data.description ?? null,
      },
    });
    revalidatePath("/admin/categories");
    return {
      ok:true,
      data:[category],
      message:"Category created successfully"

    }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "error occured",
    };
  }

}
