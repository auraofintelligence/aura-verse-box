import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://auraofintelligence.github.io/aura-verse-box/';
const chapters = ['index', 'experience', 'personal-aura', 'community', 'trial', 'sources', 'sitemap'];
const errors = [];
const parsed = new Map();
const stats = { pages: 0, localLinks: 0, externalLinks: 0, documents: 0, artwork: 0 };
const fail = message => errors.push(message);
const assert = (condition, message) => { if (!condition) fail(message); };
const tokens = value => String(value || '').toLowerCase().split(/\s+/).filter(Boolean);
const hasClass = (node, name) => tokens(node.attrs.class).includes(name);
const decode = value => String(value).replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, key) => {
  if (key[0] === '#') {
    const number = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
    return number <= 0x10ffff ? String.fromCodePoint(number) : entity;
  }
  return ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[key.toLowerCase()] || entity;
});
const plain = value => decode(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const read = relative => {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) { fail(`Missing file: ${relative}`); return null; }
  return fs.readFileSync(absolute, 'utf8');
};

// A small HTML token reader keeps these checks dependency-free. It tracks scopes
// for semantic navigation checks rather than treating every link as a menu link.
function parse(relative) {
  if (parsed.has(relative)) return parsed.get(relative);
  const html = read(relative);
  if (html === null) return null;
  const nodes = [];
  const stack = [];
  const voids = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  for (const match of html.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^>]*>/g)) {
    const source = match[0];
    if (source.startsWith('<!')) continue;
    const name = source.match(/^<\/?([a-zA-Z][\w:-]*)/)?.[1].toLowerCase();
    if (!name) continue;
    if (source.startsWith('</')) {
      const at = stack.findLastIndex(node => node.name === name);
      if (at !== -1) {
        for (const node of stack.splice(at)) { node.close = match.index; node.end = match.index + source.length; }
      }
      continue;
    }
    const attrs = {};
    const body = source.slice(source.indexOf(name) + name.length, -1);
    for (const attribute of body.matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
      attrs[attribute[1].toLowerCase()] = decode(attribute[2] ?? attribute[3] ?? attribute[4] ?? '');
    }
    const node = { name, attrs, start: match.index, openEnd: match.index + source.length, close: html.length, end: html.length, parent: stack.at(-1) };
    nodes.push(node);
    if (!voids.has(name) && !source.endsWith('/>')) stack.push(node);
    else node.close = node.end = node.openEnd;
  }
  const ids = new Set();
  for (const node of nodes) {
    if (node.attrs.id) {
      assert(!ids.has(node.attrs.id), `${relative}: duplicate id #${node.attrs.id}`);
      ids.add(node.attrs.id);
    }
    if (node.name === 'a' && node.attrs.name) ids.add(node.attrs.name);
  }
  const result = { relative, html, nodes, ids };
  parsed.set(relative, result);
  return result;
}

function localDestination(raw, source) {
  if (!raw || /^(?:mailto|tel|data|blob):/i.test(raw)) return null;
  let url;
  try { url = new URL(raw, new URL(source, base)); }
  catch { fail(`${source}: malformed URL ${raw}`); return null; }
  if (!/^https?:$/.test(url.protocol)) {
    if (/^javascript:/i.test(raw)) fail(`${source}: javascript URL is not a usable navigation link`);
    return null;
  }
  if (!url.href.startsWith(base)) return null;
  let relative;
  try { relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)); }
  catch { fail(`${source}: invalid URL encoding ${raw}`); return null; }
  if (!relative || relative.endsWith('/')) relative += 'index.html';
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(root + path.sep)) { fail(`${source}: link escapes site root: ${raw}`); return null; }
  return { relative: relative.replaceAll('\\', '/'), absolute, hash: url.hash.slice(1) };
}

const descendants = (doc, node, name) => doc.nodes.filter(candidate => candidate.start > node.start && candidate.start < node.close && (!name || candidate.name === name));
const routeId = (href, source) => {
  const target = localDestination(href, source);
  return target && target.relative.endsWith('.html') ? path.basename(target.relative, '.html') : null;
};
const routeIds = (doc, node) => new Set(descendants(doc, node, 'a').map(link => routeId(link.attrs.href, doc.relative)).filter(Boolean));
const allChapterLinks = (doc, node, label) => {
  const linked = routeIds(doc, node);
  for (const id of chapters) assert(linked.has(id), `${doc.relative}: ${label} omits ${id}.html`);
};

