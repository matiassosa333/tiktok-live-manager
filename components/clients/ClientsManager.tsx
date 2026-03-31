"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { supabase } from "@/lib/supabase/client";

type Customer = {
  id: string;
  full_name: string;
  tiktok_username: string | null;
  whatsapp: string | null;
  is_recurring: boolean;
  cart_enabled: boolean;
  notes: string | null;
};

export function ClientsManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setCustomers((data as Customer[]) || []);
  }

  async function createCustomer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!fullName.trim()) {
      setMessage("El nombre es obligatorio.");
      return;
    }

    const { error } = await supabase.from("customers").insert({
      full_name: fullName,
      tiktok_username: tiktokUsername || null,
      whatsapp: whatsapp || null,
      notes: notes || null,
      is_recurring: false,
      cart_enabled: false,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setFullName("");
    setTiktokUsername("");
    setWhatsapp("");
    setNotes("");
    setMessage("Clienta creada correctamente.");
    await loadCustomers();
  }

  async function toggleRecurring(customer: Customer) {
    const { error } = await supabase
      .from("customers")
      .update({
        is_recurring: !customer.is_recurring,
      })
      .eq("id", customer.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadCustomers();
  }

  async function toggleCart(customer: Customer) {
    const { error } = await supabase
      .from("customers")
      .update({
        cart_enabled: !customer.cart_enabled,
      })
      .eq("id", customer.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadCustomers();
  }

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return customers;

    return customers.filter((customer) => {
      return (
        customer.full_name.toLowerCase().includes(term) ||
        (customer.tiktok_username || "").toLowerCase().includes(term) ||
        (customer.whatsapp || "").toLowerCase().includes(term)
      );
    });
  }, [customers, search]);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <SectionCard
        title="Nueva clienta"
        description="Formulario real para cargar clientas."
      >
        {message ? <p className="mb-4 text-sm text-slate-700">{message}</p> : null}

        <form onSubmit={createCustomer} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nombre completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Ej: Laura Gómez"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Usuario TikTok
            </label>
            <input
              type="text"
              value={tiktokUsername}
              onChange={(e) => setTiktokUsername(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="@usuario"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              WhatsApp
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="0981123456"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-25 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Observaciones de la clienta"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 font-medium text-white hover:opacity-90"
          >
            Guardar clienta
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title="Lista de clientas"
        description="Buscador y acciones rápidas."
      >
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Buscar por nombre, TikTok o WhatsApp"
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <p className="text-sm text-slate-600">No hay clientas para mostrar.</p>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {customer.full_name}
                    </p>
                    <p className="text-sm text-slate-600">
                      TikTok: {customer.tiktok_username || "Sin usuario"}
                    </p>
                    <p className="text-sm text-slate-600">
                      WhatsApp: {customer.whatsapp || "Sin número"}
                    </p>
                    {customer.notes ? (
                      <p className="mt-2 text-sm text-slate-700">
                        Nota: {customer.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRecurring(customer)}
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      {customer.is_recurring ? "Quitar recurrente" : "Marcar recurrente"}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCart(customer)}
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      {customer.cart_enabled ? "Deshabilitar carrito" : "Habilitar carrito"}
                    </button>
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