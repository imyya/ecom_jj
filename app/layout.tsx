import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";



export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
     // className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header/>
        {children}
      </body>
    </html>
  );
}
