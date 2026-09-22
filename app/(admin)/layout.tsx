// app/(admin)/layout.tsx
import "../globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-neutral-50">
        {children}
      </body>
    </html>
  );
}
