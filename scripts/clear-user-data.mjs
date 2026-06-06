/**
 * DB Migration Script — Clear all user page/portfolio data.
 * Drops: portfolios, pages (and any stale component definitions)
 * Keeps: users
 *
 * Run: node scripts/clear-user-data.mjs
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017/headless-cms-portfolio';

// Block types that are being REMOVED and must not exist in any saved page
const REMOVED_BLOCK_TYPES = [
  'navbar',           // legacy monolithic navbar
  'text',
  'badge',
  'image',
  'divider',
  'spacer',
  'card',
  'row',
  'section-wrapper',
  'split',
  '_column',
  'nav-group',
  'logo',
  'stat',
  'feature-card',
  'timeline-item',
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();

    const collections = await db.listCollections().toArray();
    const names = collections.map((c) => c.name);
    console.log('Collections found:', names);

    let dropped = 0;

    // Drop portfolios
    if (names.includes('portfolios')) {
      await db.collection('portfolios').drop();
      console.log('✅ Dropped: portfolios');
      dropped++;
    } else {
      console.log('ℹ️  portfolios — not found, skipping');
    }

    // Drop pages (contains block layouts)
    if (names.includes('pages')) {
      await db.collection('pages').drop();
      console.log('✅ Dropped: pages');
      dropped++;
    } else {
      console.log('ℹ️  pages — not found, skipping');
    }

    // Clear stale component definitions (if collection exists)
    const compColName = names.find(
      (n) => n === 'componentdefinitions' || n === 'components',
    );
    if (compColName) {
      const result = await db
        .collection(compColName)
        .deleteMany({ type: { $in: REMOVED_BLOCK_TYPES } });
      console.log(
        `✅ Removed ${result.deletedCount} stale component definition(s) from ${compColName}`,
      );
    } else {
      console.log('ℹ️  No component definitions collection found, skipping');
    }

    const remaining = await db.listCollections().toArray();
    console.log('\nRemaining collections:', remaining.map((c) => c.name));
    console.log(
      `\n✅ Done. ${dropped} collection(s) dropped. Users kept.`,
    );
    console.log(
      '\n  Restart the backend server to re-seed the component registry with the new minimal block set.',
    );
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
