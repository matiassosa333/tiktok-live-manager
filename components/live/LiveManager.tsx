"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { supabase } from "@/lib/supabase/client";

type LiveRow = {
  id: string;
  title: string;
  bundle_type: "economico" | "premium";
  status: "active" | "closed";
  created_at: string;
};

type ItemSummary = {
  live_id: string;
  price: number;
  status: string;
};

type LiveCard = LiveRow & {
  itemCount: number;
  total: number;
};

export function LiveManager() {
  const [lives, setLives] = useState<LiveCard[]>([]);
  const [title, setTitle] = useState("");
  const [bundleType, setBundleType] = useState<"economico" | "premium">(
    "premium"
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLives();
  }, []);

  async function loadLives() {
    setLoading(true);
    setMessage("");

    const { data: liveData, error: liveError } = await supabase
      .from("lives")
      .select("*")
      .order("created_at", { ascending: false });

    if (liveError) {
      setMessage(liveError.message);
      setLoading(false);
      return;
    }

    const { data: itemData } = await supabase
      .from("items")
      .select("live_id, price, status");

    const items = (itemData as ItemSummary[]) || [];

    const livesWithSummary: LiveCard[] = ((liveData as LiveRow[]) || []).map(
      (live) => {
        const liveItems = items.filter(
          (item) => item.live_id === live.id && item.status !== "cancelled"
        );

        return {
          ...live,
          itemCount: liveItems.length,
          total: liveItems.reduce((acc, item) => acc + item.price, 0),
        };
      }
    );

    setLives(livesWithSummary);
    setLoading(false);
  }

  async function createLive(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Escribí un título para el live.");
      return;
    }

    const { error } = await supabase.from("lives").insert({
      title,
      bundle_type: bundleType,
      status: "closed",
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setTitle("");
    setBundleType("premium");
    setMessage("Live creado correctamente.");
    await loadLives();
  }

  async function activateLive(liveId: string) {
    const confirmed = window.confirm(
      "¿Querés activar este live? Se cerrará cualquier live activo anterior."
    );

    if (!confirmed) return;

    await supabase.from("lives").update({ status: "closed" }).eq("status", "active");

    const { error } = await supabase
      .from("lives")
      .update({ status: "active" })
      .eq("id", liveId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Live activado correctamente.");
    await loadLives();
  }

  async function closeLive(liveId: string) {
    const confirmed = window.confirm("¿Querés cerrar este live?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("lives")
      .update({ status: "closed" })
      .eq("id", liveId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Live cerrado correctamente.");
    await loadLives();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <SectionCard
        title="Crear nuevo live"
        description="Creá un live y luego activalo cuando lo vayas a usar."
      >
        {message ? <p className="mb-4 text-sm text-slate-700">{message}</p> : null}

        <form onSubmit={createLive} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Live sábado noche"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tipo de fardo
            </label>
            <select
              value={bundleType}
              onChange={(e) =>
                setBundleType(e.target.value as "economico" | "premium")
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="premium">Premium</option>
              <option value="economico">Económico</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 font-medium text-white hover:opacity-90"
          >
            Crear live
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title="Historial de lives"
        description="Vista de lives creados, activos y cerrados."
      >
        {loading ? (
          <p className="text-sm text-slate-600">Cargando lives...</p>
        ) : lives.length === 0 ? (
          <p className="text-sm text-slate-600">Todavía no hay lives creados.</p>
        ) : (
          <div className="space-y-3">
            {lives.map((live) => (
              <div
                key={live.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{live.title}</p>
                    <p className="text-sm text-slate-600">
                      Tipo: {live.bundle_type}
                    </p>
                    <p className="text-sm text-slate-600">
                      Estado: {live.status === "active" ? "Activo" : "Cerrado"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {live.itemCount} prenda
                      {live.itemCount !== 1 ? "s" : ""} · Gs.{" "}
                      {live.total.toLocaleString("es-PY")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/lives/${live.id}`}
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Ver detalle
                    </Link>

                    {live.status !== "active" ? (
                      <button
                        type="button"
                        onClick={() => activateLive(live.id)}
                        className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:opacity-90"
                      >
                        Activar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => closeLive(live.id)}
                        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:opacity-90"
                      >
                        Cerrar
                      </button>
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