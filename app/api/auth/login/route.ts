export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { z } from "zod";
import {
  createSession,
  findUserByEmail,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth-store";
import { SESSION_COOKIE } from "@/app/auth";

const out = (data: unknown, status = 200) =>
  Response.json(data, { status });

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

export async function POST(req: Request) {
  try {
    if (req.headers.get("origin") !== new URL(req.url).origin) {
      return out({ error: "Invalid request origin" }, 403);
    }

    const data = schema.parse(await req.json());
    const email = normalizeEmail(data.email);

    const user = await findUserByEmail(email);

    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      return out(
        { error: "Invalid email or password." },
        401,
      );
    }

    const session = await createSession(user._id);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: session.expiresAt,
    });

    return out({
      ok: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return out(
        { error: "Enter a valid email and password." },
        400,
      );
    }

    console.error(
      "Login failed:",
      e instanceof Error ? e.message : e,
    );

    return out(
      { error: "Unable to sign in." },
      500,
    );
  }
}
