// Static builder for the Leafpost guides.
// Each file in _build/guides/ starts with a JSON header in an HTML comment
// (<!--{...}-->) followed by the article body. Run: node _build/build.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://tubetools.online/leafpost/';
// Set to the Chrome Web Store URL once the extension is approved.
const STORE_URL = 'https://chromewebstore.google.com/detail/gdjfpgiobcbhkegfbkdhkneocjfdakad';
const ADSENSE = 'ca-pub-8621886093597255';
const GA = 'G-MKM07L3RLR';
const EEA = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function loadGuides() {
  const dir = join(ROOT, '_build', 'guides');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => {
      const src = readFileSync(join(dir, f), 'utf8');
      const m = src.match(/^<!--([\s\S]*?)-->\s*/);
      if (!m) throw new Error(`${f}: missing JSON header`);
      return { ...JSON.parse(m[1]), body: src.slice(m[0].length) };
    })
    .sort((a, b) => a.order - b.order);
}

function ctaBox(variant = 'inline') {
  const action = STORE_URL
    ? `<a class="btn" href="${STORE_URL}" rel="noopener">Add Leafpost to Chrome — free</a>`
    : `<a class="btn" href="${BASE}">Coming soon to the Chrome Web Store</a>`;
  return `<aside class="cta ${variant}">
  <img src="${BASE}icon128.png" alt="" width="48" height="48" loading="lazy" />
  <div>
    <p class="cta-title">Send any article to your Kindle in one click</p>
    <p>Leafpost is our free Chrome extension: it turns web pages, selections and PDFs into clean e-books with images, a cover and a table of contents, and delivers them through Amazon's own Send to Kindle service.</p>
    ${action}
  </div>
</aside>`;
}

function head({ title, description, url, type = 'article', jsonLd = [] }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="${type}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${BASE}img/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="${BASE}icon128.png" />
<link rel="stylesheet" href="${BASE}style.css" />
<link rel="stylesheet" href="${BASE}guides.css" />
${jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:${JSON.stringify(EEA)},wait_for_update:500});gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});gtag('js',new Date());gtag('config','${GA}');addEventListener('load',function(){setTimeout(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA}';document.head.appendChild(s);},1200);});</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}" crossorigin="anonymous"></script>
</head>`;
}

const header = `<header class="top"><nav class="nav">
  <a href="${BASE}" class="logo"><img src="${BASE}icon128.png" alt="" width="28" height="28" />Leafpost</a>
  <a href="${BASE}guides/">Guides</a>
</nav></header>`;

const footer = `<footer class="site">
  <p><a href="${BASE}">Leafpost</a> · <a href="${BASE}guides/">Guides</a> · <a href="${BASE}privacy.html">Privacy policy</a></p>
  <p>Leafpost is not affiliated with Amazon. Kindle is a trademark of Amazon.com, Inc. or its affiliates.</p>
</footer>`;

function renderGuide(g, all) {
  const url = `${BASE}${g.slug}/`;
  const related = all.filter((o) => g.related?.includes(o.slug));
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: g.h1,
      description: g.description,
      datePublished: g.published,
      dateModified: g.updated || g.published,
      author: { '@type': 'Organization', name: 'Leafpost', url: BASE },
      publisher: { '@type': 'Organization', name: 'Leafpost', logo: { '@type': 'ImageObject', url: `${BASE}icon128.png` } },
      mainEntityOfPage: url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Leafpost', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE}guides/` },
        { '@type': 'ListItem', position: 3, name: g.short, item: url },
      ],
    },
  ];
  const body = g.body.replace('<!--CTA-->', ctaBox('inline'));
  const updated = new Date(g.updated || g.published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `${head({ title: g.title, description: g.description, url, jsonLd })}
<body>
${header}
<main class="guide">
  <nav class="crumbs"><a href="${BASE}guides/">Guides</a> › ${esc(g.short)}</nav>
  <article>
    <h1>${esc(g.h1)}</h1>
    <p class="byline">Updated ${updated} · ${g.minutes} min read</p>
    ${body}
  </article>
  ${ctaBox('end')}
  ${related.length ? `<section class="related"><h2>Related guides</h2><ul>${related.map((o) => `<li><a href="${BASE}${o.slug}/">${esc(o.h1)}</a></li>`).join('')}</ul></section>` : ''}
  <p class="disclosure">Leafpost is made by the team behind this site. We recommend it where it genuinely solves the problem, and we list other options too.</p>
</main>
${footer}
</body>
</html>
`;
}

function renderIndex(all) {
  const url = `${BASE}guides/`;
  const title = 'Kindle Guides: Send Articles, PDFs and Highlights — Leafpost';
  const description = 'Practical guides to sending web articles and PDFs to Kindle, fixing Send to Kindle errors, finding your Kindle email and exporting highlights.';
  return `${head({ title, description, url, type: 'website' })}
<body>
${header}
<main class="guide">
  <h1>Kindle guides</h1>
  <p class="lead">Step-by-step answers to the most common questions about getting things onto your Kindle, and back out of it.</p>
  <ul class="guide-list">
    ${all.map((g) => `<li><a href="${BASE}${g.slug}/"><strong>${esc(g.h1)}</strong><span>${esc(g.description)}</span></a></li>`).join('\n    ')}
  </ul>
  ${ctaBox('end')}
</main>
${footer}
</body>
</html>
`;
}

function renderSitemap(all) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: BASE, lastmod: today },
    { loc: `${BASE}guides/`, lastmod: today },
    ...all.map((g) => ({ loc: `${BASE}${g.slug}/`, lastmod: g.updated || g.published })),
    { loc: `${BASE}privacy.html`, lastmod: '2026-10-14' },
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`;
}

const guides = loadGuides();
for (const g of guides) {
  mkdirSync(join(ROOT, g.slug), { recursive: true });
  writeFileSync(join(ROOT, g.slug, 'index.html'), renderGuide(g, guides));
}
mkdirSync(join(ROOT, 'guides'), { recursive: true });
writeFileSync(join(ROOT, 'guides', 'index.html'), renderIndex(guides));
writeFileSync(join(ROOT, 'sitemap.xml'), renderSitemap(guides));
console.log(`${guides.length} guides built`);
