import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
        <span className="mb-3 inline-block rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700">
          MVP interno
        </span>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Gestor de ventas TikTok Live
        </h1>

        <p className="mt-3 text-slate-600">
          Panel interno para gestionar prendas únicas, clientas, carritos,
          pagos y cierres de live desde una tablet.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-slate-900 px-5 py-4 text-center font-medium text-white transition hover:opacity-90"
          >
            Ir al dashboard
          </Link>

          <Link
            href="/live"
            className="rounded-2xl border border-slate-300 px-5 py-4 text-center font-medium text-slate-800 transition hover:bg-slate-50"
          >
            Ir al live actual
          </Link>
        </div>
      </div>
    </main>
  );
}