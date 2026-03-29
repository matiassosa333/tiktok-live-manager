import { AppShell } from "@/components/layout/AppShell";
import { CartManager } from "@/components/carts/CartManager";

export default function CarritosPage() {
  return (
    <AppShell
      title="Carritos"
      description="Vista real por clienta con prendas acumuladas, total y pagos."
    >
      <CartManager />
    </AppShell>
  );
}