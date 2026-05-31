"use client";

import { useState, useCallback } from "react";

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
  subcategoria: string;
};

type Tab = "economica" | "premium";
type Sub = "damas" | "caballeros" | "ninos";

// ── Lightbox ─────────────────────────────────────────────
function Lightbox({ fotos, idx, onClose, onPrev, onNext }: {
  fotos: string[]; idx: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", zIndex: 1001 }}>✕</button>
      {fotos.length > 1 && (
        <button onClick={e => { e.stopPropagation(); onPrev(); }}
          style={{ position: "absolute", left: 12, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 24, width: 44, height: 44, borderRadius: "50%", cursor: "pointer", zIndex: 1001 }}>
          {"‹"}
        </button>
      )}
      <img
        src={fotos[idx]}
        alt="foto ampliada"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "92vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 12 }}
      />
      {fotos.length > 1 && (
        <button onClick={e => { e.stopPropagation(); onNext(); }}
          style={{ position: "absolute", right: 12, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 24, width: 44, height: 44, borderRadius: "50%", cursor: "pointer", zIndex: 1001 }}>
          {"›"}
        </button>
      )}
      <div style={{ position: "absolute", bottom: 20, display: "flex", gap: 6 }}>
        {fotos.map((_, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === idx ? "#fff" : "rgba(255,255,255,0.4)" }} />
        ))}
      </div>
    </div>
  );
}

