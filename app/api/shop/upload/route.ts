export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getStoreUser } from "@/app/auth";
import { getProductImageBucket } from "@/lib/product-images";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const out = (data: unknown, status = 200) =>
  Response.json(data, { status });

export async function POST(req: Request) {
  try {
    if (req.headers.get("origin") !== new URL(req.url).origin) {
      return out({ error: "Invalid request origin" }, 403);
    }

    const user = await getStoreUser();
    if (!user) return out({ error: "Please sign in to continue." }, 401);

    const admin =
      user.email.toLowerCase() ===
      String(process.env.ADMIN_EMAIL || "").toLowerCase();

    if (!admin) {
      return out({ error: "Administrator access required" }, 403);
    }

    const form = await req.formData();
    const image = form.get("image");

    if (!(image instanceof File)) {
      return out({ error: "Choose an image to upload." }, 400);
    }

    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      return out(
        { error: "Only JPG, PNG, WEBP and GIF images are allowed." },
        400,
      );
    }

    if (image.size <= 0 || image.size > MAX_IMAGE_SIZE) {
      return out({ error: "Image must be smaller than 5 MB." }, 413);
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const bucket = await getProductImageBucket();

    const safeName = image.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .slice(-120);

    const upload = bucket.openUploadStream(
      `${crypto.randomUUID()}-${safeName || "product-image"}`,
      {
        metadata: {
          contentType: image.type,
          uploadedBy: user.userId,
          uploadedAt: new Date(),
        },
      },
    );

    await new Promise<void>((resolve, reject) => {
      upload.once("error", reject);
      upload.once("finish", () => resolve());
      upload.end(buffer);
    });

    return out({
      ok: true,
      url: `/api/shop/image/${upload.id.toString()}`,
    });
  } catch (e) {
    console.error(
      "Product image upload failed:",
      e instanceof Error ? e.message : e,
    );

    return out({ error: "Unable to upload image." }, 500);
  }
}
