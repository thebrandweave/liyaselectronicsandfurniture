import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Set MONGODB_URI in .env.local first.");
  process.exit(1);
}
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "liyas_store");
  await db.command({ ping: 1 });
  await db.collection("records").createIndex({ kind: 1, owner: 1, created: 1 });
  console.log("MongoDB connected. The records collection and index are ready.");
} catch {
  console.error(
    "MongoDB connection/setup failed. Check your database user, password, URI and Atlas IP access list.",
  );
  process.exitCode = 1;
} finally {
  await client.close();
}