// ── Carrusel ──────────────────────────────────────────────
function CarruselFotos({ fotos, nombre, onOpen }: { fotos: string[]; nombre: string; onOpen: (i: number) => void }) {
  const [idx, setIdx] = useState(0);
  if (fotos.length === 0) return (
    <div style={{ width: "100%", height: 140, background: "#f5eaed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>👗</div>
  );
  return (
    <div style={{ position: "relative", width: "100%", height: 140, overflow: "hidden" }}>
      <img src={fotos[idx]} alt={nombre} onClick={() => onOpen(idx)}
        style={{ width: "100%", height: 140, objectFit: "cover", display: "block", cursor: "zoom-in" }} />
      {fotos.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + fotos.length) % fotos.length)}
            style={{ position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: 12, cursor: "pointer" }}>{"‹"}</button>
          <button onClick={() => setIdx(i => (i + 1) % fotos.length)}
            style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: 12, cursor: "pointer" }}>{"›"}</button>
          <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
            {fotos.map((_, i) => (
              <div key={i} onClick={() => setIdx(i)} style={{ width: 5, height: 5, borderRadius: "50%", background: i === idx ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────
function ProductoCard({ p, onLightbox }: { p: Producto; onLightbox: (fotos: string[], idx: number) => void }) {
  const disponible = p.estado === "disponible";
  const tallaTexto = p.talla ? " talla " + p.talla : "";
  const precioFormateado = Number(p.precio).toLocaleString("es-PY");
  const mensaje = encodeURIComponent("Hola! Me interesa la prenda: " + p.nombre + tallaTexto + " - \u20B2 " + precioFormateado + " del catalogo de El Roperito de Ruan.");
  const fotos = p.fotos && p.fotos.length > 0 ? p.fotos : p.foto_url ? [p.foto_url] : [];

  return (
    <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "0.5px solid #f0e0e4", opacity: disponible ? 1 : 0.6 }}>
      <div style={{ position: "relative" }}>
        <CarruselFotos fotos={fotos} nombre={p.nombre} onOpen={i => onLightbox(fotos, i)} />
        <span style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.92)", color: disponible ? "#16a34a" : "#9ca3af", fontSize: 9, fontWeight: 500, padding: "2px 7px", borderRadius: 20 }}>
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
          <a href={"https://wa.me/" + WHATSAPP_NUMBER + "?text=" + mensaje} target="_blank" rel="noopener noreferrer"
            style={{ display: "block", width: "100%", marginTop: 7, background: "transparent", border: "0.5px solid " + PINK, color: PINK, fontSize: 10, borderRadius: 8, padding: "5px 0", textAlign: "center", textDecoration: "none", fontWeight: 500 }}>
            {"Quiero esta"}
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function CatalogoClient({ productos }: { productos: Producto[] }) {
  const [tab, setTab] = useState<Tab>("economica");
  const [sub, setSub] = useState<Sub>("damas");
  const [lightbox, setLightbox] = useState<{ fotos: string[]; idx: number } | null>(null);

  const openLightbox = useCallback((fotos: string[], idx: number) => setLightbox({ fotos, idx }), []);

  const filtrados = productos.filter(p => p.categoria === tab && p.subcategoria === sub);

  const contTab = (t: Tab) => productos.filter(p => p.categoria === t && p.estado === "disponible").length;
  const contSub = (s: Sub) => productos.filter(p => p.categoria === tab && p.subcategoria === s && p.estado === "disponible").length;

  const SUBS: { key: Sub; label: string }[] = [
    { key: "damas", label: "👗 Damas" },
    { key: "caballeros", label: "👔 Caballeros" },
    { key: "ninos", label: "👧 Ninos" },
  ];

  return (
    <>
      {lightbox && (
        <Lightbox
          fotos={lightbox.fotos}
          idx={lightbox.idx}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox(l => l ? { ...l, idx: (l.idx - 1 + l.fotos.length) % l.fotos.length } : l)}
          onNext={() => setLightbox(l => l ? { ...l, idx: (l.idx + 1) % l.fotos.length } : l)}
        />
      )}

      <main style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "sans-serif" }}>

        {/* Header */}
        <div style={{ background: PINK, padding: "28px 20px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", overflow: "hidden", marginBottom: 4 }}>
            <img src={LOGO_URL} alt="El Roperito de Ruan" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontStyle: "italic", color: "#fff", fontWeight: 400, textAlign: "center" }}>
            El Roperito de Ruan
          </div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "rgba(255,255,255,0.75)", textTransform: "uppercase" }}>Catalogo 2026</div>
          <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
            <a href={"https://wa.me/" + WHATSAPP_NUMBER} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>WhatsApp</a>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
            <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>TikTok</a>
          </div>
        </div>

        {/* Tabs principales */}
        <div style={{ display: "flex", background: "#fff", borderBottom: "0.5px solid #f0e0e4", position: "sticky", top: 0, zIndex: 10 }}>
          {(["economica", "premium"] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setSub("damas"); }}
              style={{ flex: 1, padding: "12px 0", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer", background: "transparent", color: tab === t ? PINK : "#bbb", borderBottom: tab === t ? ("2px solid " + PINK) : "2px solid transparent", transition: "all 0.2s" }}>
              {t === "economica" ? ("💛 Economicas (" + contTab("economica") + ")") : ("✨ Premium (" + contTab("premium") + ")")}
            </button>
          ))}
        </div>

        {/* Subtabs */}
        <div style={{ display: "flex", background: "#fff", borderBottom: "0.5px solid #f5eaed", gap: 0 }}>
          {SUBS.map(s => (
            <button key={s.key} onClick={() => setSub(s.key)}
              style={{ flex: 1, padding: "9px 0", fontSize: 11, border: "none", cursor: "pointer", background: sub === s.key ? "#fdf0f3" : "transparent", color: sub === s.key ? PINK : "#aaa", borderBottom: sub === s.key ? ("1.5px solid " + PINK) : "1.5px solid transparent", transition: "all 0.2s" }}>
              {s.label + " (" + contSub(s.key) + ")"}
            </button>
          ))}
        </div>

        {/* Grid responsivo */}
        <div style={{ padding: 12, maxWidth: 1100, margin: "0 auto" }}>
          {filtrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👗</div>
              <p style={{ color: "#bbb", fontSize: 13 }}>{"No hay prendas en esta seccion todavia."}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
              {filtrados.map(p => <ProductoCard key={p.id} p={p} onLightbox={openLightbox} />)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ background: PINK, padding: "14px 20px", display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.8)" }}>{"WhatsApp: +595 971 109 476"}</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.8)" }}>{"TikTok: @roperitoruan"}</span>
        </div>

      </main>
    </>
  );
}