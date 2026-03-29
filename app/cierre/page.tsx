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
          description="Más adelante esto saldrá de la base de datos."
        >
          <div className="space-y-3 text-sm text-slate-700">
            <p>• Laura — total Gs. 95.000</p>
            <p>• Camila — total Gs. 70.000</p>
            <p>• Rocío — total Gs. 140.000</p>
          </div>
        </SectionCard>

        <SectionCard
          title="Mensaje listo para WhatsApp"
          description="Luego lo vamos a generar automático."
        >
          <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
            Hola Laura, tu total del live es de Gs. 95.000. Recordá que el pago
            debe completarse dentro de la semana. El envío se cobra aparte.
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}