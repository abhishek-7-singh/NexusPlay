import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "NexusPlay — Premium Gaming Client",
  description: "Play together. No downloads. Just share a room. Premium multiplayer browser games.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth scrollbar-hide">
      <body className="antialiased min-h-screen flex selection:bg-accent-blue/30 selection:text-white">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex flex-col relative z-10 w-full overflow-x-hidden pt-[72px]">
            {children}
          </main>
        </div>

      </body>
    </html>
  );
}
