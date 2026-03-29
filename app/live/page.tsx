import { AppShell } from "@/components/layout/AppShell";
import { LiveManager } from "@/components/live/LiveManager";

export default function LivePage() {
  return (
    <AppShell
      title="Live actual"
      description="Registrar prendas, asignarlas a clientas y controlar el flujo del live."
    >
      <LiveManager />
    </AppShell>
  );
}
