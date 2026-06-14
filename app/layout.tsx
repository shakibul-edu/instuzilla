import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthenticationProvider } from "./context/AuthContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InstuZilla - Modern School Management Platform",
  description: "Streamline your school operations with InstuZilla. All-in-one platform for student enrollment, attendance, grades, and communication. Trusted by 500+ schools.",
  keywords: "school management, student management, attendance tracking, grade management, education software",
  authors: [{ name: "InstuZilla" }],
  openGraph: {
    title: "InstuZilla - Modern School Management Platform",
    description: "All-in-one platform for school management and student success",
    url: "https://instuzilla.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InstuZilla - Modern School Management Platform",
    description: "Streamline your school operations with our comprehensive management platform",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.className} bg-white dark:bg-slate-950 antialiased`}>
        <AuthenticationProvider>
          {children}
          <Toaster />
        </AuthenticationProvider>
      </body>
    </html>
  );
}
