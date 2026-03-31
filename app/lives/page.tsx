import { AppShell } from "@/components/layout/AppShell";
import { LivesManager } from "@/components/lives/LivesManager";

export default function LivesPage() {
  return (
    <AppShell
      title="Lives"
      description="Crear, activar, cerrar y revisar historial de lives."
    >
      <LivesManager />
    </AppShell>
  );
}