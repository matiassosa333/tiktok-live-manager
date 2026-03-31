"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AccessGuardProps = {
  children: React.ReactNode;
};

export function AccessGuard({ children }: AccessGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/acceso") {
      setAllowed(true);
      setChecking(false);
      return;
    }

    const saved = sessionStorage.getItem("app_access");

    if (saved === "ok") {
      setAllowed(true);
      setChecking(false);
      return;
    }

    router.replace(`/acceso?next=${encodeURIComponent(pathname)}`);
  }, [pathname, router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Verificando acceso...</p>
        </div>
      </main>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}