export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getProductImageBucket } from "@/lib/product-images";
import { ObjectId } from "mongodb";
import { Readable } from "node:stream";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return new Response("Image not found", { status: 404 });
    }

    const objectId = new ObjectId(id);
    const bucket = await getProductImageBucket();
    const file = await bucket.find({ _id: objectId }).next();

    if (!file) {
      return new Response("Image not found", { status: 404 });
    }

    const nodeStream = bucket.openDownloadStream(objectId);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new Response(webStream, {
      headers: {
        "Content-Type":
          String(file.metadata?.contentType || "application/octet-stream"),
        "Content-Length": String(file.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error(
      "Product image read failed:",
      e instanceof Error ? e.message : e,
    );

    return new Response("Image not found", { status: 404 });
  }
}
