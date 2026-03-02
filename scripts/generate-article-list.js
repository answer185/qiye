const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUT_DIR = path.join(__dirname, '../.dumi/public');
const MAX_PER_CATEGORY = 10;

const CATEGORIES = [
  { key: 'erp', dir: 'project/erp', pathPrefix: '/project/erp', title: '鞋材ERP' },
  { key: 'enterprise', dir: 'project/enterprise', pathPrefix: '/project/enterprise', title: '企业应用' },
  { key: 'ecommerce', dir: 'project/ecommerce', pathPrefix: '/project/ecommerce', title: '电商应用' },
  { key: 'dev', dir: 'tech/frontend', pathPrefix: '/tech/frontend', title: '前端开发' },
  { key: 'laravel', dir: 'tech/backend', pathPrefix: '/tech/backend', title: '后端开发' },
  { key: 'ai', dir: 'tech/ai', pathPrefix: '/tech/ai', title: 'AI编程' },
  { key: 'ops', dir: 'tech/ops', pathPrefix: '/tech/ops', title: '运维' },
];

function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};
  let titleMatch = yaml.match(/^title:\s*['"]?([^'"\n]+)['"]?/m);
  if (titleMatch) result.title = titleMatch[1].trim();
  let dateMatch = yaml.match(/^date:\s*['"]?([^'"\n]+)['"]?/m);
  if (dateMatch) result.date = dateMatch[1].trim();
  return result;
}

function getFirstHeading(content) {
  const withoutFm = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, '');
  const m = withoutFm.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function collectFiles(dir) {
  const fullDir = path.join(DOCS_DIR, dir);
  if (!fs.existsSync(fullDir)) return [];
  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const relPath = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'imgs') {
      files.push(...collectFiles(relPath));
    } else if (e.isFile() && e.name.endsWith('.md')) {
      files.push(relPath);
    }
  }
  return files;
}

function fileToRoute(relPath) {
  const withoutExt = relPath.replace(/\.md$/, '');
  const segs = withoutExt.split(path.sep).filter(Boolean);
  if (segs[segs.length - 1] === 'index') segs.pop();
  return '/' + segs.join('/');
}

function getMtime(fullPath) {
  try {
    return fs.statSync(fullPath).mtime.getTime();
  } catch {
    return 0;
  }
}

const result = {};

for (const cat of CATEGORIES) {
  const files = collectFiles(cat.dir);
  const items = [];
  for (const rel of files) {
    const fullPath = path.join(DOCS_DIR, rel);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const fm = extractFrontmatter(content);
    const title = fm.title || getFirstHeading(content) || path.basename(rel, '.md');
    const route = fileToRoute(rel);
    const date = fm.date ? new Date(fm.date).getTime() : getMtime(fullPath);
    items.push({ title, link: route, date });
  }
  items.sort((a, b) => b.date - a.date);
  const list = items.slice(0, MAX_PER_CATEGORY);
  result[cat.key] = { title: cat.title, list };
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'article-list.json'), JSON.stringify(result, null, 2), 'utf-8');
console.log('Generated .dumi/public/article-list.json');
