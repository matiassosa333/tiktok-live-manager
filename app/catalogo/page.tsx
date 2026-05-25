import { supabase } from "@/lib/supabase/client";
export const revalidate = 0;
type Producto = {
  id: string;
  nombre: string;
  precio: number;
  talla: string;
  descripcion: string;
  foto_url: string;
  estado: string;
  categoria: string;
};

const WHATSAPP_NUMBER = "595971109476";
const LOGO_URL = "https://jugpbkjcuzdakwnmkgpt.supabase.co/storage/v1/object/public/assets/WhatsApp%20Image%202026-05-24%20at%2016.08.03.jpeg";

function ProductoCard({ p }: { p: Producto }) {
  const disponible = p.estado === "disponible";
  const tallaTexto = p.talla ? " talla " + p.talla : "";
  const precioFormateado = Number(p.precio).toLocaleString("es-PY");
  const mensaje = encodeURIComponent(
    "Hola! Me interesa la prenda: " + p.nombre + tallaTexto + " - \u20B2 " + precioFormateado + " del catalogo de El Roperito de Ruan."
  );

  return (
    <div className={["group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300", !disponible ? "opacity-50" : ""].join(" ")}>
      <div className="relative overflow-hidden">
        <img
          src={p.foto_url}
          alt={p.nombre}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className={["absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm", disponible ? "bg-white/90 text-emerald-600" : "bg-white/90 text-slate-400"].join(" ")}>
          {disponible ? "Disponible" : "Vendido"}
        </span>
        {!disponible && (
          <div className="absolute inset-0 bg-white/40" />
        )}
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
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-slate-900">
            {"\u20B2"} {precioFormateado}
          </p>
        </div>
        {disponible && (
          <a
            href={"https://wa.me/" + WHATSAPP_NUMBER + "?text=" + mensaje}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#f9a8c9] hover:bg-[#f78cb5] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335-1.508A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-5.017-1.381l-.36-.214-3.732.888.936-3.618-.235-.372A9.795 9.795 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            {"Quiero esta"}
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

      {/* Header */}
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
            <a
              href={"https://wa.me/" + WHATSAPP_NUMBER}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335-1.508A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-5.017-1.381l-.36-.214-3.732.888.936-3.618-.235-.372A9.795 9.795 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
              </svg>
              WhatsApp
            </a>
            <span className="text-slate-200">|</span>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
              </svg>
              TikTok
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-14">

        {economicas.length > 0 && (
          <section>
            <SeccionHeader
              emoji="💛"
              titulo="Economicas"
              cantidad={economicas.filter((p) => p.estado === "disponible").length}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {economicas.map((p) => <ProductoCard key={p.id} p={p} />)}
            </div>
          </section>
        )}

        {premium.length > 0 && (
          <section>
            <SeccionHeader
              emoji="✨"
              titulo="Premium"
              cantidad={premium.filter((p) => p.estado === "disponible").length}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {premium.map((p) => <ProductoCard key={p.id} p={p} />)}
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

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white mt-16 py-8 text-center">
        <p className="text-xs text-slate-300">{"El Roperito de Ruan \u00b7 Todos los derechos reservados"}</p>
      </footer>

    </main>
  );
}