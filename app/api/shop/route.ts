export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getStoreUser } from "@/app/auth";
import { list, save, updateOrderStatus } from "@/lib/store";
import { seed } from "@/lib/catalog";
import { z } from "zod";
const out = (data: unknown, status = 200) => Response.json(data, { status });
async function products() {
  const edits = await list("product");
  return [...seed.filter((p) => !edits.some((e) => e.id === p.id)), ...edits].filter(
    (p) => !("deleted" in p && p.deleted),
  );
}
export async function GET(req: Request) {
  try {
    const user = await getStoreUser();
    const admin =
      !!user && user.email.toLowerCase() === String(process.env.ADMIN_EMAIL || "").toLowerCase();
    const type = new URL(req.url).searchParams.get("type");
    if (type === "admin") {
      if (!admin)
        return out(
          {
            error:
              "Store management requires an authorized administrator. Set the store administrator email before using this area.",
          },
          403,
        );
      return out({
        orders: await list("order"),
        enquiries: await list("contact"),
        products: await products(),
      categories: (await list("category")).filter(
  (x) => !x.deleted,
),

brands: (await list("brand")).filter(
  (x) => !x.deleted,
),

offers: (await list("offer")).filter(
  (x) => !x.deleted,
),

reviews: (await list("review")).filter(
  (x) => !x.deleted,
),
      });
    }
    return out({
      products: await products(),
      user: user ? { name: user.displayName, email: user.email, admin } : null,
      state: user ? (await list("state", user.userId))[0] || { cart: [], wishlist: [] } : null,
      orders: user ? await list("order", user.userId) : [],
    });
  } catch (e) {
    console.error("Store request failed:", e instanceof Error ? e.name : "Unknown error");
    return out(
      {
        error:
          "Cannot load MongoDB data. Check .env.local and run npm run db:check in your terminal.",
      },
      503,
    );
  }
}
export async function POST(req: Request) {
  try {
    if (req.headers.get("origin") !== new URL(req.url).origin)
      return out({ error: "Invalid request origin" }, 403);
    const user = await getStoreUser();
    if (!user) return out({ error: "Please sign in to continue." }, 401);
    const b = z
      .object({
        action: z.string(),
        data: z.any(),
        kind: z.string().optional(),
        id: z.string().optional(),
      })
      .parse(await req.json());
    if (JSON.stringify(b).length > 100000) return out({ error: "Request too large" }, 413);
    const admin = user.email.toLowerCase() === String(process.env.ADMIN_EMAIL || "").toLowerCase();
    if (b.action === "state") {
      const data = z
        .object({
          cart: z
            .array(z.object({ id: z.string().max(100), qty: z.number().int().min(1).max(20) }))
            .max(100),
          wishlist: z.array(z.string().max(100)).max(100),
        })
        .parse(b.data);
      await save("state-" + user.userId, "state", user.userId, data);
      return out({ ok: true });
    }
    if (b.action === "contact") {
      const data = z
        .object({
          name: z.string().min(2).max(100),
          phone: z.string().regex(/^[+\d\s-]{10,16}$/),
          email: z.string().email(),
          subject: z.string().min(2).max(200),
          message: z.string().min(10).max(3000),
        })
        .parse(b.data);
      await save(crypto.randomUUID(), "contact", user.userId, data);
      return out({ ok: true });
    }
    if (b.action === "order") {
      const data = z
        .object({
          name: z.string().min(2).max(100),
          phone: z.string().regex(/^[6-9]\d{9}$/),
          email: z.string().email(),
          address: z.string().max(500),
          city: z.string().max(100),
          district: z.string().max(100),
          state: z.string().max(100),
          pin: z.string(),
          landmark: z.string().max(200),
          delivery: z.enum(["Store Pickup", "Home Delivery"]),
          payment: z.enum(["Pay at Store", "Cash on Delivery"]),
          cart: z
            .array(z.object({ id: z.string(), qty: z.number().int().min(1).max(20) }))
            .min(1)
            .max(100),
        })
        .parse(b.data);
      if (
        data.delivery === "Home Delivery" &&
        (!/^[1-9]\d{5}$/.test(data.pin) || data.address.length < 8 || !data.city)
      )
        return out({ error: "Enter a complete delivery address and valid PIN code." }, 400);
      const all = await products();
      const items = data.cart.map((i) => {
        const p = all.find((p) => p.id === i.id);
        if (!p || p.stock < i.qty) throw Error("One or more items are unavailable.");
        return { id: p.id, name: p.name, price: p.price, qty: i.qty };
      });
      const id = "LY-" + crypto.randomUUID().slice(0, 8).toUpperCase();
      await save(id, "order", user.userId, {
        ...data,
        cart: undefined,
        items,
        total: items.reduce((s, i) => s + i.price * i.qty, 0),
        status: "Pending",
        paymentStatus: "Unpaid",
        sample: true,
      });
      await save("state-" + user.userId, "state", user.userId, {
        cart: [],
        wishlist: (await list("state", user.userId))[0]?.wishlist || [],
      });
      return out({ ok: true, id });
    }
    if (b.action === "admin") {
      if (!admin) return out({ error: "Administrator access required" }, 403);
      const kind = z
        .enum(["product", "order", "category", "brand", "offer", "review"])
        .parse(b.kind);
      const id = z.string().min(1).max(100).parse(b.id);
      if (kind === "order") {
        const status = z
          .enum([
            "Pending",
            "Confirmed",
            "Processing",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
          ])
          .parse(b.data.status);
        if (!(await updateOrderStatus(id, status))) return out({ error: "Order not found" }, 404);
      } else {
        if (kind === "product")
          z.object({
            name: z.string().min(2),
            price: z.number().min(0),
            original: z.number().min(0),
            stock: z.number().int().min(0),
       image: z.string().refine(
  (v) =>
    v.startsWith("/images/") ||
    v.startsWith("/api/shop/image/") ||
    v.startsWith("https://"),
),
          }).parse(b.data);
        await save(id, kind, user.userId, b.data);
      }
      return out({ ok: true });
    }
    if (b.action === "admin-delete") {
  if (!admin) {
    return out(
      { error: "Administrator access required" },
      403,
    );
  }

  const kind = z
    .enum([
      "product",
      "category",
      "brand",
      "offer",
      "review",
    ])
    .parse(b.kind);

  const id = z.string().min(1).max(100).parse(b.id);

  await save(
    id,
    kind,
    user.userId,
    {
      deleted: true,
    },
  );

  return out({
    ok: true,
  });
}
    return out({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("Store request failed:", e instanceof Error ? e.name : "Unknown error");
    return out(
      {
        error:
          e instanceof z.ZodError
            ? "Please check the form fields."
            : "Unable to save. Check the product availability and database connection.",
      },
      400,
    );
  }
}
