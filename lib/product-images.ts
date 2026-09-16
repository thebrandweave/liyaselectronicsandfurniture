import { GridFSBucket, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "Cluster0";

if (!uri) {
  throw new Error("MONGODB_URI is not configured");
}

declare global {
  // eslint-disable-next-line no-var
  var __liyasMongoClientPromise: Promise<MongoClient> | undefined;
}

const clientPromise =
  global.__liyasMongoClientPromise ||
  new MongoClient(uri).connect();

if (process.env.NODE_ENV !== "production") {
  global.__liyasMongoClientPromise = clientPromise;
}

export async function getProductImageBucket() {
  const client = await clientPromise;
  const db = client.db(dbName);

  return new GridFSBucket(db, {
    bucketName: "productImages",
  });
}
