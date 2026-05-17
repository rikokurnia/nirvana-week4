"use client";

import { useAuth } from "@/app/providers/privy-provider";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 ml-64 min-h-screen">{children}</main>
      </div>
    </div>
  );
}

function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", icon: "📊", path: "/dashboard" },
    { label: "Create Stream", icon: "➕", path: "/dashboard/create" },
  ];

  return (
    <aside className="fixed top-20 left-0 w-64 h-[calc(100vh-5rem)] glass-plate border-r border-white/5 p-6 flex flex-col">
      <div className="mb-8">
        <h2 className="font-headline text-lg font-bold text-mint tracking-tight">Dashboard</h2>
        <p className="font-mono text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest">
          Devnet
        </p>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm font-mono text-xs font-bold tracking-widest uppercase transition-all ${
                isActive
                  ? "bg-mint/10 text-mint border border-mint/20"
                  : "text-on-surface-variant hover:text-mint hover:bg-white/3"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <a
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-sm font-mono text-xs font-bold tracking-widest uppercase text-on-surface-variant hover:text-mint hover:bg-white/3 transition-all"
        >
          <span>🏠</span>
          Landing Page
        </a>
      </div>
    </aside>
  );
}
