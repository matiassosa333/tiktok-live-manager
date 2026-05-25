export const revalidate = 0;

import { supabase } from "@/lib/supabase/client";

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

const WHATSAPP_NUMBER = "595971109476";
const LOGO_URL = "https://jugpbkjcuzdakwnmkgpt.supabase.co/storage/v1/object/public/assets/WhatsApp%20Image%202026-05-24%20at%2016.08.03.jpeg";

function Carrusel({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const imgs = fotos && fotos.length > 0 ? fotos : [];
  if (imgs.length === 0) return null;
  if (imgs.length === 1) {
    return (
      <img src={imgs[0]} alt={nombre} className="w-full h-64 object-cover" />
    );
  }
  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
      {imgs.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={nombre + " " + (i + 1)}
          className="w-full h-64 object-cover flex-shrink-0 snap-center"
        />
      ))}
    </div>
  );
}

function ProductoCard({ p }: { p: Producto }) {
  const disponible = p.estado === "disponible";
  const tallaTexto = p.talla ? " talla " + p.talla : "";
  const precioFormateado = Number(p.precio).toLocaleString("es-PY");
  const mensaje = encodeURIComponent(
    "Hola! Me interesa la prenda: " + p.nombre + tallaTexto + " - \u20B2 " + precioFormateado + " del catalogo de El Roperito de Ruan."
  );
  const fotos = p.fotos && p.fotos.length > 0 ? p.fotos : [p.foto_url];

  return (
    <div className={["group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300", !disponible ? "opacity-50" : ""].join(" ")}>
      <div className="relative overflow-hidden">
        <Carrusel fotos={fotos} nombre={p.nombre} />
        {fotos.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {fotos.map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/80" />
            ))}
          </div>
        )}
        <span className={["absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm", disponible ? "bg-white/90 text-emerald-600" : "bg-white/90 text-slate-400"].join(" ")}>
          {disponible ? "Disponible" : "Vendido"}
        </span>
        {!disponible && <div className="absolute inset-0 bg-white/40" />}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm leading-tight">{p.nombre}</h3>
          {p.talla && (
            <span className="inline-block mt-1 text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
              {p.talla}
            </span>
          )}
          {p.descripcion && (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.descripcion}</p>
          )}
        </div>
        <p className="text-base font-bold text-slate-900">
          {"\u20B2"} {precioFormateado}
        </p>
        {disponible && (
          <a
            href={"https://wa.me/" + WHATSAPP_NUMBER + "?text=" + mensaje}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#f9a8c9] hover:bg-[#f78cb5] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors duration-200"
          >
            {"💬 Quiero esta"}
          </a>
        )}
      </div>
    </div>
  );
}

function SeccionHeader({ emoji, titulo, cantidad }: { emoji: string; titulo: string; cantidad: number }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="h-px flex-1 bg-slate-100" />
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <h2 className="text-sm font-semibold tracking-widest text-slate-500 uppercase">{titulo}</h2>
        <span className="text-xs text-slate-300 font-medium">{cantidad} disponibles</span>
      </div>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

export default async function CatalogoPage() {
  const { data } = await supabase
    .from("productos")
    .select("*")
    .in("estado", ["disponible", "vendido"])
    .order("created_at", { ascending: false });

  const productos = data || [];
  const economicas = productos.filter((p) => p.categoria === "economica");
  const premium = productos.filter((p) => p.categoria === "premium");

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-slate-100 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <img
            src={LOGO_URL}
            alt="El Roperito de Ruan"
            className="h-24 w-24 rounded-full object-cover border-2 border-slate-100 shadow-sm"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">El Roperito de Ruan</h1>
            <p className="text-sm text-slate-400 mt-1">Ropa de segunda seleccionada con amor</p>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <a href={"https://wa.me/" + WHATSAPP_NUMBER} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors">
              WhatsApp
            </a>
            <span className="text-slate-200">|</span>
            <a href="https://www.tiktok.com/@elroperitoderuan?_r=1&_t=ZS-96duW2QLeJZ" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors">
              TikTok
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-14">
        {economicas.length > 0 && (
          <section>
            <SeccionHeader emoji="💛" titulo="Economicas" cantidad={economicas.filter(p => p.estado === "disponible").length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {economicas.map(p => <ProductoCard key={p.id} p={p} />)}
            </div>
          </section>
        )}
        {premium.length > 0 && (
          <section>
            <SeccionHeader emoji="✨" titulo="Premium" cantidad={premium.filter(p => p.estado === "disponible").length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {premium.map(p => <ProductoCard key={p.id} p={p} />)}
            </div>
          </section>
        )}
        {productos.length === 0 && (
          <div className="text-center py-24">
            <p className="text-2xl mb-3">👗</p>
            <p className="text-slate-400 text-sm">{"Pronto hay novedades. Seguinos en TikTok!"}</p>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-100 bg-white mt-16 py-8 text-center">
        <p className="text-xs text-slate-300">{"El Roperito de Ruan \u00b7 Todos los derechos reservados"}</p>
      </footer>
    </main>
  );
}