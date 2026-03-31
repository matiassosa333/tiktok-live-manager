"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { supabase } from "@/lib/supabase/client";

type DeliveryRow = {
  id: string;
  type: "pickup" | "bolt" | "uber_moto";
  status: "pending" | "scheduled" | "delivered";
  shipping_cost: number | null;
  notes: string | null;
  customers:
    | {
        full_name: string;
        whatsapp: string | null;
      }[]
    | null;
  lives:
    | {
        title: string;
      }[]
    | null;
};

type Customer = {
  id: string;
  full_name: string;
};

type Live = {
  id: string;
  title: string;
};

export function DeliveriesManager() {
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [lives, setLives] = useState<Live[]>([]);
  const [message, setMessage] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [liveId, setLiveId] = useState("");
  const [type, setType] = useState<"pickup" | "bolt" | "uber_moto">("pickup");
  const [status, setStatus] = useState<"pending" | "scheduled" | "delivered">(
    "pending"
  );
  const [shippingCost, setShippingCost] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: deliveriesData }, { data: customersData }, { data: livesData }] =
      await Promise.all([
        supabase
          .from("deliveries")
          .select(
            `
            id,
            type,
            status,
            shipping_cost,
            notes,
            customers (
              full_name,
              whatsapp
            ),
            lives (
              title
            )
          `
          )
          .order("created_at", { ascending: false }),
        supabase.from("customers").select("id, full_name").order("full_name"),
        supabase.from("lives").select("id, title").order("created_at", {
          ascending: false,
        }),
      ]);

    setDeliveries((deliveriesData as DeliveryRow[]) || []);
    setCustomers((customersData as Customer[]) || []);
    setLives((livesData as Live[]) || []);
  }

  async function createDelivery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!customerId || !liveId) {
      setMessage("Seleccioná clienta y live.");
      return;
    }

    const { error } = await supabase.from("deliveries").insert({
      customer_id: customerId,
      live_id: liveId,
      type,
      status,
      shipping_cost: shippingCost ? Number(shippingCost) : null,
      notes: notes || null,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setCustomerId("");
    setLiveId("");
    setType("pickup");
    setStatus("pending");
    setShippingCost("");
    setNotes("");
    setMessage("Entrega creada correctamente.");
    await loadData();
  }

  async function advanceStatus(deliveryId: string, currentStatus: string) {
    const nextStatus =
      currentStatus === "pending"
        ? "scheduled"
        : currentStatus === "scheduled"
          ? "delivered"
          : "delivered";

    const { error } = await supabase
      .from("deliveries")
      .update({ status: nextStatus })
      .eq("id", deliveryId);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadData();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <SectionCard
        title="Nueva entrega"
        description="Registrar retiro o envío."
      >
        {message ? <p className="mb-4 text-sm text-slate-700">{message}</p> : null}

        <form onSubmit={createDelivery} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Clienta
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="">Seleccionar</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Live
            </label>
            <select
              value={liveId}
              onChange={(e) => setLiveId(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="">Seleccionar</option>
              {lives.map((live) => (
                <option key={live.id} value={live.id}>
                  {live.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as "pickup" | "bolt" | "uber_moto")
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="pickup">Retiro</option>
              <option value="bolt">Bolt</option>
              <option value="uber_moto">Uber moto</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "pending" | "scheduled" | "delivered")
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="pending">Pendiente</option>
              <option value="scheduled">Coordinado</option>
              <option value="delivered">Entregado</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Costo de envío
            </label>
            <input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Ej: 15000"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Ej: entrega fin de semana"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 font-medium text-white hover:opacity-90"
          >
            Guardar entrega
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title="Historial de entregas"
        description="Listado de retiros y envíos."
      >
        {deliveries.length === 0 ? (
          <p className="text-sm text-slate-600">No hay entregas registradas.</p>
        ) : (
          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {delivery.customers?.[0]?.full_name || "Sin clienta"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Live: {delivery.lives?.[0]?.title || "Sin live"}
                    </p>
                    <p className="text-sm text-slate-700">
                      Tipo: {delivery.type}
                    </p>
                    <p className="text-sm text-slate-700">
                      Estado: {delivery.status}
                    </p>
                    {delivery.notes ? (
                      <p className="mt-1 text-sm text-slate-600">
                        Nota: {delivery.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-right font-semibold text-slate-900">
                      {delivery.shipping_cost
                        ? `Gs. ${delivery.shipping_cost.toLocaleString("es-PY")}`
                        : "Sin costo"}
                    </p>

                    {delivery.status !== "delivered" ? (
                      <button
                        type="button"
                        onClick={() => advanceStatus(delivery.id, delivery.status)}
                        className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Avanzar estado
                      </button>
                    ) : (
                      <span className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white">
                        Entregado
                      </span>
                    )}
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