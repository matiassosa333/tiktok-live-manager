type AccessPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function AccessPage({
  searchParams,
}: AccessPageProps) {
  const params = await searchParams;
  const next = params.next || "/dashboard";
  const error = params.error || "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Acceso privado</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ingresá la contraseña para entrar al panel.
        </p>

        <form action="/api/acceso/login" method="POST" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Escribí la contraseña"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 font-medium text-white hover:opacity-90"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}