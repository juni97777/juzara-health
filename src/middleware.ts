
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Nonaktifkan seluruh API backend dalam mode demo
  if (path.startsWith("/api/")) {
    return NextResponse.json(
      { message: "API dinonaktifkan dalam mode demo." },
      { status: 404 }
    );
  }

  // Izinkan semua halaman website dibuka tanpa autentikasi
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\.).*)", "/api/:path*"],
};
