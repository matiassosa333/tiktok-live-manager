"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { supabase } from "@/lib/supabase/client";

type Live = {
  id: string;
  title: string;
  bundle_type: "economico" | "premium";
  status: "active" | "closed";
  created_at: string;
};

export function LivesManager() {
  const [title, setTitle] = useState("");
  const [bundleType, setBundleType] = useState<"economico" | "premium">(
    "premium"
  );
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadLives();
  }, []);

  async function loadLives() {
    const { data, error } = await supabase
      .from("lives")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setLives((data as Live[]) || []);
  }

  async function createLive(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Escribí un título para el live.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("lives").insert({
      title,
      bundle_type: bundleType,
      status: "closed",
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setTitle("");
    setBundleType("premium");
    setMessage("Live creado correctamente.");
    await loadLives();
    setLoading(false);
  }

  async function activateLive(liveId: string) {
    setMessage("");

    const { error: closeError } = await supabase
      .from("lives")
      .update({ status: "closed" })
      .eq("status", "active");

    if (closeError) {
      setMessage(closeError.message);
      return;
    }

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
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard
        title="Crear live"
        description="Se crea como cerrado; después podés activarlo."
      >
        <form onSubmit={createLive} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Live domingo noche"
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

          {message ? <p className="text-sm text-slate-700">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Crear live"}
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title="Lista de lives"
        description="Solo puede haber uno activo al mismo tiempo."
      >
        {lives.length === 0 ? (
          <p className="text-sm text-slate-600">Todavía no hay lives creados.</p>
        ) : (
          <div className="space-y-3">
            {lives.map((live) => (
              <div
                key={live.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{live.title}</p>
                    <p className="text-sm text-slate-600">
                      Tipo: {live.bundle_type}
                    </p>
                    <p className="text-sm text-slate-600">
                      Estado:{" "}
                      <span className="capitalize font-medium">
                        {live.status}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
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
                        className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-medium text-white hover:opacity-90"
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
