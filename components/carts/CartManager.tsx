"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { supabase } from "@/lib/supabase/client";
import { generateUniqueNumericCode } from "@/lib/utils/generateCode";

type CustomerRelation =
  | {
      full_name: string;
      whatsapp: string | null;
      cart_enabled: boolean;
      is_recurring: boolean;
    }
  | {
      full_name: string;
      whatsapp: string | null;
      cart_enabled: boolean;
      is_recurring: boolean;
    }[]
  | null;

type LiveRelation =
  | {
      title: string;
    }
  | {
      title: string;
    }[]
  | null;

type ItemRow = {
  id: string;
  code: string;
  description: string | null;
  price: number;
  status: string;
  customer_id: string | null;
  live_id: string;
  customers: CustomerRelation;
  lives: LiveRelation;
};

type PaymentRow = {
  customer_id: string;
  live_id: string;
  amount: number;
  status: string;
};

type GroupedCart = {
  key: string;
  customerId: string;
  liveId: string;
  liveTitle: string;
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
  totalPaid: number;
  balance: number;
};

function normalizeRelation<T>(relation: T | T[] | null): T | null {
  if (!relation) return null;
  if (Array.isArray(relation)) return relation[0] || null;
  return relation;
}

export function CartManager() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const [addingCartKey, setAddingCartKey] = useState<string | null>(null);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCode, setNewItemCode] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setMessage("");

    const [
      { data: itemData, error: itemError },
      { data: paymentData, error: paymentError },
    ] = await Promise.all([
      supabase
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
          ),
          lives (
            title
          )
        `
        )
        .in("status", ["pending_payment", "in_cart", "paid"])
        .not("customer_id", "is", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("customer_id, live_id, amount, status")
        .eq("status", "confirmed"),
    ]);

    if (itemError) {
      setMessage(itemError.message);
      setLoading(false);
      return;
    }

    if (paymentError) {
      setMessage(paymentError.message);
      setLoading(false);
      return;
    }

    setItems((itemData as ItemRow[]) || []);
    setPayments((paymentData as PaymentRow[]) || []);
    setLoading(false);
  }

  const carts = useMemo(() => {
    const groupedMap = new Map<string, GroupedCart>();

    items.forEach((item) => {
      if (!item.customer_id) return;

      const customer = normalizeRelation(item.customers);
      const live = normalizeRelation(item.lives);

      if (!customer) return;

      const key = `${item.customer_id}-${item.live_id}`;
      const existing = groupedMap.get(key);

      if (!existing) {
        groupedMap.set(key, {
          key,
          customerId: item.customer_id,
          liveId: item.live_id,
          liveTitle: live?.title || "Sin live",
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
          totalPaid: 0,
          balance: 0,
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

    const paymentMap = new Map<string, number>();

    payments.forEach((payment) => {
      const key = `${payment.customer_id}-${payment.live_id}`;
      const current = paymentMap.get(key) || 0;
      paymentMap.set(key, current + payment.amount);
    });

    const groupedCarts = Array.from(groupedMap.values()).map((cart) => {
      const totalPaid = paymentMap.get(cart.key) || 0;
      const balance = Math.max(cart.total - totalPaid, 0);

      return {
        ...cart,
        totalPaid,
        balance,
      };
    });

    return groupedCarts.sort((a, b) => b.balance - a.balance);
  }, [items, payments]);

  function startEdit(item: GroupedCart["items"][number]) {
    setEditingItemId(item.id);
    setEditDescription(item.description || "");
    setEditPrice(String(item.price));
    setEditStatus(item.status);
  }

  function cancelEdit() {
    setEditingItemId(null);
    setEditDescription("");
    setEditPrice("");
    setEditStatus("");
  }

  async function saveEdit(itemId: string) {
    if (!editPrice || Number(editPrice) <= 0) {
      setMessage("Ingresá un precio válido.");
      return;
    }

    const { error } = await supabase
      .from("items")
      .update({
        description: editDescription || null,
        price: Number(editPrice),
        status: editStatus,
        reserved_until:
          editStatus === "pending_payment"
            ? new Date(Date.now() + 10 * 60 * 1000).toISOString()
            : null,
      })
      .eq("id", itemId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Prenda actualizada correctamente.");
    cancelEdit();
    await loadData();
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

    await supabase
      .from("customers")
      .update({
        cart_enabled: true,
        is_recurring: true,
      })
      .eq("id", cart.customerId);

    await supabase
      .from("items")
      .update({
        status: "in_cart",
        reserved_until: null,
      })
      .eq("live_id", cart.liveId)
      .eq("customer_id", cart.customerId)
      .eq("status", "pending_payment");

    setMessage("Pago inicial registrado y carrito habilitado.");
    await loadData();
  }

  async function registerFinalPayment(cart: GroupedCart) {
    if (cart.balance <= 0) {
      setMessage("No hay saldo pendiente para cobrar.");
      return;
    }

    const { error: paymentError } = await supabase.from("payments").insert({
      customer_id: cart.customerId,
      live_id: cart.liveId,
      payment_type: "final",
      amount: cart.balance,
      status: "confirmed",
    });

    if (paymentError) {
      setMessage(paymentError.message);
      return;
    }

    const unpaidItemIds = cart.items
      .filter((item) => item.status !== "cancelled")
      .map((item) => item.id);

    if (unpaidItemIds.length > 0) {
      const { error: itemError } = await supabase
        .from("items")
        .update({
          status: "paid",
        })
        .in("id", unpaidItemIds);

      if (itemError) {
        setMessage(itemError.message);
        return;
      }
    }

    setMessage("Pago final registrado correctamente.");
    await loadData();
  }

  function buildWhatsAppMessage(cart: GroupedCart) {
    const lines = cart.items.map((item) => {
      return `- ${item.code} | ${item.description || "Sin descripción"} | Gs. ${item.price.toLocaleString("es-PY")}`;
    });

    return `Hola ${cart.customerName}, este es el resumen de tu carrito:

${lines.join("\n")}

Total carrito: Gs. ${cart.total.toLocaleString("es-PY")}
Ya pagado: Gs. ${cart.totalPaid.toLocaleString("es-PY")}
Saldo pendiente: Gs. ${cart.balance.toLocaleString("es-PY")}

Recordá que el pago debe completarse dentro de la semana.
El envío se cobra aparte.`;
  }

  async function copyWhatsAppMessage(cart: GroupedCart) {
    try {
      const text = buildWhatsAppMessage(cart);
      await navigator.clipboard.writeText(text);
      setMessage("Mensaje copiado al portapapeles.");
    } catch {
      setMessage("No se pudo copiar el mensaje.");
    }
  }

  function openWhatsApp(cart: GroupedCart) {
    const text = buildWhatsAppMessage(cart);
    const encodedMessage = encodeURIComponent(text);

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

  function startAddItem(cart: GroupedCart) {
    const existingCodesForLive = items
      .filter((item) => item.live_id === cart.liveId)
      .map((item) => item.code);

    setAddingCartKey(cart.key);
    setNewItemDescription("");
    setNewItemPrice("");
    setNewItemCode(generateUniqueNumericCode(existingCodesForLive));
  }

  function cancelAddItem() {
    setAddingCartKey(null);
    setNewItemDescription("");
    setNewItemPrice("");
    setNewItemCode("");
  }

  async function saveNewItem(cart: GroupedCart) {
    if (!newItemPrice || Number(newItemPrice) <= 0) {
      setMessage("Ingresá un precio válido para la nueva prenda.");
      return;
    }

    const { error } = await supabase.from("items").insert({
      live_id: cart.liveId,
      customer_id: cart.customerId,
      code: newItemCode,
      description: newItemDescription || null,
      price: Number(newItemPrice),
      status: "in_cart",
      reserved_until: null,
      requires_first_payment: false,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Prenda agregada correctamente al carrito.");
    cancelAddItem();
    await loadData();
  }

  return (
    <SectionCard
      title="Carritos activos"
      description="Agrupados por clienta y live, con saldo pendiente real."
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

            const allPaid = cart.balance <= 0;

            return (
              <div
                key={cart.key}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {cart.customerName}
                    </p>
                    <p className="text-sm text-slate-600">
                      Live: {cart.liveTitle}
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

                  <div className="text-left text-sm md:text-right">
                    <p className="text-slate-500">
                      {cart.items.length} prenda
                      {cart.items.length !== 1 ? "s" : ""}
                    </p>
                    <p className="font-semibold text-slate-900">
                      Total: Gs. {cart.total.toLocaleString("es-PY")}
                    </p>
                    <p className="text-slate-700">
                      Pagado: Gs. {cart.totalPaid.toLocaleString("es-PY")}
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      Saldo: Gs. {cart.balance.toLocaleString("es-PY")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white p-4">
                      {editingItemId === item.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Descripción
                            </label>
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Precio
                            </label>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Estado
                            </label>
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                            >
                              <option value="pending_payment">Pendiente pago</option>
                              <option value="in_cart">En carrito</option>
                              <option value="paid">Pagada</option>
                              <option value="cancelled">Cancelada</option>
                            </select>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(item.id)}
                              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:opacity-90"
                            >
                              Guardar cambios
                            </button>

                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Cancelar edición
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
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
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="mt-2 rounded-2xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {addingCartKey === cart.key ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                      <div className="space-y-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Código automático
                          </label>
                          <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900">
                            {newItemCode}
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Descripción
                          </label>
                          <input
                            type="text"
                            value={newItemDescription}
                            onChange={(e) => setNewItemDescription(e.target.value)}
                            placeholder="Ej: blusa extra"
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Precio
                          </label>

                          <input
                            type="number"
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(e.target.value)}
                            placeholder="Ej: 25000"
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveNewItem(cart)}
                            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:opacity-90"
                          >
                            Guardar prenda
                          </button>

                          <button
                            type="button"
                            onClick={cancelAddItem}
                            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
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
                      Sin saldo pendiente
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => startAddItem(cart)}
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Agregar prenda
                  </button>

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