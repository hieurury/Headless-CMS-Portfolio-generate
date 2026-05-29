/**
 * DB Migration Script — Remove old monolithic section components from registry.
 * Run: node scripts/clear-components.mjs
 *
 * Removes: hero, about, skills, projects, experience, education, contact, footer
 * Keeps: navbar and all block-based components (will be re-seeded by backend)
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017/headless-cms-portfolio';
const OLD_SECTION_TYPES = [
  'hero', 'about', 'skills', 'projects',
  'experience', 'education', 'contact', 'footer',
  'navbar', // Will be re-seeded as NavbarBlock (v2.0.0)
];

// All new block types that should exist after re-seed
const NEW_BLOCK_TYPES = [
  'navbar',
  'section-wrapper', 'columns', '_column', 'row', 'split', 'card', 'container',
  'heading', 'text', 'button', 'badge', 'image',
  'stat', 'feature-card', 'timeline-item', 'divider', 'spacer',
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();

    // Find the componentdefinitions collection
    const collections = await db.listCollections().toArray();
    const collectionName = collections.find(c =>
      c.name === 'componentdefinitions' || c.name === 'components'
    )?.name;

    if (!collectionName) {
      console.log('ℹ️  No component definitions collection found.');
      return;
    }

    console.log(`Found collection: ${collectionName}`);
    const col = db.collection(collectionName);

    // Show current state
    const all = await col.find({}).project({ type: 1 }).toArray();
    console.log('Current types:', all.map(c => c.type));

    // Delete all old section types (they'll be gone permanently)
    const result = await col.deleteMany({ type: { $in: OLD_SECTION_TYPES } });
    console.log(`\n✅ Deleted ${result.deletedCount} old component definition(s): ${OLD_SECTION_TYPES.join(', ')}`);

    // Show remaining
    const remaining = await col.find({}).project({ type: 1 }).toArray();
    console.log('\nRemaining types:', remaining.map(c => c.type));
    console.log('\n✅ Done. Restart the backend to re-seed new block definitions.');
    console.log('   Expected after re-seed:', NEW_BLOCK_TYPES.join(', '));
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
