"use client";

import { useState } from "react";

const WHATSAPP_NUMBER = "595971109476";
const LOGO_URL = "https://jugpbkjcuzdakwnmkgpt.supabase.co/storage/v1/object/public/assets/WhatsApp%20Image%202026-05-24%20at%2016.08.03.jpeg";
const PINK = "#c9788a";

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

function CarruselFotos({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const [idx, setIdx] = useState(0);
  const imgs = fotos && fotos.length > 0 ? fotos : [];
  if (imgs.length === 0) return <div style={{ width: "100%", height: 140, background: "#f5eaed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>👗</div>;

  return (
    <div style={{ position: "relative", width: "100%", height: 140, overflow: "hidden" }}>
      <img
        src={imgs[idx]}
        alt={nombre}
        style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
      />
      {imgs.length > 1 && (
        <>
          <button
            onClick={() => setIdx(i => (i - 1 + imgs.length) % imgs.length)}
            style={{ position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >{"‹"}</button>
          <button
            onClick={() => setIdx(i => (i + 1) % imgs.length)}
            style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >{"›"}</button>
          <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
            {imgs.map((_, i) => (
              <div key={i} onClick={() => setIdx(i)} style={{ width: 5, height: 5, borderRadius: "50%", background: i === idx ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer" }} />
            ))}
          </div>
        </>
      )}
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
  const fotos = p.fotos && p.fotos.length > 0 ? p.fotos : p.foto_url ? [p.foto_url] : [];

  return (
    <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "0.5px solid #f0e0e4", opacity: disponible ? 1 : 0.6 }}>
      <div style={{ position: "relative" }}>
        <CarruselFotos fotos={fotos} nombre={p.nombre} />
        <span style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(255,255,255,0.92)",
          color: disponible ? "#16a34a" : "#9ca3af",
          fontSize: 9, fontWeight: 500,
          padding: "2px 7px", borderRadius: 20
        }}>
          {disponible ? "Disponible" : "Vendido"}
        </span>
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#3a2a2e", lineHeight: 1.3 }}>{p.nombre}</div>
        {p.talla && <div style={{ fontSize: 9, color: "#a07080", marginTop: 2 }}>{"Talla: " + p.talla}</div>}
        {p.descripcion && <div style={{ fontSize: 9, color: "#bbb", marginTop: 2 }}>{p.descripcion}</div>}
        <div style={{ marginTop: 6 }}>
          <span style={{ background: disponible ? PINK : "#ddd", color: disponible ? "#fff" : "#999", fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20 }}>
            {disponible ? ("\u20B2 " + precioFormateado) : "Vendido"}
          </span>
        </div>
        {disponible && (
          <a
            href={"https://wa.me/" + WHATSAPP_NUMBER + "?text=" + mensaje}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", width: "100%", marginTop: 7, background: "transparent", border: "0.5px solid " + PINK, color: PINK, fontSize: 10, borderRadius: 8, padding: "5px 0", textAlign: "center", textDecoration: "none", fontWeight: 500 }}
          >
            {"Quiero esta"}
          </a>
        )}
      </div>
    </div>
  );
}

export default function CatalogoClient({ productos }: { productos: Producto[] }) {
  const [tab, setTab] = useState<"economica" | "premium">("economica");

  const economicas = productos.filter(p => p.categoria === "economica");
  const premium = productos.filter(p => p.categoria === "premium");
  const visibles = tab === "economica" ? economicas : premium;

  const dispEco = economicas.filter(p => p.estado === "disponible").length;
  const dispPrem = premium.filter(p => p.estado === "disponible").length;

  return (
    <main style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "sans-serif" }}>

      {/* Header */}
      <div style={{ background: PINK, padding: "28px 20px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", overflow: "hidden", marginBottom: 4 }}>
          <img src={LOGO_URL} alt="El Roperito de Ruan" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontStyle: "italic", color: "#fff", fontWeight: 400, textAlign: "center" }}>
          El Roperito de Ruan
        </div>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "rgba(255,255,255,0.75)", textTransform: "uppercase" }}>
          {"Catalogo 2026"}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
          <a href={"https://wa.me/" + WHATSAPP_NUMBER} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
            {"WhatsApp"}
          </a>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
          <a href="https://www.tiktok.com/@elroperitoderuan?_r=1&_t=ZS-96duW2QLeJZ" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
            {"TikTok"}
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "0.5px solid #f0e0e4", position: "sticky", top: 0, zIndex: 10 }}>
        {(["economica", "premium"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "12px 0", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
              background: "transparent",
              color: tab === t ? PINK : "#bbb",
              borderBottom: tab === t ? ("2px solid " + PINK) : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            {t === "economica" ? ("💛 Economicas (" + dispEco + ")") : ("✨ Premium (" + dispPrem + ")")}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: 12 }}>
        {visibles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👗</div>
            <p style={{ color: "#bbb", fontSize: 13 }}>{"Pronto hay novedades!"}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {visibles.map(p => <ProductoCard key={p.id} p={p} />)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: PINK, padding: "14px 20px", display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.8)" }}>{"WhatsApp: +595 971 109 476"}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.8)" }}>{"TikTok: @roperitoruan"}</span>
      </div>

    </main>
  );
}