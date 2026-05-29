/**
 * DB Migration Script — Drop portfolios and pages collections.
 * Run: node scripts/clear-db.mjs
 *
 * Keeps: users, components (component registry)
 * Drops: portfolios, pages
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017/headless-cms-portfolio';

async function main() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();

    const collections = await db.listCollections().toArray();
    const names = collections.map((c) => c.name);
    console.log('Collections found:', names);

    let dropped = 0;

    if (names.includes('portfolios')) {
      await db.collection('portfolios').drop();
      console.log('✅ Dropped: portfolios');
      dropped++;
    } else {
      console.log('ℹ️  portfolios — not found, skipping');
    }

    if (names.includes('pages')) {
      await db.collection('pages').drop();
      console.log('✅ Dropped: pages');
      dropped++;
    } else {
      console.log('ℹ️  pages — not found, skipping');
    }

    const remaining = await db.listCollections().toArray();
    console.log('\nRemaining collections:', remaining.map((c) => c.name));
    console.log(`\n✅ Migration complete. ${dropped} collection(s) dropped. Users kept.`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
