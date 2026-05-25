export const revalidate = 0;

import { supabase } from "@/lib/supabase/client";
import CatalogoClient from "./CatalogoClient";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  talla: string;
  descripcion: string;
  foto_url: string;
  fotos: string[];
  estado: string;
  categoria: string;
};

export default async function CatalogoPage() {
  const { data } = await supabase
    .from("productos")
    .select("*")
    .in("estado", ["disponible", "vendido"])
    .order("created_at", { ascending: false });

  const productos: Producto[] = data || [];

  return <CatalogoClient productos={productos} />;
}