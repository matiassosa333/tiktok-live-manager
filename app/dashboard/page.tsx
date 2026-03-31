export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { supabase } from "@/lib/supabase/client";

export default async function DashboardPage() {
  const [{ data: customers }, { data: activeLives }, { data: items }, { data: paidItems }] =
    await Promise.all([
      supabase.from("customers").select("*"),
      supabase.from("lives").select("*").eq("status", "active"),
      supabase
        .from("items")
        .select("price,status")
        .in("status", ["pending_payment", "in_cart", "paid"]),
      supabase.from("items").select("price").eq("status", "paid"),
    ]);

  const pendingCount =
    items?.filter((item) => item.status === "pending_payment").length || 0;

  const totalPaid =
    paidItems?.reduce((acc, item) => acc + (item.price || 0), 0) || 0;

  return (
    <AppShell
      title="Dashboard"
      description="Resumen rápido del live y estado general del negocio."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lives activos"
          value={String(activeLives?.length || 0)}
          helper="Transmisiones activas"
        />
        <StatCard
          label="Clientes"
          value={String(customers?.length || 0)}
          helper="Registradas en sistema"
        />
        <StatCard
          label="Pendientes de pago"
          value={String(pendingCount)}
          helper="Pago inicial aún no confirmado"
        />
        <StatCard
          label="Total pagado"
          value={`Gs. ${totalPaid.toLocaleString("es-PY")}`}
          helper="Prendas marcadas como pagadas"
        />
      </div>
    </AppShell>
  );
}
