export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/ui/SectionCard";
import { supabase } from "@/lib/supabase/client";

export default async function ClientesPage() {
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AppShell
      title="Clientes"
      description="Administración de clientas nuevas y recurrentes."
    >
      <SectionCard
        title="Lista de clientas"
        description="Ya conectada a Supabase."
      >
        {error ? (
          <p className="text-sm text-red-600">{error.message}</p>
        ) : null}

        <div className="space-y-3">
          {customers?.map((customer) => (
            <div
              key={customer.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="font-semibold text-slate-900">
                {customer.full_name}
              </p>

              <p className="text-sm text-slate-600">
                TikTok: {customer.tiktok_username || "Sin usuario"}
              </p>

              <p className="text-sm text-slate-600">
                WhatsApp: {customer.whatsapp || "Sin número"}
              </p>

              <p className="mt-2 text-sm text-slate-700">
                {customer.is_recurring ? "Recurrente" : "Nueva"} ·{" "}
                {customer.cart_enabled
                  ? "Carrito habilitado"
                  : "Carrito no habilitado"}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}