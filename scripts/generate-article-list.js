const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUT_DIR = path.join(__dirname, '../.dumi/public');
const MAX_PER_CATEGORY = 10;

const CATEGORIES = [
  { key: 'flowpulse', dir: 'project/flowpulse', pathPrefix: '/project/flowpulse', title: '线脉 FlowPulse' },
  { key: 'haokang', dir: 'project/haokang', pathPrefix: '/project/haokang', title: '好慷在家' },
  { key: 'enterprise', dir: 'project/enterprise', pathPrefix: '/project/enterprise', title: '企业应用' },
  { key: 'ecommerce', dir: 'project/ecommerce', pathPrefix: '/project/ecommerce', title: '电商ERP' },
  { key: 'hechuang', dir: 'project/hechuang', pathPrefix: '/project/hechuang', title: '和创科技' },
  { key: 'ai', dir: 'tech/ai', pathPrefix: '/tech/ai', title: 'AI编程' },
  { key: 'dev', dir: 'tech/frontend', pathPrefix: '/tech/frontend', title: '前端开发' },
  { key: 'laravel', dir: 'tech/backend', pathPrefix: '/tech/backend', title: '后端开发' },
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

// ---------- 数字化架构子分类：自动写入 index.md 文章列表（按创建时间升序）----------
const GROUP_DIRS = [
  'digital-architecture/digital-strategy',
  'digital-architecture/togaf',
  'tech/ai',
];
const LIST_START = '<!-- ARTICLE_LIST_START -->';
const LIST_END = '<!-- ARTICLE_LIST_END -->';

function getBirthtime(fullPath) {
  try {
    const st = fs.statSync(fullPath);
    // birthtime 不可用时（部分 Linux）回退到 ctime
    const t = st.birthtimeMs || st.ctimeMs || st.mtimeMs || 0;
    return t;
  } catch {
    return 0;
  }
}

function generateGroupArticleList(groupDir) {
  const fullDir = path.join(DOCS_DIR, groupDir);
  const indexPath = path.join(fullDir, 'index.md');
  if (!fs.existsSync(fullDir) || !fs.existsSync(indexPath)) return;

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  const items = [];
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.md') || e.name === 'index.md') continue;
    const rel = path.join(groupDir, e.name);
    const fullPath = path.join(DOCS_DIR, rel);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const fm = extractFrontmatter(content);
    const title = fm.title || getFirstHeading(content) || path.basename(e.name, '.md');
    items.push({
      title,
      link: fileToRoute(rel),
      birth: getBirthtime(fullPath),
    });
  }
  items.sort((a, b) => a.birth - b.birth);

  const listMd =
    items.length === 0
      ? '_暂无文章_'
      : items.map((it) => `- [${it.title}](${it.link})`).join('\n');

  let indexContent = fs.readFileSync(indexPath, 'utf-8');
  if (!indexContent.includes(LIST_START) || !indexContent.includes(LIST_END)) {
    // 无标记时自动补上「文章列表」区块
    if (!indexContent.includes('## 文章列表')) {
      indexContent = indexContent.replace(/\s*$/, '') + `\n\n## 文章列表\n\n${LIST_START}\n${LIST_END}\n`;
    } else {
      indexContent = indexContent.replace(
        /(## 文章列表\n)([\s\S]*)$/,
        `$1\n${LIST_START}\n${LIST_END}\n`,
      );
    }
  }

  const next = indexContent.replace(
    new RegExp(`${LIST_START}[\\s\\S]*?${LIST_END}`),
    `${LIST_START}\n${listMd}\n${LIST_END}`,
  );
  fs.writeFileSync(indexPath, next, 'utf-8');
  console.log(`Updated ${groupDir}/index.md (${items.length} articles)`);
}

for (const groupDir of GROUP_DIRS) {
  generateGroupArticleList(groupDir);
}
