export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getStoreUser } from "@/app/auth";
import { list, save, updateOrderStatus } from "@/lib/store";
import { seed } from "@/lib/catalog";
import { z } from "zod";

const out = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });

const POPUP_ID = "homepage-popup";

const popupSchema = z
  .object({
    enabled: z.boolean(),
    title: z.string().trim().max(150).default(""),
    description: z.string().trim().max(3000).default(""),
    image: z
      .string()
      .trim()
      .max(2000)
      .refine((value) => {
        if (value === "") return true;

        if (
          value.startsWith("/images/") ||
          value.startsWith("/api/shop/image/")
        ) {
          return !value.includes("\\");
        }

        try {
          const url = new URL(value);

          return (
            url.protocol === "https:" &&
            !url.username &&
            !url.password
          );
        } catch {
          return false;
        }
      }, "Choose an uploaded image or a valid HTTPS image URL.")
      .default(""),
    imageAlt: z.string().trim().max(200).default(""),
  })
  .refine(
    (value) =>
      !value.enabled ||
      Boolean(value.title || value.description || value.image),
    {
      message:
        "Add an image, title, or description before enabling the popup.",
    },
  );

const reviewSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(3000),
  rating: z.number().int().min(1).max(5),
  published: z.boolean().default(false),
});

async function products() {
  const edits = await list("product");

  return [
    ...seed.filter(
      (product) => !edits.some((edit) => edit.id === product.id),
    ),
    ...edits,
  ].filter((product) => !("deleted" in product && product.deleted));
}

async function homepagePopup() {
  const records = await list("popup");
  const record = records.find((item) => item.id === POPUP_ID);

  if (!record || record.deleted) return null;

  const result = popupSchema.safeParse(record);

  return result.success ? result.data : null;
}

async function publishedReviews() {
  return (await list("review"))
    .filter((review) => !review.deleted && review.published === true)
    .map((review) => ({
      id: review.id,
      name: review.name,
      description: review.description,
      rating: Number(review.rating),
      published: true,
    }));
}

