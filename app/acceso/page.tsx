import { Suspense } from "react";
import AccessForm from "./AccessForm";

export default function AccessPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Cargando...</p>
        </div>
      </main>
    }>
      <AccessForm />
    </Suspense>
  );
}
