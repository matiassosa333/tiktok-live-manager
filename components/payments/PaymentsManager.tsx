"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { supabase } from "@/lib/supabase/client";

type PaymentRow = {
  id: string;
  amount: number;
  payment_type: "initial" | "final";
  status: "pending" | "confirmed" | "expired";
  created_at: string;
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

export function PaymentsManager() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        id,
        amount,
        payment_type,
        status,
        created_at,
        customers (
          full_name,
          whatsapp
        ),
        lives (
          title
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      setPayments([]);
      setLoading(false);
      return;
    }

    setPayments((data as PaymentRow[]) || []);
    setLoading(false);
  }

  const filteredPayments = payments.filter((payment) => {
    if (statusFilter === "all") return true;
    return payment.status === statusFilter;
  });

  const totalConfirmed = payments
    .filter((payment) => payment.status === "confirmed")
    .reduce((acc, payment) => acc + payment.amount, 0);

  const initialCount = payments.filter(
    (payment) => payment.payment_type === "initial"
  ).length;

  const finalCount = payments.filter(
    (payment) => payment.payment_type === "final"
  ).length;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
      <SectionCard
        title="Resumen de pagos"
        description="Vista general de cobros registrados."
      >
        <div className="space-y-3 text-sm text-slate-700">
          <p>• Pagos registrados: {payments.length}</p>
          <p>• Iniciales: {initialCount}</p>
          <p>• Finales: {finalCount}</p>
          <p>• Total confirmado: Gs. {totalConfirmed.toLocaleString("es-PY")}</p>
        </div>
      </SectionCard>

      <SectionCard
        title="Historial de pagos"
        description="Listado completo con filtros básicos."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {["all", "confirmed", "pending", "expired"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {status === "all" ? "Todos" : status}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Cargando pagos...</p>
        ) : filteredPayments.length === 0 ? (
          <p className="text-sm text-slate-600">
            No hay pagos para mostrar.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {payment.customers?.[0]?.full_name || "Sin clienta"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Live: {payment.lives?.[0]?.title || "Sin live"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Tipo: {payment.payment_type === "initial" ? "Inicial" : "Final"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      Gs. {payment.amount.toLocaleString("es-PY")}
                    </p>
                    <p className="text-sm capitalize text-slate-600">
                      {payment.status}
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