import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { supabase } from "@/lib/supabase/client";

export default async function DashboardPage() {
  const { data: customers } = await supabase.from("customers").select("*");
  const { data: lives } = await supabase
    .from("lives")
    .select("*")
    .eq("status", "active");

  return (
    <AppShell
      title="Dashboard"
      description="Resumen rápido del live y estado general del negocio."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Live activo"
          value={String(lives?.length || 0)}
          helper="Transmisiones activas"
        />
        <StatCard
          label="Clientes"
          value={String(customers?.length || 0)}
          helper="Registradas en sistema"
        />
        <StatCard
          label="Pendientes de pago"
          value="0"
          helper="Todavía fijo"
        />
        <StatCard
          label="Total estimado"
          value="Gs. 0"
          helper="Todavía fijo"
        />
      </div>
    </AppShell>
  );
}