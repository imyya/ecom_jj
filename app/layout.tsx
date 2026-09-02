import type { Metadata } from "next";
// import { Inter, Space_Grotesk} from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { Outfit } from "next/font/google";



// const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
// const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Jiiro — Chapeaux, bonnets et casquettes",
  description:
    "Plus de 13 000 chapeaux, bonnets et casquettes. Livraison rapide, prix à partir de 2 500 FCFA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header/>
        {children}
      </body>
    </html>
  );
}
