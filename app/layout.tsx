import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import { Providers } from "./providers";
import "./globals.css";
import { setupPersistentTask } from "@/lib/features/task-manager/persistent";
import { createClient } from "@/utils/supabase/server";
import { queue } from "@/lib/features/task-manager/queue";
import logger from "@/lib/monitoring/logger";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
