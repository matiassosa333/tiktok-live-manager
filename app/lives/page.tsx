import { AppShell } from "@/components/layout/AppShell";
import { LivesManager } from "@/components/lives/LivesManager";

export default function LivesPage() {
  return (
    <AppShell
      title="Lives"
      description="Crear, activar y cerrar transmisiones desde la interfaz."
    >
      <LivesManager />
    </AppShell>
  );
}
