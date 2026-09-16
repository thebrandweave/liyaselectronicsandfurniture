export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth-store";
import { SESSION_COOKIE } from "@/app/auth";

export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) {
    return Response.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await deleteSession(token);
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return Response.json({ ok: true });
}
