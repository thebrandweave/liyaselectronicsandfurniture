import { cookies } from "next/headers";
import {
  findSession,
  findUserById,
} from "@/lib/auth-store";

export const SESSION_COOKIE = "liyas_session";

export async function getStoreUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await findSession(token);

  if (!session) return null;

  const user = await findUserById(session.userId);

  if (!user) return null;

  return {
    userId: user._id.toString(),
    email: user.email,
    displayName: user.name,
  };
}
