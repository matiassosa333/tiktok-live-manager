"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { supabase } from "@/lib/supabase/client";

type ItemRow = {
  id: string;
  code: string;
  description: string | null;
  price: number;
  status: string;
  customer_id: string | null;
  live_id: string;
  customers: {
    full_name: string;
    whatsapp: string | null;
    cart_enabled: boolean;
    is_recurring: boolean;
  }[] | null;
};

type GroupedCart = {
  customerId: string;
  liveId: string;
  customerName: string;
  whatsapp: string | null;
  cartEnabled: boolean;
  isRecurring: boolean;
  items: {
    id: string;
    code: string;
    description: string | null;
    price: number;
    status: string;
  }[];
  total: number;
};

export function CartManager() {
  const [carts, setCarts] = useState<GroupedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCarts();
  }, []);

  async function loadCarts() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("items")
      .select(
        `
        id,
        code,
        description,
        price,
        status,
        customer_id,
        live_id,
        customers (
          full_name,
          whatsapp,
          cart_enabled,
          is_recurring
        )
      `
      )
      .in("status", ["pending_payment", "in_cart", "paid"])
      .not("customer_id", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const groupedMap = new Map<string, GroupedCart>();

    (data as ItemRow[] | null)?.forEach((item) => {
      if (!item.customer_id || !item.customers?.[0]) return;

      const customer = item.customers[0];
      const existing = groupedMap.get(item.customer_id);

      if (!existing) {
        groupedMap.set(item.customer_id, {
          customerId: item.customer_id,
          liveId: item.live_id,
          customerName: customer.full_name,
          whatsapp: customer.whatsapp,
          cartEnabled: customer.cart_enabled,
          isRecurring: customer.is_recurring,
          items: [
            {
              id: item.id,
              code: item.code,
              description: item.description,
              price: item.price,
              status: item.status,
            },
          ],
          total: item.price,
        });
        return;
      }

      existing.items.push({
        id: item.id,
        code: item.code,
        description: item.description,
        price: item.price,
        status: item.status,
      });
      existing.total += item.price;
    });

    const groupedCarts = Array.from(groupedMap.values()).sort(
      (a, b) => b.total - a.total
    );

    setCarts(groupedCarts);
    setLoading(false);
  }

  async function registerInitialPayment(cart: GroupedCart) {
    setMessage("");

    const firstPendingItem = cart.items.find(
      (item) => item.status === "pending_payment"
    );

    if (!firstPendingItem) {
      setMessage("No hay prenda pendiente para registrar pago inicial.");
      return;
    }

    const { error: paymentError } = await supabase.from("payments").insert({
      customer_id: cart.customerId,
      live_id: cart.liveId,
      payment_type: "initial",
      amount: firstPendingItem.price,
      status: "confirmed",
    });

    if (paymentError) {
      setMessage(paymentError.message);
      return;
    }

    const { error: customerError } = await supabase
      .from("customers")
      .update({
        cart_enabled: true,
        is_recurring: true,
      })
      .eq("id", cart.customerId);

    if (customerError) {
      setMessage(customerError.message);
      return;
    }

    const { error: itemError } = await supabase
      .from("items")
      .update({
        status: "in_cart",
        reserved_until: null,
      })
      .eq("id", firstPendingItem.id);

    if (itemError) {
      setMessage(itemError.message);
      return;
    }

    setMessage("Pago inicial registrado y carrito habilitado.");
    await loadCarts();
  }

  async function registerFinalPayment(cart: GroupedCart) {
    const total = cart.items.reduce((acc, item) => acc + item.price, 0);

    const { error: paymentError } = await supabase.from("payments").insert({
      customer_id: cart.customerId,
      live_id: cart.liveId,
      payment_type: "final",
      amount: total,
      status: "confirmed",
    });

    if (paymentError) {
      setMessage(paymentError.message);
      return;
    }

    const itemIds = cart.items.map((item) => item.id);

    const { error: itemError } = await supabase
      .from("items")
      .update({
        status: "paid",
      })
      .in("id", itemIds);

    if (itemError) {
      setMessage(itemError.message);
      return;
    }

    setMessage("Pago final registrado correctamente.");
    await loadCarts();
  }

  function buildWhatsAppMessage(cart: GroupedCart) {
    const lines = cart.items.map((item) => {
      return `- ${item.code} | ${item.description || "Sin descripción"} | Gs. ${item.price.toLocaleString("es-PY")}`;
    });

    return `Hola ${cart.customerName}, este es el resumen de tu carrito:

${lines.join("\n")}

Total: Gs. ${cart.total.toLocaleString("es-PY")}

Recordá que el pago debe completarse dentro de la semana.
El envío se cobra aparte.`;
  }

  async function copyWhatsAppMessage(cart: GroupedCart) {
    try {
      const message = buildWhatsAppMessage(cart);
      await navigator.clipboard.writeText(message);
      setMessage("Mensaje copiado al portapapeles.");
    } catch {
      setMessage("No se pudo copiar el mensaje.");
    }
  }

  function openWhatsApp(cart: GroupedCart) {
    const message = buildWhatsAppMessage(cart);
    const encodedMessage = encodeURIComponent(message);

    let cleanPhone = (cart.whatsapp || "").replace(/\D/g, "");

    if (cleanPhone.startsWith("0")) {
      cleanPhone = `595${cleanPhone.slice(1)}`;
    }

    if (!cleanPhone) {
      setMessage("Esta clienta no tiene número de WhatsApp.");
      return;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
  }

  return (
    <SectionCard
      title="Carritos activos"
      description="Agrupados automáticamente por clienta."
    >
      {message ? <p className="mb-4 text-sm text-slate-700">{message}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-600">Cargando carritos...</p>
      ) : carts.length === 0 ? (
        <p className="text-sm text-slate-600">
          No hay carritos activos todavía.
        </p>
      ) : (
        <div className="space-y-4">
          {carts.map((cart) => {
            const hasPendingPayment = cart.items.some(
              (item) => item.status === "pending_payment"
            );

            const allPaid = cart.items.every((item) => item.status === "paid");

            return (
              <div
                key={cart.customerId}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {cart.customerName}
                    </p>
                    <p className="text-sm text-slate-600">
                      WhatsApp: {cart.whatsapp || "Sin número"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {cart.isRecurring ? "Recurrente" : "Nueva"} ·{" "}
                      {cart.cartEnabled
                        ? "Carrito habilitado"
                        : "Pendiente de habilitación"}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm text-slate-500">
                      {cart.items.length} prenda
                      {cart.items.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      Gs. {cart.total.toLocaleString("es-PY")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.code}
                        </p>
                        <p className="text-sm text-slate-600">
                          {item.description || "Sin descripción"}
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
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {hasPendingPayment ? (
                    <button
                      type="button"
                      onClick={() => registerInitialPayment(cart)}
                      className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-medium text-white hover:opacity-90"
                    >
                      Confirmar pago inicial
                    </button>
                  ) : null}

                  {!hasPendingPayment && !allPaid ? (
                    <button
                      type="button"
                      onClick={() => registerFinalPayment(cart)}
                      className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:opacity-90"
                    >
                      Confirmar pago final
                    </button>
                  ) : null}

                  {allPaid ? (
                    <span className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
                      Pedido pagado
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => copyWhatsAppMessage(cart)}
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Copiar resumen
                  </button>

                  <button
                    type="button"
                    onClick={() => openWhatsApp(cart)}
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Abrir WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
