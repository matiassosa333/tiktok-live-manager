import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/dashboard");

  if (!process.env.APP_ACCESS_PASSWORD) {
    const url = new URL("/acceso", request.url);
    url.searchParams.set(
      "error",
      "Falta APP_ACCESS_PASSWORD en variables de entorno."
    );
    return NextResponse.redirect(url);
  }

  if (password !== process.env.APP_ACCESS_PASSWORD) {
    const url = new URL("/acceso", request.url);
    url.searchParams.set("next", next);
    url.searchParams.set("error", "Contraseña incorrecta.");
    return NextResponse.redirect(url);
  }

  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const response = NextResponse.redirect(new URL(safeNext, request.url));

  response.cookies.set({
    name: "app_access",
    value: "ok",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}