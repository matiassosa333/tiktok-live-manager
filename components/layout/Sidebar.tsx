"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lives", label: "Lives" },
  { href: "/live", label: "Live" },
  { href: "/clientes", label: "Clientes" },
  { href: "/carritos", label: "Carritos" },
  { href: "/cierre", label: "Cierre" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col rounded-3xl bg-slate-900 p-4 text-white">
      <div className="mb-6 px-2">
        <h2 className="text-xl font-bold">TikTok Manager</h2>
        <p className="text-sm text-slate-300">Panel operativo</p>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-white text-slate-900"
                  : "text-slate-200 hover:bg-slate-800"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}