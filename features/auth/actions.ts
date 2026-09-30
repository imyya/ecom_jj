"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

const LoginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginState = { error?: string; email?: string } | undefined;

const INVALID_CREDENTIALS = "Email ou mot de passe incorrect";

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const typedEmail = String(formData.get("email") ?? "");

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, email: typedEmail };
  }

  const admin = await prisma.admin.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!admin || !admin.isActive) {
    return { error: INVALID_CREDENTIALS, email: typedEmail };
  }

  const passwordOk = await bcrypt.compare(parsed.data.password, admin.password);
  if (!passwordOk) {
    return { error: INVALID_CREDENTIALS, email: typedEmail };
  }

  await createSession({ adminId: admin.id, role: admin.role });

  redirect("/admin/product");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
