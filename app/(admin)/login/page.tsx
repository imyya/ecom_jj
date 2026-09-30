import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/features/auth/components/LoginForm";

const LoginPage = async () => {
  // Déjà connecté → pas besoin de revoir le formulaire
  const session = await getSession();
  if (session) redirect("/admin/product");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Jiiro Admin</h1>
        <p className="mb-6 text-sm text-neutral-500">Connectez-vous pour accéder au back-office.</p>
        <LoginForm />
      </div>
    </main>
  );
};

export default LoginPage;
