import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(new URL("/acceso", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));

  response.cookies.set("app_access", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}