"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { CategorySchema, type CategoryFormState } from "./schema";

function readCategoryForm(formData: FormData) {
  return CategorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    parentId: formData.get("parentId") || undefined,
  });
}

async function isValidParent(parentId: string) {
  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { parentId: true },
  });
  return parent !== null && parent.parentId === null;
}

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin(["SUPER_ADMIN", "GESTIONNAIRE"]);

  const parsed = readCategoryForm(formData);
  if (!parsed.success) {
    return { message: "Certains champs sont invalides", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { name, description, parentId } = parsed.data;

  const slug = slugify(name);
  if (await prisma.category.findUnique({ where: { slug } })) {
    return { fieldErrors: { name: ["Une catégorie avec ce nom existe déjà"] } };
  }
  if (parentId && !(await isValidParent(parentId))) {//si le parent de la new categ a deja un parent il peut pas etre parent de la new categ
    return { fieldErrors: { parentId: ["Catégorie parente invalide"] } };
  }

  try {
    await prisma.category.create({
      data: { name, slug, description: description ?? null, parentId: parentId ?? null },
    });
  } catch (err) {
    console.error("[createCategory]", err);
    return { message: "Une erreur est survenue, réessaie" };
  }

  revalidatePath("/admin/category");
  revalidatePath("/");
  redirect("/admin/category");
}

export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin(["SUPER_ADMIN", "GESTIONNAIRE"]);

  const parsed = readCategoryForm(formData);
  if (!parsed.success) {
    return { message: "Certains champs sont invalides", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { name, description, parentId } = parsed.data;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { children: true } } },
  });
  if (!category) return { message: "Catégorie introuvable" };

  if (parentId) {
    if (parentId === id) {
      return { fieldErrors: { parentId: ["Une catégorie ne peut pas être son propre parent"] } };
    }
    if (category._count.children > 0) {//si elle a deja des enfants elle peut pas etre enfant a parentId
      return { fieldErrors: { parentId: ["Cette catégorie a des sous-catégories, elle doit rester principale"] } };
    }
    if (!(await isValidParent(parentId))) {//si son parent a deja un parent ca passe pas
      return { fieldErrors: { parentId: ["Catégorie parente invalide"] } };
    }
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { name, description: description ?? null, parentId: parentId ?? null },
    });
  } catch (err) {
    console.error("[updateCategory]", err);
    return { message: "Une erreur est survenue, réessaie" };
  }

  revalidatePath("/admin/category");
  revalidatePath("/");
  redirect("/admin/category");
}
