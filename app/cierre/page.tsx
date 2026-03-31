export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/ui/SectionCard";

export default function CierrePage() {
  return (
    <AppShell
      title="Cierre del live"
      description="Resumen final por clienta con total y mensaje de cobro."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Resumen por clienta"
          description="Podés usar la sección Carritos para copiar mensajes reales."
        >
          <div className="space-y-3 text-sm text-slate-700">
            <p>• Revisá carritos activos.</p>
            <p>• Confirmá pagos iniciales y finales.</p>
            <p>• Copiá el mensaje de WhatsApp desde cada carrito.</p>
          </div>
        </SectionCard>

        <SectionCard
          title="Siguiente mejora sugerida"
          description="Qué conviene construir después."
        >
          <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
            Agregar temporizador visual para prendas pendientes y un historial
            por live con resumen final.
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
