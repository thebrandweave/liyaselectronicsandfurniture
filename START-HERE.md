# Liya’s — MongoDB local edition

This is the existing Liya’s storefront converted to Next.js on Node.js and MongoDB. It preserves the logo, Inter/Cormorant fonts, responsive drawer, GSAP animations, catalogue, admin product editing, cart, wishlist, demonstration orders and enquiries.

## Setup on Windows

1. Install Node.js 22.13 or newer.
2. Extract this ZIP into a NEW folder, open that folder in VS Code, and open a PowerShell terminal.
3. Run `npm ci`.
4. Run `Copy-Item .env.example .env.local`.
5. Edit `.env.local` and replace MONGODB_URI with your own Atlas connection URI. Set MONGODB_DB=liyas_store. Never share or commit this file.
6. In Atlas, create a database user with read/write access to liyas_store. Add your current public IP to the project IP access list. Use Atlas > Connect > Drivers to obtain the URI. Replace the password placeholder with the database user's password (URL-encode special characters).
7. Run `npm run db:check`. This pings MongoDB and creates the records collection/index. It prints no connection credentials.
8. Run `npm run dev` and open http://localhost:5173.
9. Manage products at http://localhost:5173/admin/products.

For a locally installed MongoDB Community Server, use MONGODB_URI=mongodb://127.0.0.1:27017 instead. The MongoDB server must be running.

## Local account access

The original ZIP used a simulated development account. This edition preserves that workflow explicitly: LOCAL_DEV_AUTH=true signs you in as LOCAL_DEV_EMAIL in development, only on localhost. Set LOCAL_DEV_EMAIL and ADMIN_EMAIL to the same email to test admin features. No password is required for this local testing mode. The dev/start scripts bind only to 127.0.0.1.

Simulated authentication is always disabled by `npm run build` / `npm start` production mode. This ZIP does not provide production customer registration or password login. Integrate a production authentication provider before exposing account/admin features on another server. Visitor-supplied identity headers are never trusted.

## Storage and migration

The application stores records in MongoDB's `records` collection with string _id, kind, owner, data (document), and created (ISO string). It reuses a pooled MongoClient. Product edits and new products are stored here; the eight illustrative catalogue products remain in lib/catalog.ts and are overlaid by saved records. Deletes are product tombstones. Other record kinds include state, order, contact, category, brand, offer, review.

The existing Cloudflare database is not imported, changed or deleted. This local edition starts with your MongoDB database and sample catalogue. If you have real D1 records, export and migrate them separately before switching real users.

Orders remain demonstrations: no real payment processing, stock reservation or shipping integration has been added.

## Commands

- npm run dev — local development at port 5173
- npm run db:check — validate Atlas access and create the database index
- npm test — record mapping, owner isolation and order update tests (mock collection)
- npm run build — production compilation
- npm start — production server at port 5173; local simulated login disabled
- npm run format — format application source

No Cloudflare account, Wrangler login, D1 binding or remote proxy is used by this edition. A working MongoDB URI is required for backend operations; compilation does not require database credentials.

## Validation

The delivered build and record-store tests were checked without your Atlas credentials. A live Atlas connection cannot be verified until you enter your URI and run db:check. Tests use an in-memory collection double, not a real MongoDB server.

Documentation: https://www.mongodb.com/docs/atlas/driver-connection/ and https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/
