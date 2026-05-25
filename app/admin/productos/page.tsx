"use client";

import { useEffect, useState } from "react";
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

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [talla, setTalla] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("economica");
  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    setLoading(true);
    const { data } = await supabase
      .from("productos")
      .select("*")
      .order("created_at", { ascending: false });
    setProductos(data || []);
    setLoading(false);
  }

  function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setFotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (fotos.length === 0) { setMensaje("Seleccioná al menos una foto."); return; }
    setUploading(true);
    setMensaje("");

    const urls: string[] = [];

    for (const foto of fotos) {
      const ext = foto.name.split(".").pop();
      const path = Date.now() + "-" + Math.random().toString(36).slice(2) + "." + ext;
      const { error: uploadError } = await supabase.storage
        .from("productos")
        .upload(path, foto);

      if (uploadError) {
        setMensaje("Error subiendo foto.");
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("productos")
        .getPublicUrl(path);

      urls.push(urlData.publicUrl);
    }

    const { error: dbError } = await supabase.from("productos").insert({
      nombre,
      precio: parseFloat(precio),
      talla,
      descripcion,
      foto_url: urls[0],
      fotos: urls,
      estado: "disponible",
      categoria,
    });

    if (dbError) {
      setMensaje("Error guardando producto.");
    } else {
      setMensaje("✅ Prenda cargada.");
      setNombre(""); setPrecio(""); setTalla("");
      setDescripcion(""); setFotos([]); setPreviews([]);
      setCategoria("economica");
      fetchProductos();
    }
    setUploading(false);
  }

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from("productos").update({ estado }).eq("id", id);
    fetchProductos();
  }

  async function eliminar(id: string, fotosUrls: string[]) {
    for (const url of fotosUrls) {
      const path = url.split("/productos/")[1];
      if (path) await supabase.storage.from("productos").remove([path]);
    }
    await supabase.from("productos").delete().eq("id", id);
    fetchProductos();
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Catalogo</h1>
          <p className="text-sm text-slate-500 mt-1">Carga prendas para la tienda</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Nueva prenda</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fotos (hasta 3)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFotos}
                className="w-full text-sm text-slate-600"
              />
              {previews.length > 0 && (
                <div className="flex gap-3 mt-3">
                  {previews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={"preview " + (i + 1)}
                      className="h-24 w-24 object-cover rounded-xl border"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)}
                  required placeholder="Ej: Vestido floral"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio ({"\u20B2"})</label>
                <input value={precio} onChange={e => setPrecio(e.target.value)}
                  required type="number" step="1" placeholder="50000"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Talla</label>
                <input value={talla} onChange={e => setTalla(e.target.value)}
                  placeholder="S / M / L / XL"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select value={categoria} onChange={e => setCategoria(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500">
                  <option value="economica">Economica</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripcion</label>
              <input value={descripcion} onChange={e => setDescripcion(e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </div>

            {mensaje && (
              <p className={["text-sm", mensaje.includes("✅") ? "text-green-600" : "text-red-600"].join(" ")}>
                {mensaje}
              </p>
            )}

            <button type="submit" disabled={uploading}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
              {uploading ? "Subiendo..." : "Cargar prenda"}
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">
            {"Prendas cargadas (" + productos.length + ")"}
          </h2>

          {loading ? (
            <p className="text-sm text-slate-500">Cargando...</p>
          ) : productos.length === 0 ? (
            <p className="text-sm text-slate-500">No hay prendas todavia.</p>
          ) : (
            <div className="space-y-3">
              {productos.map(p => (
                <div key={p.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 p-3">
                  <div className="flex gap-1">
                    {(p.fotos && p.fotos.length > 0 ? p.fotos : [p.foto_url]).slice(0, 3).map((url, i) => (
                      <img key={i} src={url} alt={p.nombre}
                        className="h-14 w-14 rounded-lg object-cover border" />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{p.nombre}</p>
                    <p className="text-sm text-slate-500">
                      {"\u20B2"} {Number(p.precio).toLocaleString("es-PY")} {p.talla ? "· " + p.talla : ""}
                    </p>
                  </div>
                  <select value={p.estado}
                    onChange={e => cambiarEstado(p.id, e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none">
                    <option value="disponible">🟢 Disponible</option>
                    <option value="reservado">🟡 Reservado</option>
                    <option value="vendido">🔴 Vendido</option>
                  </select>
                  <button
                    onClick={() => eliminar(p.id, p.fotos && p.fotos.length > 0 ? p.fotos : [p.foto_url])}
                    className="text-sm text-red-500 hover:text-red-700 font-medium">
                    Borrar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}