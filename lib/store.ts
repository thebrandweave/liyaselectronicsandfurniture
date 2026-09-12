import { getMongoDatabase } from "./mongodb";
import { createRecordStore, type StoreRecord } from "./record-store";

async function store() {
  const db = await getMongoDatabase();
  return createRecordStore(db.collection<StoreRecord>("records"));
}
export async function list(kind: string, owner?: string) {
  return (await store()).list(kind, owner);
}
export async function save(id: string, kind: string, owner: string, data: unknown) {
  return (await store()).save(id, kind, owner, data);
}
export async function updateOrderStatus(id: string, status: string) {
  return (await store()).updateOrderStatus(id, status);
}