export async function GET(req: Request) {
  try {
    const user = await getStoreUser();

    const admin =
      !!user &&
      user.email.toLowerCase() ===
        String(process.env.ADMIN_EMAIL || "").toLowerCase();

    const type = new URL(req.url).searchParams.get("type");

    if (type === "popup") {
      const popup = await homepagePopup();

      return out({
        popup: popup?.enabled ? popup : null,
      });
    }

    if (type === "admin") {
      if (!admin) {
        return out(
          {
            error:
              "Store management requires an authorized administrator. Set the store administrator email before using this area.",
          },
          403,
        );
      }

      return out({
        popup: await homepagePopup(),
        orders: await list("order"),
        enquiries: await list("contact"),
        products: await products(),
        categories: (await list("category")).filter(
          (item) => !item.deleted,
        ),
        brands: (await list("brand")).filter(
          (item) => !item.deleted,
        ),
        offers: (await list("offer")).filter(
          (item) => !item.deleted,
        ),
        // Admin sees both published and unpublished reviews.
        reviews: (await list("review")).filter(
          (item) => !item.deleted,
        ),
      });
    }

    const popup = await homepagePopup();

    return out({
      popup: popup?.enabled ? popup : null,
      products: await products(),

      // Only published reviews are returned to visitors.
      reviews: await publishedReviews(),

      user: user
        ? {
            name: user.displayName,
            email: user.email,
            admin,
          }
        : null,

      state: user
        ? (await list("state", user.userId))[0] || {
            cart: [],
            wishlist: [],
          }
        : null,

      orders: user ? await list("order", user.userId) : [],
    });
  } catch (error) {
    console.error(
      "Store request failed:",
      error instanceof Error ? error.name : "Unknown error",
    );

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
    if (req.headers.get("origin") !== new URL(req.url).origin) {
      return out({ error: "Invalid request origin" }, 403);
    }

    const user = await getStoreUser();

    if (!user) {
      return out({ error: "Please sign in to continue." }, 401);
    }

    const body = z
      .object({
        action: z.string(),
        data: z.any(),
        kind: z.string().optional(),
        id: z.string().optional(),
      })
      .parse(await req.json());

    if (JSON.stringify(body).length > 100000) {
      return out({ error: "Request too large" }, 413);
    }

    const admin =
      user.email.toLowerCase() ===
      String(process.env.ADMIN_EMAIL || "").toLowerCase();

    if (body.action === "save-popup") {
      if (!admin) {
        return out(
          { error: "Administrator access required" },
          403,
        );
      }

      const popup = popupSchema.parse(body.data);

      await save(POPUP_ID, "popup", user.userId, popup);

      return out({
        ok: true,
        popup,
      });
    }

    if (body.action === "state") {
      const data = z
        .object({
          cart: z
            .array(
              z.object({
                id: z.string().max(100),
                qty: z.number().int().min(1).max(20),
              }),
            )
            .max(100),
          wishlist: z.array(z.string().max(100)).max(100),
        })
        .parse(body.data);

      await save(
        "state-" + user.userId,
        "state",
        user.userId,
        data,
      );

      return out({ ok: true });
    }

    if (body.action === "contact") {
      const data = z
        .object({
          name: z.string().min(2).max(100),
          phone: z.string().regex(/^[+\d\s-]{10,16}$/),
          email: z.string().email(),
          subject: z.string().min(2).max(200),
          message: z.string().min(10).max(3000),
        })
        .parse(body.data);

      await save(
        crypto.randomUUID(),
        "contact",
        user.userId,
        data,
      );

      return out({ ok: true });
    }

    if (body.action === "order") {
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
          delivery: z.enum([
            "Store Pickup",
            "Home Delivery",
          ]),
          payment: z.enum([
            "Pay at Store",
            "Cash on Delivery",
          ]),
          cart: z
            .array(
              z.object({
                id: z.string(),
                qty: z.number().int().min(1).max(20),
              }),
            )
            .min(1)
            .max(100),
        })
        .parse(body.data);

      if (
        data.delivery === "Home Delivery" &&
        (!/^[1-9]\d{5}$/.test(data.pin) ||
          data.address.length < 8 ||
          !data.city)
      ) {
        return out(
          {
            error:
              "Enter a complete delivery address and valid PIN code.",
          },
          400,
        );
      }

      const all = await products();

      const items = data.cart.map((item) => {
        const product = all.find(
          (product) => product.id === item.id,
        );

        if (!product || product.stock < item.qty) {
          throw new Error(
            "One or more items are unavailable.",
          );
        }

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: item.qty,
        };
      });

      const id =
        "LY-" +
        crypto.randomUUID().slice(0, 8).toUpperCase();

      await save(id, "order", user.userId, {
        ...data,
        cart: undefined,
        items,
        total: items.reduce(
          (total, item) => total + item.price * item.qty,
          0,
        ),
        status: "Pending",
        paymentStatus: "Unpaid",
        sample: true,
      });

      await save(
        "state-" + user.userId,
        "state",
        user.userId,
        {
          cart: [],
          wishlist:
            (await list("state", user.userId))[0]
              ?.wishlist || [],
        },
      );

      return out({ ok: true, id });
    }

    if (body.action === "admin") {
      if (!admin) {
        return out(
          { error: "Administrator access required" },
          403,
        );
      }

      const kind = z
        .enum([
          "product",
          "order",
          "category",
          "brand",
          "offer",
          "review",
        ])
        .parse(body.kind);

      const id = z
        .string()
        .min(1)
        .max(100)
        .parse(body.id);

      if (kind === "order") {
        const { status } = z
          .object({
            status: z.enum([
              "Pending",
              "Confirmed",
              "Processing",
              "Out for Delivery",
              "Delivered",
              "Cancelled",
            ]),
          })
          .parse(body.data);

        if (!(await updateOrderStatus(id, status))) {
          return out(
            { error: "Order not found" },
            404,
          );
        }
      } else if (kind === "review") {
        const review = reviewSchema.parse(body.data);

        await save(id, "review", user.userId, review);
      } else {
        if (kind === "product") {
          z.object({
            name: z.string().min(2),
            price: z.number().min(0),
            original: z.number().min(0),
            stock: z.number().int().min(0),
            image: z.string().refine(
              (value) =>
                value.startsWith("/images/") ||
                value.startsWith("/api/shop/image/") ||
                value.startsWith("https://"),
            ),
          }).parse(body.data);
        }

        await save(
          id,
          kind,
          user.userId,
          body.data,
        );
      }

      return out({ ok: true });
    }

    if (body.action === "admin-delete") {
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
        .parse(body.kind);

      const id = z
        .string()
        .min(1)
        .max(100)
        .parse(body.id);

      await save(id, kind, user.userId, {
        deleted: true,
      });

      return out({ ok: true });
    }

    return out({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error(
      "Store request failed:",
      error instanceof Error ? error.name : "Unknown error",
    );

    return out(
      {
        error:
          error instanceof z.ZodError
            ? "Please check the form fields."
            : "Unable to save. Check the product availability and database connection.",
      },
      400,
    );
  }
}