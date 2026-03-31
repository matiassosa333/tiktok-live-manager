import { AppShell } from "@/components/layout/AppShell";
import { PaymentsManager } from "@/components/payments/PaymentsManager";

export default function PagosPage() {
  return (
    <AppShell
      title="Pagos"
      description="Historial de pagos registrados y resumen de cobros."
    >
      <PaymentsManager />
    </AppShell>
  );
}