import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const password = body?.password;

  if (!process.env.APP_ACCESS_PASSWORD) {
    return NextResponse.json(
      { error: "Falta APP_ACCESS_PASSWORD en variables de entorno." },
      { status: 500 }
    );
  }

  if (password !== process.env.APP_ACCESS_PASSWORD) {
    return NextResponse.json(
      { error: "Contraseña incorrecta." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });

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