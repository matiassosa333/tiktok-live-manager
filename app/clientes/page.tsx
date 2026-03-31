import { AppShell } from "@/components/layout/AppShell";
import { ClientsManager } from "@/components/clients/ClientsManager";

export default function ClientesPage() {
  return (
    <AppShell
      title="Clientes"
      description="Administración de clientas con búsqueda y formulario real."
    >
      <ClientsManager />
    </AppShell>
  );
}