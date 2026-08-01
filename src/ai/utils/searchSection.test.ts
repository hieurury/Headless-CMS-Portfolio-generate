/**
 * ════════════════════════════════════════════════════════
 * Unit test thủ công cho searchSection.ts và GenerateLayoutTool.
 * Chạy bằng: npx ts-node --project tsconfig.json src/ai/utils/searchSection.test.ts
 *
 * Kiểm tra tất cả các action: ADD_CHILD, ADD_BEFORE, ADD_AFTER, UPDATE, DELETE
 * ════════════════════════════════════════════════════════
 */

import {
  AI_ACTION,
  applyModification,
  applyModifications,
} from './searchSection';

// ─── Mock layout data ─────────────────────────────────────────────────────────
const mockLayout: any[] = [
  {
    id: 'nav-001',
    type: 'nav-bar-wrapper',
    props: { sticky: true },
    children: [
      {
        id: 'nav-inner-001',
        type: 'columns',
        props: { columns: '2' },
        children: [
          {
            id: 'nav-logo-001',
            type: 'heading',
            props: { text: 'MyPortfolio', level: 'h1' },
            children: [],
          },
          {
            id: 'nav-links-001',
            type: 'flex',
            props: { direction: 'row', gap: 'md' },
            children: [
              { id: 'link-about', type: 'link', props: { label: 'About', href: '#about' }, children: [] },
              { id: 'link-contact', type: 'link', props: { label: 'Contact', href: '#contact' }, children: [] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hero-001',
    type: 'container',
    props: { backgroundColor: '#0a0a0f' },
    children: [
      {
        id: 'hero-inner-001',
        type: 'rows',
        props: { rows: '2' },
        children: [
          { id: 'hero-heading-001', type: 'heading', props: { text: 'Hello World', level: 'h1', size: '5xl' }, children: [] },
          { id: 'hero-desc-001', type: 'description', props: { text: 'I build things.', size: 'lg' }, children: [] },
        ],
      },
    ],
  },
  {
    id: 'footer-001',
    type: 'container',
    props: { backgroundColor: '#111' },
    children: [],
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function findById(nodes: any[], id: string): any | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const found = findById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function countNodes(nodes: any[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children ?? []), 0);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

// TEST 1: DELETE — xoá footer-001
console.log('\n[TEST 1] DELETE: Xoá "footer-001"');
{
  const result = applyModification(mockLayout, { type: AI_ACTION.DELETE, targetId: 'footer-001' });
  assert(result.length === 2, 'Top-level section count giảm từ 3 → 2');
  assert(!findById(result, 'footer-001'), '"footer-001" không còn tồn tại trong cây');
  assert(!!findById(result, 'nav-001'), '"nav-001" vẫn còn nguyên vẹn');
}

// TEST 2: DELETE — xoá node sâu link-about
console.log('\n[TEST 2] DELETE nested: Xoá "link-about" ở sâu trong cây');
{
  const result = applyModification(mockLayout, { type: AI_ACTION.DELETE, targetId: 'link-about' });
  const flexNode = findById(result, 'nav-links-001');
  assert(!!flexNode, '"nav-links-001" vẫn tồn tại');
  assert(flexNode?.children.length === 1, '"nav-links-001" chỉ còn 1 child (link-contact)');
  assert(!findById(result, 'link-about'), '"link-about" đã bị xoá');
}

// TEST 3: UPDATE — đổi text heading hero
console.log('\n[TEST 3] UPDATE: Đổi text "hero-heading-001"');
{
  const result = applyModification(mockLayout, {
    type: AI_ACTION.UPDATE,
    targetId: 'hero-heading-001',
    newNode: { id: 'hero-heading-001', type: 'heading', props: { text: 'I Build Digital Experiences', level: 'h1', size: '5xl' }, children: [] },
  });
  const updated = findById(result, 'hero-heading-001');
  assert(updated?.props.text === 'I Build Digital Experiences', 'Text đã được cập nhật');
  assert(result.length === 3, 'Số section top-level không thay đổi');
}

// TEST 4: ADD_CHILD — thêm badge vào trong nav-links-001
console.log('\n[TEST 4] ADD_CHILD: Thêm badge vào trong "nav-links-001"');
{
  const result = applyModification(mockLayout, {
    type: AI_ACTION.ADD_CHILD,
    targetId: 'nav-links-001',
    newNode: { id: 'btn-hire', type: 'button', props: { label: 'Hire Me', href: '#contact', variant: 'primary' }, children: [] },
  });
  const flexNode = findById(result, 'nav-links-001');
  assert(flexNode?.children.length === 3, '"nav-links-001" có 3 children (thêm 1)');
  const newBtn = flexNode?.children.find((c: any) => c.type === 'button');
  assert(newBtn?.props.label === 'Hire Me', 'Button "Hire Me" được thêm vào cuối');
}

// TEST 5: ADD_BEFORE — thêm section trước "hero-001"
console.log('\n[TEST 5] ADD_BEFORE: Thêm section mới TRƯỚC "hero-001"');
{
  const newSection = { id: 'banner-001', type: 'container', props: { backgroundColor: '#222' }, children: [] };
  const result = applyModification(mockLayout, {
    type: AI_ACTION.ADD_BEFORE,
    targetId: 'hero-001',
    newNode: newSection,
  });
  assert(result.length === 4, 'Top-level count tăng từ 3 → 4');
  const idx = result.findIndex((s: any) => s.id === 'banner-001');
  const heroIdx = result.findIndex((s: any) => s.id === 'hero-001');
  assert(idx === heroIdx - 1, '"banner-001" nằm ngay TRƯỚC "hero-001"');
}

// TEST 6: ADD_AFTER — thêm section sau "hero-001"
console.log('\n[TEST 6] ADD_AFTER: Thêm section mới SAU "hero-001"');
{
  const newSection = { id: 'skills-001', type: 'container', props: { backgroundColor: '#333' }, children: [] };
  const result = applyModification(mockLayout, {
    type: AI_ACTION.ADD_AFTER,
    targetId: 'hero-001',
    newNode: newSection,
  });
  assert(result.length === 4, 'Top-level count tăng từ 3 → 4');
  const heroIdx = result.findIndex((s: any) => s.id === 'hero-001');
  const skillsIdx = result.findIndex((s: any) => s.id === 'skills-001');
  assert(skillsIdx === heroIdx + 1, '"skills-001" nằm ngay SAU "hero-001"');
}

// TEST 7: Nhiều modification cùng lúc — pipeline
console.log('\n[TEST 7] applyModifications (pipeline): Xoá footer + Đổi heading + Thêm badge');
{
  const result = applyModifications(mockLayout, [
    { type: AI_ACTION.DELETE, targetId: 'footer-001' },
    {
      type: AI_ACTION.UPDATE,
      targetId: 'hero-heading-001',
      newNode: { id: 'hero-heading-001', type: 'heading', props: { text: 'Pipeline Works!', level: 'h1' }, children: [] },
    },
    {
      type: AI_ACTION.ADD_CHILD,
      targetId: 'nav-links-001',
      newNode: { id: 'badge-new', type: 'badge', props: { text: 'React', variant: 'subtle', color: 'sky' }, children: [] },
    },
  ]);

  assert(result.length === 2, 'Sau xoá footer: còn 2 top-level sections');
  assert(!findById(result, 'footer-001'), 'footer-001 đã bị xoá');
  const heading = findById(result, 'hero-heading-001');
  assert(heading?.props.text === 'Pipeline Works!', 'Heading đã được update đúng');
  const flexNode = findById(result, 'nav-links-001');
  assert(flexNode?.children.length === 3, 'nav-links-001 có 3 children sau khi add badge');
}

// TEST 8: Immutability — dữ liệu gốc không bị thay đổi
console.log('\n[TEST 8] Immutability: Dữ liệu gốc không bị mutate');
{
  const originalCount = countNodes(mockLayout);
  applyModifications(mockLayout, [
    { type: AI_ACTION.DELETE, targetId: 'footer-001' },
    { type: AI_ACTION.DELETE, targetId: 'link-about' },
  ]);
  const afterCount = countNodes(mockLayout);
  assert(originalCount === afterCount, `Cây gốc vẫn có ${originalCount} nodes, không bị mutate`);
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
console.log(`Kết quả: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('🎉 Tất cả test PASS! Logic searchSection hoạt động chính xác.');
} else {
  console.log('⚠️  Có lỗi cần kiểm tra lại.');
  process.exit(1);
}
