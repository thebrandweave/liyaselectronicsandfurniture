import { MongoClient } from "mongodb";

type MongoCache = { promise?: Promise<MongoClient> };
const globalMongo = globalThis as typeof globalThis & { liyasMongo?: MongoCache };
const cache = (globalMongo.liyasMongo ??= {});

export async function getMongoDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Set MONGODB_URI in .env.local and restart the server.");
  if (!cache.promise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      ignoreUndefined: true,
    });
    cache.promise = client.connect().catch(async () => {
      cache.promise = undefined;
      await client.close().catch(() => {});
      throw new Error(
        "MongoDB connection failed. Check the URI, database user and Atlas IP access list.",
      );
    });
  }
  const client = await cache.promise;
  return client.db(process.env.MONGODB_DB || "liyas_store");
}
