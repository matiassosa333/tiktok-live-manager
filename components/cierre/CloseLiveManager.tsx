"use client";

import { useEffect, useState } from "react";
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

type LiveRow = {
  id: string;
  title: string;
  bundle_type: string;
  status: string;
  created_at: string;
};

type CustomerSummary = {
  customerId: string;
  customerName: string;
  total: number;
  count: number;
  pending: number;
  paid: number;
};

function normalizeCustomer(customers: CustomerRelation) {
  if (!customers) return null;
  if (Array.isArray(customers)) return customers[0] || null;
  return customers;
}

export function CloseLiveManager() {
  const [live, setLive] = useState<LiveRow | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setMessage("");

    const { data: liveData, error: liveError } = await supabase
      .from("lives")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (liveError) {
      setMessage(liveError.message);
      setLoading(false);
      return;
    }

    setLive(liveData);

    if (!liveData?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data: itemData, error: itemError } = await supabase
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
      .eq("live_id", liveData.id)
      .order("created_at", { ascending: false });

    if (itemError) {
      setMessage(itemError.message);
      setLoading(false);
      return;
    }

    setItems((itemData as ItemRow[]) || []);
    setLoading(false);
  }

  async function closeActiveLive() {
    if (!live) {
      setMessage("No hay live activo.");
      return;
    }

    const confirmed = window.confirm(
      `¿Querés cerrar el live "${live.title}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("lives")
      .update({ status: "closed" })
      .eq("id", live.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Live cerrado correctamente.");
    await loadData();
  }

  async function copyGeneralSummary() {
    if (!live) return;

    const validItems = items.filter((item) => item.status !== "cancelled");
    const total = validItems.reduce((acc, item) => acc + item.price, 0);
    const pending = validItems.filter(
      (item) => item.status === "pending_payment"
    ).length;
    const paid = validItems.filter((item) => item.status === "paid").length;
    const inCart = validItems.filter((item) => item.status === "in_cart").length;

    const text = `Resumen del live: ${live.title}

Prendas válidas: ${validItems.length}
Pendientes: ${pending}
En carrito: ${inCart}
Pagadas: ${paid}
Total general: Gs. ${total.toLocaleString("es-PY")}`;

    try {
      await navigator.clipboard.writeText(text);
      setMessage("Resumen general copiado.");
    } catch {
      setMessage("No se pudo copiar el resumen.");
    }
  }

  const validItems = items.filter((item) => item.status !== "cancelled");
  const total = validItems.reduce((acc, item) => acc + item.price, 0);
  const pending = validItems.filter(
    (item) => item.status === "pending_payment"
  ).length;
  const inCart = validItems.filter((item) => item.status === "in_cart").length;
  const paid = validItems.filter((item) => item.status === "paid").length;

  const groupedMap = new Map<string, CustomerSummary>();

  validItems.forEach((item) => {
    if (!item.customer_id) return;
    const customer = normalizeCustomer(item.customers);
    if (!customer) return;

    const existing = groupedMap.get(item.customer_id);

    if (!existing) {
      groupedMap.set(item.customer_id, {
        customerId: item.customer_id,
        customerName: customer.full_name,
        total: item.price,
        count: 1,
        pending: item.status === "pending_payment" ? 1 : 0,
        paid: item.status === "paid" ? 1 : 0,
      });
      return;
    }

    existing.total += item.price;
    existing.count += 1;
    if (item.status === "pending_payment") existing.pending += 1;
    if (item.status === "paid") existing.paid += 1;
  });

  const customerSummary = Array.from(groupedMap.values()).sort(
    (a, b) => b.total - a.total
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard
        title="Resumen del live activo"
        description="Vista final antes de cerrar el live."
      >
        {message ? <p className="mb-4 text-sm text-slate-700">{message}</p> : null}

        {loading ? (
          <p className="text-sm text-slate-600">Cargando...</p>
        ) : !live ? (
          <p className="text-sm text-slate-600">No hay live activo.</p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="font-semibold text-slate-900">{live.title}</p>
              <p className="text-sm text-slate-600">Tipo: {live.bundle_type}</p>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <p>• Prendas válidas: {validItems.length}</p>
              <p>• Pendientes: {pending}</p>
              <p>• En carrito: {inCart}</p>
              <p>• Pagadas: {paid}</p>
              <p>• Total general: Gs. {total.toLocaleString("es-PY")}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyGeneralSummary}
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Copiar resumen
              </button>

              <button
                type="button"
                onClick={closeActiveLive}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:opacity-90"
              >
                Cerrar live
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Resumen por clienta"
        description="Totales agrupados por clienta del live activo."
      >
        {loading ? (
          <p className="text-sm text-slate-600">Cargando...</p>
        ) : customerSummary.length === 0 ? (
          <p className="text-sm text-slate-600">
            No hay prendas registradas todavía.
          </p>
        ) : (
          <div className="space-y-3">
            {customerSummary.map((customer) => (
              <div
                key={customer.customerId}
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

                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      Gs. {customer.total.toLocaleString("es-PY")}
                    </p>
                    <p className="text-sm text-slate-600">
                      Pendientes: {customer.pending} · Pagadas: {customer.paid}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}