for (const id of [...chapters, '404']) {
  const relative = `${id}.html`;
  const doc = parse(relative);
  if (!doc) continue;
  stats.pages++;
  const htmlNode = doc.nodes.find(node => node.name === 'html');
  assert(htmlNode?.attrs.lang === 'en-AU', `${relative}: expected lang="en-AU"`);
  const title = doc.nodes.find(node => node.name === 'title');
  assert(title && plain(doc.html.slice(title.openEnd, title.close)), `${relative}: missing page title`);
  const description = doc.nodes.find(node => node.name === 'meta' && node.attrs.name === 'description');
  assert(description?.attrs.content?.trim(), `${relative}: missing page description`);
  const canonical = doc.nodes.filter(node => node.name === 'link' && tokens(node.attrs.rel).includes('canonical'));
  assert(canonical.length === 1, `${relative}: expected exactly one canonical URL`);
  assert(canonical[0]?.attrs.href === base + (id === 'index' ? '' : relative), `${relative}: incorrect canonical URL`);
  assert(doc.nodes.some(node => node.name === 'link' && tokens(node.attrs.rel).includes('describedby') && localDestination(node.attrs.href, relative)?.relative === 'llms.txt'), `${relative}: missing llms.txt describedby link`);
  assert(!doc.html.includes('{{'), `${relative}: unresolved build placeholder`);

  for (const node of doc.nodes) {
    for (const attribute of ['href', 'src']) {
      if (!(attribute in node.attrs)) continue;
      const raw = node.attrs[attribute];
      const local = localDestination(raw, relative);
      if (local) {
        stats.localLinks++;
        assert(fs.existsSync(local.absolute) && fs.statSync(local.absolute).isFile(), `${relative}: missing local destination ${raw}`);
        if (local.hash && local.relative.endsWith('.html') && fs.existsSync(local.absolute)) {
          let hash;
          try { hash = decodeURIComponent(local.hash); }
          catch { fail(`${relative}: invalid anchor encoding ${raw}`); continue; }
          const target = parse(local.relative);
          assert(target?.ids.has(hash), `${relative}: missing anchor ${raw}`);
        }
      } else if (node.name === 'a' && attribute === 'href' && /^(?:https?:)?\/\//i.test(raw)) {
        stats.externalLinks++;
        const rel = tokens(node.attrs.rel);
        assert(node.attrs.target === '_blank' && rel.includes('noopener') && rel.includes('noreferrer'), `${relative}: external link needs target="_blank" and rel="noopener noreferrer": ${raw}`);
      }
    }
  }

  if (!chapters.includes(id)) continue;
  const primary = doc.nodes.find(node => node.name === 'nav' && (hasClass(node, 'primary') || /primary/i.test(node.attrs['aria-label'] || '')));
  assert(primary && routeIds(doc, primary).size > 0, `${relative}: missing primary navigation`);
  const menu = doc.nodes.find(node => node.name === 'nav' && (/all|every|pages|menu/i.test(node.attrs['aria-label'] || '') || node.parent?.name === 'details'));
  assert(menu, `${relative}: missing complete all-pages menu`);
  if (menu) allChapterLinks(doc, menu, 'all-pages menu');
  assert(doc.nodes.some(node => node.name === 'footer'), `${relative}: missing footer`);
  assert(doc.nodes.some(node => node.name === 'a' && node.attrs.href === '#top' && (node.attrs['aria-label'] || plain(doc.html.slice(node.openEnd, node.close)))), `${relative}: missing labelled return-to-top link`);
  const sequence = doc.nodes.find(node => node.name === 'nav' && (/previous.*next|next.*previous/i.test(node.attrs['aria-label'] || '') || ['chapter-route', 'page-sequence', 'prev-next'].some(name => hasClass(node, name))));
  assert(sequence, `${relative}: missing previous/next navigation`);
  if (sequence) {
    const routes = descendants(doc, sequence, 'a').map(node => routeId(node.attrs.href, relative)).filter(route => chapters.includes(route));
    const at = chapters.indexOf(id);
    assert(routes[0] === chapters[(at - 1 + chapters.length) % chapters.length], `${relative}: previous chapter is incorrect`);
    assert(routes.at(-1) === chapters[(at + 1) % chapters.length], `${relative}: next chapter is incorrect`);
  }
  const hero = doc.nodes.find(node => node.name === 'img' && (hasClass(node, 'hero-image') || hasClass(node, 'hero-img') || hasClass(node.parent || { attrs: {} }, 'hero')));
  assert(hero?.attrs.src && hero.attrs.alt?.trim(), `${relative}: missing hero image or descriptive alt text`);
  doc.hero = hero;
}

