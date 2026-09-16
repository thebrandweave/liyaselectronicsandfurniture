export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { z } from "zod";
import {
  createSession,
  createUser,
  findUserByEmail,
  normalizeEmail,
} from "@/lib/auth-store";
import { SESSION_COOKIE } from "@/app/auth";

const out = (data: unknown, status = 200) =>
  Response.json(data, { status });

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  try {
    if (req.headers.get("origin") !== new URL(req.url).origin) {
      return out({ error: "Invalid request origin" }, 403);
    }

    const data = schema.parse(await req.json());
    const email = normalizeEmail(data.email);

    if (await findUserByEmail(email)) {
      return out(
        { error: "An account with this email already exists." },
        409,
      );
    }

    const user = await createUser(
      data.name,
      email,
      data.password,
    );

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
  } catch (e: any) {
    if (e?.code === 11000) {
      return out(
        { error: "An account with this email already exists." },
        409,
      );
    }

    if (e instanceof z.ZodError) {
      return out(
        {
          error:
            "Enter a valid name, email and password of at least 8 characters.",
        },
        400,
      );
    }

    console.error(
      "Registration failed:",
      e instanceof Error ? e.message : e,
    );

    return out(
      { error: "Unable to create your account." },
      500,
    );
  }
}
