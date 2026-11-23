import type { Metadata, Viewport } from "next";
import Brand from "@/components/Brand";
import ThemeToggle, { themeInitScript } from "@/components/ThemeToggle";
import SideNav from "@/app/_components/SideNav";
import MobileHeader from "@/app/_components/MobileHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Raff", template: "%s · Raff" },
  description: "Past papers, notes, and assignments — organized by course.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen overflow-x-hidden">
        {/* Soft colour wash behind the glass panels */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(255,192,203,0.25),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(147,197,253,0.22),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(216,180,254,0.18),transparent_55%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(147,197,253,0.10),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(244,114,182,0.08),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(167,139,250,0.08),transparent_55%)]"
        />

        <div className="flex min-h-screen">
          {/* Desktop sidebar */}
          <aside className="glass sticky top-3 m-3 hidden h-[calc(100vh-1.5rem)] w-64 shrink-0 flex-col rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:flex">
            <div className="flex items-center justify-between p-5">
              <Brand />
              <ThemeToggle />
            </div>
            <SideNav />
          </aside>

          <div className="min-w-0 flex-1">
            <MobileHeader />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
