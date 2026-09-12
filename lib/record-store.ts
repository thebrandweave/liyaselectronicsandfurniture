import type { Collection } from "mongodb";

export type StoreRecord = {
  _id: string;
  kind: string;
  owner: string;
  data: Record<string, any>;
  created: string;
};

// Keep the storefront's existing record IDs and owner boundaries.
export function createRecordStore(collection: Collection<StoreRecord>) {
  return {
    async list(
      kind: string,
      owner?: string,
    ): Promise<Array<Record<string, any> & { id: string; created: string }>> {
      const filter = owner === undefined ? { kind } : { kind, owner };
      const records = await collection.find(filter).sort({ created: 1, _id: 1 }).toArray();
      return records.map(({ _id, data, created }) => ({ ...data, id: _id, created }));
    },
    async save(id: string, kind: string, owner: string, data: unknown) {
      // JSON normalization preserves the former API's treatment of undefined fields.
      const normalized = JSON.parse(JSON.stringify(data));
      const result = await collection.updateOne(
        { _id: id, kind },
        {
          $set: { data: normalized },
          $setOnInsert: { kind, owner, created: new Date().toISOString() },
        },
        { upsert: true },
      );
      return result;
    },
    async updateOrderStatus(id: string, status: string) {
      const result = await collection.updateOne(
        { _id: id, kind: "order" },
        { $set: { "data.status": status } },
      );
      return result.matchedCount > 0;
    },
  };
}
