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
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, payment_type, status");

  const { data: lives } = await supabase.from("lives").select("id, status");

  const pendingCount = items.filter(
    (item) => item.status === "pending_payment"
  ).length;
  const inCartCount = items.filter((item) => item.status === "in_cart").length;
  const paidItemsCount = items.filter((item) => item.status === "paid").length;
  const cancelledCount = items.filter(
    (item) => item.status === "cancelled"
  ).length;

  const liveTotal = items
    .filter((item) => item.status !== "cancelled")
    .reduce((acc, item) => acc + item.price, 0);

  const confirmedPayments = (payments || []).filter(
    (payment) => payment.status === "confirmed"
  );

  const totalPaid = confirmedPayments.reduce(
    (acc, payment) => acc + payment.amount,
    0
  );

  const initialPayments = confirmedPayments.filter(
    (payment) => payment.payment_type === "initial"
  ).length;

  const finalPayments = confirmedPayments.filter(
    (payment) => payment.payment_type === "final"
  ).length;

  const recentLives = (lives || []).slice(0, 5);
  const totalLives = lives?.length || 0;
  const closedLives = lives?.filter((live) => live.status === "closed").length || 0;

  return (
    <AppShell
      title="Dashboard"
      description="Centro general del sistema y resumen rápido del estado operativo."
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
          helper="Prendas válidas del live activo"
        />
        <StatCard
          label="Pendientes"
          value={String(pendingCount)}
          helper="Pago inicial pendiente"
        />
        <StatCard
          label="Cobrado total"
          value={`Gs. ${totalPaid.toLocaleString("es-PY")}`}
          helper="Pagos confirmados acumulados"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Estado del live actual"
          description="Cómo está distribuido el live abierto ahora mismo."
        >
          <div className="space-y-3 text-sm text-slate-700">
            <p>• En carrito: {inCartCount}</p>
            <p>• Pendientes: {pendingCount}</p>
            <p>• Pagadas: {paidItemsCount}</p>
            <p>• Canceladas: {cancelledCount}</p>
          </div>
        </SectionCard>

        <SectionCard
          title="Pagos"
          description="Movimiento acumulado de pagos confirmados."
        >
          <div className="space-y-3 text-sm text-slate-700">
            <p>• Pagos iniciales: {initialPayments}</p>
            <p>• Pagos finales: {finalPayments}</p>
            <p>• Total cobrado: Gs. {totalPaid.toLocaleString("es-PY")}</p>
          </div>
        </SectionCard>

        <SectionCard
          title="Resumen general"
          description="Vista rápida del sistema completo."
        >
          <div className="space-y-3 text-sm text-slate-700">
            <p>• Clientas registradas: {customers?.length || 0}</p>
            <p>• Lives totales: {totalLives}</p>
            <p>• Lives cerrados: {closedLives}</p>
            <p>• Últimos lives visibles: {recentLives.length}</p>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}