const sitemap = read('sitemap.xml');
if (sitemap !== null) {
  const urls = [...sitemap.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/g)].map(match => decode(match[1].trim()));
  const expected = chapters.map(id => base + (id === 'index' ? '' : `${id}.html`));
  assert(new Set(urls).size === urls.length, 'sitemap.xml: duplicate canonical entries');
  for (const url of expected) assert(urls.includes(url), `sitemap.xml: missing ${url}`);
  for (const url of urls) assert(expected.includes(url), `sitemap.xml: unexpected canonical ${url}`);
}
const sitemapPage = parsed.get('sitemap.html');
if (sitemapPage) allChapterLinks(sitemapPage, { start: -1, close: sitemapPage.html.length }, 'HTML sitemap');

function manifest(relative, key) {
  const text = read(relative);
  if (text === null) return [];
  try {
    const value = JSON.parse(text);
    const entries = Array.isArray(value) ? value : value[key];
    if (!Array.isArray(entries)) { fail(`${relative}: expected an array or .${key} array`); return []; }
    assert(entries.length > 0, `${relative}: empty manifest`);
    return entries;
  } catch (error) { fail(`${relative}: invalid JSON: ${error.message}`); return []; }
}

function verifyFile(entry, directory, manifestName) {
  const declared = entry.file || entry.path || entry.src || entry.filename;
  if (!declared || typeof declared !== 'string') { fail(`${manifestName}: missing local file/path/src/filename`); return null; }
  const options = [declared, path.posix.join(directory, declared)];
  const relative = options.find(option => fs.existsSync(path.join(root, option))) || declared;
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(root + path.sep)) { fail(`${manifestName}: path escapes repository: ${declared}`); return null; }
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) { fail(`${manifestName}: missing ${declared}`); return null; }
  const expected = entry.sha256 || entry.checksum?.sha256 || entry.hash;
  assert(typeof expected === 'string' && /^[a-f0-9]{64}$/i.test(expected), `${manifestName}: missing valid SHA-256 for ${declared}`);
  const buffer = fs.readFileSync(absolute);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  assert(hash === String(expected).toLowerCase(), `${manifestName}: SHA-256 mismatch for ${declared}`);
  if (typeof entry.bytes === 'number') assert(buffer.length === entry.bytes, `${manifestName}: byte length mismatch for ${declared}`);
  return { relative: relative.replaceAll('\\', '/'), hash };
}

for (const entry of manifest('content/documents.json', 'documents')) {
  if (verifyFile(entry, 'documents', 'content/documents.json')) stats.documents++;
}
const documentData = JSON.parse(fs.readFileSync(path.join(root, 'content/documents.json'), 'utf8'));
if (documentData.referenceImage) verifyFile(documentData.referenceImage, 'documents', 'content/documents.json reference image');
const artwork = manifest('content/artwork.json', 'images');
const heroFiles = new Set();
const heroHashes = new Set();
for (const id of chapters) {
  const entries = artwork.filter(entry => (entry.page || entry.id) === id);
  assert(entries.length === 1, `content/artwork.json: expected one hero record for ${id}`);
  if (!entries[0]) continue;
  const entry = entries[0];
  assert(entry.prompt?.trim() && entry.alt?.trim(), `content/artwork.json: ${id} lacks prompt or alt provenance`);
  const verified = verifyFile(entry, 'assets/images', 'content/artwork.json');
  if (!verified) continue;
  stats.artwork++;
  assert(!heroFiles.has(verified.relative) && !heroHashes.has(verified.hash), `${id}.html: hero is reused from another chapter`);
  heroFiles.add(verified.relative);
  heroHashes.add(verified.hash);
  const actual = localDestination(parsed.get(`${id}.html`)?.hero?.attrs.src, `${id}.html`);
  assert(actual?.relative === verified.relative, `${id}.html: hero does not match its artwork record`);
}

for (const relative of [...chapters.map(id => `${id}.html`), '404.html', 'sitemap.xml', 'llms.txt', 'robots.txt', '.github/repository.json', '.github/robots-root-snippet.txt']) {
  const text = read(relative);
  if (text !== null) assert(!/https:\/\/auraofintelligence\.github\.io\/verse-box(?:\/|[\s"'<>?#]|$)/.test(text), `${relative}: stale /verse-box/ canonical address`);
}
const llms = fs.existsSync(path.join(root, 'llms.txt')) ? fs.readFileSync(path.join(root, 'llms.txt'), 'utf8') : '';
for (const id of chapters) assert(llms.includes(base + (id === 'index' ? '' : `${id}.html`)), `llms.txt: missing ${id} discovery URL`);

if (errors.length) {
  process.stderr.write(`Site verification failed (${errors.length}):\n${errors.map(message => `- ${message}`).join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Site verification passed: ${stats.pages} pages, ${stats.localLinks} local destinations, ${stats.externalLinks} external links, ${stats.documents} document hashes, ${stats.artwork} unique hero hashes, navigation, anchors, metadata and discovery.\n`);
}
