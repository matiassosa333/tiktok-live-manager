export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/ui/SectionCard";
import { supabase } from "@/lib/supabase/client";

type CustomerRelation =
  | {
      full_name: string;
      whatsapp: string | null;
    }
  | {
      full_name: string;
      whatsapp: string | null;
    }[]
  | null;

type ItemRow = {
  id: string;
  code: string;
  description: string | null;
  price: number;
  status: string;
  customer_id: string | null;
  customers: CustomerRelation;
};

function normalizeCustomer(customers: CustomerRelation) {
  if (!customers) return null;
  if (Array.isArray(customers)) return customers[0] || null;
  return customers;
}

export default async function LiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: live } = await supabase
    .from("lives")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { data: itemsData } = await supabase
    .from("items")
    .select(
      `
      id,
      code,
      description,
      price,
      status,
      customer_id,
      customers (
        full_name,
        whatsapp
      )
    `
    )
    .eq("live_id", id)
    .order("created_at", { ascending: false });

  const items = (itemsData as ItemRow[]) || [];
  const validItems = items.filter((item) => item.status !== "cancelled");
  const total = validItems.reduce((acc, item) => acc + item.price, 0);

  const groupedMap = new Map<
    string,
    { customerName: string; total: number; count: number }
  >();

  validItems.forEach((item) => {
    if (!item.customer_id) return;
    const customer = normalizeCustomer(item.customers);
    if (!customer) return;

    const existing = groupedMap.get(item.customer_id);

    if (!existing) {
      groupedMap.set(item.customer_id, {
        customerName: customer.full_name,
        total: item.price,
        count: 1,
      });
      return;
    }

    existing.total += item.price;
    existing.count += 1;
  });

  const customers = Array.from(groupedMap.values()).sort(
    (a, b) => b.total - a.total
  );

  return (
    <AppShell
      title="Detalle del live"
      description="Historial completo del live seleccionado."
    >
      {!live ? (
        <SectionCard title="No encontrado">
          <p className="text-sm text-slate-600">Ese live no existe.</p>
        </SectionCard>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard
            title={live.title}
            description="Resumen general del live."
          >
            <div className="space-y-3 text-sm text-slate-700">
              <p>• Estado: {live.status === "active" ? "Activo" : "Cerrado"}</p>
              <p>• Tipo: {live.bundle_type}</p>
              <p>• Prendas válidas: {validItems.length}</p>
              <p>• Total: Gs. {total.toLocaleString("es-PY")}</p>
            </div>
          </SectionCard>

          <SectionCard
            title="Resumen por clienta"
            description="Totales agrupados para este live."
          >
            {customers.length === 0 ? (
              <p className="text-sm text-slate-600">
                No hubo prendas registradas.
              </p>
            ) : (
              <div className="space-y-3">
                {customers.map((customer, index) => (
                  <div
                    key={`${customer.customerName}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {customer.customerName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {customer.count} prenda
                          {customer.count !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <p className="font-semibold text-slate-900">
                        Gs. {customer.total.toLocaleString("es-PY")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Prendas del live"
            description="Listado completo de prendas."
          >
            {items.length === 0 ? (
              <p className="text-sm text-slate-600">
                No hay prendas registradas.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const customer = normalizeCustomer(item.customers);

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.code}
                          </p>
                          <p className="text-sm text-slate-600">
                            {item.description || "Sin descripción"}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            Cliente: {customer?.full_name || "Sin asignar"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            Gs. {item.price.toLocaleString("es-PY")}
                          </p>
                          <p className="text-sm capitalize text-slate-600">
                            {item.status.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </AppShell>
  );
}