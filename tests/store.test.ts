import test from "node:test";
import assert from "node:assert/strict";
import { createRecordStore } from "../lib/record-store.ts";

function fixture() {
  const documents = new Map<string, any>();
  const matches = (doc: any, filter: any) =>
    Object.entries(filter).every(([key, value]) => doc[key] === value);
  const collection: any = {
    find(filter: any) {
      return {
        sort() {
          return {
            async toArray() {
              return [...documents.values()].filter((d) => matches(d, filter));
            },
          };
        },
      };
    },
    async updateOne(filter: any, update: any, options?: any) {
      let doc = documents.get(filter._id);
      if (!doc || !matches(doc, filter)) {
        if (!options?.upsert) return { matchedCount: 0 };
        if (doc) throw new Error("duplicate ID");
        doc = { ...filter, ...update.$setOnInsert };
      }
      for (const [key, value] of Object.entries(update.$set)) {
        if (key === "data.status") doc.data.status = value;
        else doc[key] = value;
      }
      documents.set(filter._id, doc);
      return { matchedCount: 1 };
    },
  };
  return createRecordStore(collection);
}

test("records retain IDs and creation time, and are isolated by owner and kind", async () => {
  const store = fixture();
  await store.save("state-alice", "state", "alice", { cart: [{ id: "sofa", qty: 1 }] });
  await store.save("state-bob", "state", "bob", { cart: [] });
  await store.save("product-1", "product", "alice", { name: "Chair" });
  const before = (await store.list("state", "alice"))[0];
  await store.save("state-alice", "state", "other", { cart: [], ignored: undefined });
  const after = (await store.list("state", "alice"))[0];
  assert.equal(after.id, before.id);
  assert.equal(after.created, before.created);
  assert.deepEqual(after.cart, []);
  assert.equal("ignored" in after, false);
  assert.equal((await store.list("state", "bob")).length, 1);
  assert.equal((await store.list("state", "other")).length, 0);
  assert.equal((await store.list("product")).length, 1);
});

test("order status updates preserve customer ownership and other order fields", async () => {
  const store = fixture();
  await store.save("order-1", "order", "alice", {
    status: "Pending",
    total: 150,
    items: [{ id: "chair" }],
  });
  await store.save("product-1", "product", "admin", { stock: 5 });
  assert.equal(await store.updateOrderStatus("order-1", "Delivered"), true);
  assert.equal(await store.updateOrderStatus("product-1", "Delivered"), false);
  assert.equal(await store.updateOrderStatus("missing", "Delivered"), false);
  const order = (await store.list("order", "alice"))[0];
  assert.equal(order.status, "Delivered");
  assert.equal(order.total, 150);
  assert.deepEqual(order.items, [{ id: "chair" }]);
});
