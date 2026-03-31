import { AppShell } from "@/components/layout/AppShell";
import { CloseLiveManager } from "@/components/cierre/CloseLiveManager";

export default function CierrePage() {
  return (
    <AppShell
      title="Cierre del live"
      description="Pantalla final para revisar, resumir y cerrar el live activo."
    >
      <CloseLiveManager />
    </AppShell>
  );
}