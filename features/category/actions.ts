'use server'
import {z} from "zod"

const CreateCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),   // ou tu le génères depuis name
  description: z.string().optional(),
  parentId: z.string().optional(),
});

//export async function (formData: FormData){
 // a. transformer formData en objet
  // b. CreateCategorySchema.safeParse(...) → si échec, return { ok: false, errors }
  // c. TODO auth : vérifier que l'appelant est admin (JWT) — pas encore construit, note-le
  // d. prisma.category.create({ data: ... })
  // e. revalidatePath("/admin/categories")  (+ pages publiques si besoin)
  // f. return { ok: true }
//}