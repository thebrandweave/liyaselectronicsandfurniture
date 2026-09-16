import { MongoClient, ObjectId } from "mongodb";
import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "Cluster0";

if (!uri) {
  throw new Error("MONGODB_URI is not configured");
}

declare global {
  // eslint-disable-next-line no-var
  var __liyasAuthMongoClientPromise: Promise<MongoClient> | undefined;
}

const clientPromise =
  global.__liyasAuthMongoClientPromise ||
  new MongoClient(uri).connect();

if (process.env.NODE_ENV !== "production") {
  global.__liyasAuthMongoClientPromise = clientPromise;
}

export type AuthUserDocument = {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type SessionDocument = {
  _id: ObjectId;
  userId: ObjectId;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
};

async function collections() {
  const client = await clientPromise;
  const db = client.db(dbName);

  const users = db.collection<AuthUserDocument>("users");
  const sessions = db.collection<SessionDocument>("sessions");

  await Promise.all([
    users.createIndex({ email: 1 }, { unique: true }),
    sessions.createIndex({ tokenHash: 1 }, { unique: true }),
    sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);

  return { users, sessions };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);

  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  try {
    const [saltHex, hashHex] = stored.split(":");

    if (!saltHex || !hashHex) return false;

    const salt = Buffer.from(saltHex, "hex");
    const savedHash = Buffer.from(hashHex, "hex");
    const suppliedHash = scryptSync(password, salt, savedHash.length);

    return (
      suppliedHash.length === savedHash.length &&
      timingSafeEqual(suppliedHash, savedHash)
    );
  } catch {
    return false;
  }
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function findUserByEmail(email: string) {
  const { users } = await collections();
  return users.findOne({ email: normalizeEmail(email) });
}

export async function findUserById(id: ObjectId) {
  const { users } = await collections();
  return users.findOne({ _id: id });
}

export async function createUser(
  name: string,
  email: string,
  password: string,
) {
  const { users } = await collections();

  const document = {
    name: name.trim(),
    email: normalizeEmail(email),
    passwordHash: hashPassword(password),
    createdAt: new Date(),
  };

  const result = await users.insertOne(document as Omit<AuthUserDocument, "_id">);

  return {
    ...document,
    _id: result.insertedId,
  };
}

export async function createSession(userId: ObjectId) {
  const { sessions } = await collections();

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  await sessions.insertOne({
    _id: new ObjectId(),
    userId,
    tokenHash,
    createdAt: new Date(),
    expiresAt,
  });

  return {
    token,
    expiresAt,
  };
}

export async function findSession(token: string) {
  const { sessions } = await collections();

  return sessions.findOne({
    tokenHash: hashSessionToken(token),
    expiresAt: { $gt: new Date() },
  });
}

export async function deleteSession(token: string) {
  const { sessions } = await collections();

  await sessions.deleteOne({
    tokenHash: hashSessionToken(token),
  });
}
