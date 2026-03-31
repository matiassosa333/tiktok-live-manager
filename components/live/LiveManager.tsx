"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { supabase } from "@/lib/supabase/client";
import { generateRandomCode } from "@/lib/utils/generateCode";

type Customer = {
  id: string;
  full_name: string;
  tiktok_username: string | null;
  whatsapp: string | null;
  is_recurring: boolean;
  cart_enabled: boolean;
};

type Live = {
  id: string;
  title: string;
  bundle_type: "economico" | "premium";
  status: "active" | "closed";
};

type Item = {
  id: string;
  code: string;
  description: string | null;
  price: number;
  status: string;
  created_at: string;
  customer_id: string | null;
  customers:
    | {
        full_name: string;
      }[]
    | null;
};

const quickPrices = [20000, 25000, 30000, 35000, 40000, 50000];

export function LiveManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeLive, setActiveLive] = useState<Live | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState<"pending_payment" | "in_cart">(
    "pending_payment"
  );
  const [generatedCode, setGeneratedCode] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCustomerId, setEditCustomerId] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setGeneratedCode(generateRandomCode());
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  const selectedCustomer = useMemo(() => {
    return customers.find((customer) => customer.id === customerId) || null;
  }, [customers, customerId]);

  useEffect(() => {
    if (!selectedCustomer) return;

    if (selectedCustomer.cart_enabled) {
      setStatus("in_cart");
    } else {
      setStatus("pending_payment");
    }
  }, [selectedCustomer]);

  async function loadInitialData() {
    setPageLoading(true);
    setMessage("");

    const { data: liveData, error: liveError } = await supabase
      .from("lives")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (liveError) {
      setMessage("Error al cargar el live activo");
      setPageLoading(false);
      return;
    }

    setActiveLive(liveData);

    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .order("full_name", { ascending: true });

    if (customerError) {
      setMessage("Error al cargar clientas");
      setPageLoading(false);
      return;
    }

    setCustomers(customerData || []);

    if (liveData?.id) {
      await loadItems(liveData.id);
    } else {
      setItems([]);
    }

    setPageLoading(false);
  }

  async function loadItems(liveId: string) {
    const { data, error } = await supabase
      .from("items")
      .select(
        `
        id,
        code,
        description,
        price,
        status,
        created_at,
        customer_id,
        customers (
          full_name
        )
      `
      )
      .eq("live_id", liveId)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Error al cargar prendas");
      return;
    }

    setItems((data as Item[]) || []);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!activeLive) {
      setMessage("No hay un live activo.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setMessage("Ingresá un precio válido.");
      return;
    }

    if (!customerId) {
      setMessage("Seleccioná una clienta.");
      return;
    }

    setLoading(true);
    setMessage("");

    const requiresFirstPayment = selectedCustomer
      ? !selectedCustomer.cart_enabled
      : false;

    const reservedUntil =
      status === "pending_payment"
        ? new Date(Date.now() + 10 * 60 * 1000).toISOString()
        : null;

    const { error } = await supabase.from("items").insert({
      live_id: activeLive.id,
      customer_id: customerId,
      code: generatedCode,
      description: description || null,
      price: Number(price),
      status,
      reserved_until: reservedUntil,
      requires_first_payment: requiresFirstPayment,
    });

    if (error) {
      if (error.message.includes("duplicate")) {
        setGeneratedCode(generateRandomCode());
        setMessage("Código duplicado, generando uno nuevo...");
      } else {
        setMessage(error.message);
      }

      setLoading(false);
      return;
    }

    setDescription("");
    setPrice("");
    setCustomerId("");
    setStatus("pending_payment");
    setGeneratedCode(generateRandomCode());
    setMessage("Prenda registrada correctamente.");

    await loadItems(activeLive.id);
    setLoading(false);
  }

  async function createNewCustomer() {
    const name = window.prompt("Nombre de la clienta");
    if (!name) return;

    const tiktok = window.prompt("Usuario de TikTok (opcional)") || null;
    const whatsapp = window.prompt("WhatsApp (opcional)") || null;

    const { error } = await supabase.from("customers").insert({
      full_name: name,
      tiktok_username: tiktok,
      whatsapp,
      is_recurring: false,
      cart_enabled: false,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Clienta creada correctamente.");
    await loadInitialData();
  }

  async function enableCartForCustomer() {
    if (!selectedCustomer) {
      setMessage("Primero seleccioná una clienta.");
      return;
    }

    const { error } = await supabase
      .from("customers")
      .update({
        cart_enabled: true,
        is_recurring: true,
      })
      .eq("id", selectedCustomer.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Carrito habilitado correctamente.");
    await loadInitialData();
    setCustomerId(selectedCustomer.id);
    setStatus("in_cart");
  }

  function startEdit(item: Item) {
    setEditingItemId(item.id);
    setEditDescription(item.description || "");
    setEditPrice(String(item.price));
    setEditCustomerId(item.customer_id || "");
    setEditStatus(item.status);
  }

  function cancelEdit() {
    setEditingItemId(null);
    setEditDescription("");
    setEditPrice("");
    setEditCustomerId("");
    setEditStatus("");
  }

  async function saveEdit(itemId: string) {
    if (!editPrice || Number(editPrice) <= 0) {
      setMessage("Ingresá un precio válido.");
      return;
    }

    const reservedUntil =
      editStatus === "pending_payment"
        ? new Date(Date.now() + 10 * 60 * 1000).toISOString()
        : null;

    const selected = customers.find((customer) => customer.id === editCustomerId);

    const { error } = await supabase
      .from("items")
      .update({
        description: editDescription || null,
        price: Number(editPrice),
        customer_id: editCustomerId || null,
        status: editStatus,
        reserved_until: reservedUntil,
        requires_first_payment: selected ? !selected.cart_enabled : false,
      })
      .eq("id", itemId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Prenda actualizada correctamente.");
    cancelEdit();

    if (activeLive?.id) {
      await loadItems(activeLive.id);
    }
  }

  async function cancelItem(itemId: string) {
    const confirmed = window.confirm("¿Querés cancelar esta prenda?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("items")
      .update({
        status: "cancelled",
        reserved_until: null,
      })
      .eq("id", itemId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Prenda cancelada.");
    if (activeLive?.id) {
      await loadItems(activeLive.id);
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.customers?.[0]?.full_name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ? true : item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <SectionCard
        title="Registrar prenda"
        description="Carga rápida de una prenda durante el live."
      >
        {pageLoading ? (
          <p className="text-sm text-slate-600">Cargando datos...</p>
        ) : !activeLive ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600">No hay un live activo.</p>
            <p className="text-sm text-slate-600">
              Primero activá un live desde la sección Lives.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Live activo</p>
              <p className="font-semibold text-slate-900">{activeLive.title}</p>
              <p className="text-sm text-slate-600">
                Tipo: {activeLive.bundle_type}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Código automático
              </label>
              <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900">
                {generatedCode}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Descripción
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: blusa negra"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Precio
              </label>

              <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                {quickPrices.map((quickPrice) => (
                  <button
                    key={quickPrice}
                    type="button"
                    onClick={() => setPrice(String(quickPrice))}
                    className={`rounded-2xl px-3 py-3 text-sm font-medium ${
                      price === String(quickPrice)
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {quickPrice.toLocaleString("es-PY")}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej: 35000"
                className="mt-3 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Clienta
              </label>

              <div className="flex gap-2">
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                >
                  <option value="">Seleccionar clienta</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name}
                      {customer.cart_enabled ? " · habilitada" : " · nueva"}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={createNewCustomer}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Nueva
                </button>
              </div>
            </div>

            {selectedCustomer ? (
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="font-medium text-slate-900">
                  {selectedCustomer.full_name}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Estado:{" "}
                  {selectedCustomer.cart_enabled
                    ? "carrito habilitado"
                    : "pendiente de habilitación"}
                </p>
                <p className="text-sm text-slate-600">
                  Tipo:{" "}
                  {selectedCustomer.is_recurring ? "recurrente" : "nueva"}
                </p>

                {!selectedCustomer.cart_enabled ? (
                  <button
                    type="button"
                    onClick={enableCartForCustomer}
                    className="mt-3 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:opacity-90"
                  >
                    Habilitar carrito
                  </button>
                ) : null}
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Estado inicial
              </label>

              <div className="grid gap-2 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setStatus("pending_payment")}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                    status === "pending_payment"
                      ? "bg-amber-500 text-white"
                      : "border border-slate-300 text-slate-700"
                  }`}
                >
                  Pendiente pago
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("in_cart")}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                    status === "in_cart"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 text-slate-700"
                  }`}
                >
                  En carrito
                </button>
              </div>
            </div>

            {message ? (
              <p className="text-sm text-slate-700">{message}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-5 py-4 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Registrar prenda"}
            </button>
          </form>
        )}
      </SectionCard>

      <SectionCard
        title="Prendas registradas"
        description="Lista editable con búsqueda y filtros."
      >
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, descripción o clienta"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          >
            <option value="all">Todos</option>
            <option value="pending_payment">Pendiente</option>
            <option value="in_cart">En carrito</option>
            <option value="paid">Pagada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {filteredItems.length === 0 ? (
          <p className="text-sm text-slate-600">No hay prendas para mostrar.</p>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 ${
                  item.status === "cancelled"
                    ? "border-red-200 bg-red-50"
                    : item.status === "pending_payment"
                      ? "border-amber-200 bg-amber-50"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
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
                        Clienta
                      </label>
                      <select
                        value={editCustomerId}
                        onChange={(e) => setEditCustomerId(e.target.value)}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                      >
                        <option value="">Sin asignar</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.full_name}
                          </option>
                        ))}
                      </select>
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
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.code}</p>
                        <p className="text-sm text-slate-600">
                          {item.description || "Sin descripción"}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          Cliente: {item.customers?.[0]?.full_name || "Sin asignar"}
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

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Editar
                      </button>

                      {item.status !== "cancelled" ? (
                        <button
                          type="button"
                          onClick={() => cancelItem(item.id)}
                          className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:opacity-90"
                        >
                          Cancelar prenda
                        </button>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}