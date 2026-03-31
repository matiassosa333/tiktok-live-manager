import { AppShell } from "@/components/layout/AppShell";
import { DeliveriesManager } from "@/components/deliveries/DeliveriesManager";

export default function EntregasPage() {
  return (
    <AppShell
      title="Entregas"
      description="Control de retiros, envíos y estados de entrega."
    >
      <DeliveriesManager />
    </AppShell>
  );
}