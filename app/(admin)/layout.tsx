// app/(admin)/layout.tsx
import "../globals.css";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full bg-neutral-50">
        {children}
      </body>
    </html>
  );
}
