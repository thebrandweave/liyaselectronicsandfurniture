import { headers } from "next/headers";

// This export retains the original ZIP's local testing workflow.
// Production never trusts a visitor-supplied identity header or a simulated user.
export async function getStoreUser() {
  if (process.env.NODE_ENV !== "development" || process.env.LOCAL_DEV_AUTH !== "true") return null;
  const host = (await headers()).get("host") || "";
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)) return null;
  const email = process.env.LOCAL_DEV_EMAIL || "mufizmalar@gmail.com";
  return { userId: "local-development-user", displayName: "Local developer", email };
}
