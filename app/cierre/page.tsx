export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { supabase } from "@/lib/supabase/client";

type ItemRow = {
  price: number;
  status: string;
};

export default async function DashboardPage() {
  const { data: activeLive } = await supabase
    .from("lives")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let items: ItemRow[] = [];

  if (activeLive?.id) {
    const { data } = await supabase
      .from("items")
      .select("price, status")
      .eq("live_id", activeLive.id);

    items = (data as ItemRow[]) || [];
  }

  const { data: customers } = await supabase.from("customers").select("id");
  const { data: lives } = await supabase.from("lives").select("id, status");

  const pendingCount = items.filter(
    (item) => item.status === "pending_payment"
  ).length;

  const inCartCount = items.filter((item) => item.status === "in_cart").length;
  const paidCount = items.filter((item) => item.status === "paid").length;
  const cancelledCount = items.filter(
    (item) => item.status === "cancelled"
  ).length;

  const liveTotal = items
    .filter((item) => item.status !== "cancelled")
    .reduce((acc, item) => acc + item.price, 0);

  const totalLives = lives?.length || 0;
  const closedLives = lives?.filter((live) => live.status === "closed").length || 0;

  return (
    <AppShell
      title="Dashboard"
      description="Resumen real del live actual y del estado general del sistema."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Live activo"
          value={activeLive ? "1" : "0"}
          helper={activeLive?.title || "Sin live activo"}
        />
        <StatCard
          label="Total live actual"
          value={`Gs. ${liveTotal.toLocaleString("es-PY")}`}
          helper="Sin contar canceladas"
        />
        <StatCard
          label="Pendientes"
          value={String(pendingCount)}
          helper="Pago inicial pendiente"
        />
        <StatCard
          label="Pagadas"
          value={String(paidCount)}
          helper="Prendas totalmente cobradas"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Estado del live actual"
          description="Distribución de prendas del live activo."
        >
          <div className="space-y-3 text-sm text-slate-700">
            <p>• En carrito: {inCartCount}</p>
            <p>• Pendientes de pago: {pendingCount}</p>
            <p>• Pagadas: {paidCount}</p>
            <p>• Canceladas: {cancelledCount}</p>
          </div>
        </SectionCard>

        <SectionCard
          title="Resumen general"
          description="Actividad acumulada del sistema."
        >
          <div className="space-y-3 text-sm text-slate-700">
            <p>• Clientas registradas: {customers?.length || 0}</p>
            <p>• Lives totales: {totalLives}</p>
            <p>• Lives cerrados: {closedLives}</p>
            <p>• Live actual: {activeLive?.title || "Ninguno"}</p>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}