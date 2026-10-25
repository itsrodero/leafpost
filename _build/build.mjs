// Static builder for the Leafpost guides (English and Spanish).
// Each file in _build/guides/ (en) or _build/guides-es/ (es) starts with a JSON
// header in an HTML comment (<!--{...}-->) followed by the article body.
// A Spanish guide may set "alt" to the slug of its English version; the
// English side is linked back automatically (hreflang). Run: node _build/build.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://tubetools.online/leafpost/';
const STORE_URL = 'https://chromewebstore.google.com/detail/gdjfpgiobcbhkegfbkdhkneocjfdakad';
const EDGE_URL = 'https://microsoftedge.microsoft.com/addons/detail/fkceidjlbbfolmbigajdhjafigkamddb';
const ADSENSE = 'ca-pub-8621886093597255';
const GA = 'G-MKM07L3RLR';
const EEA = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'];

const T = {
  en: {
    locale: 'en-US',
    guides: 'Guides',
    index: 'guides/',
    ctaTitle: 'Send any article to your Kindle in one click',
    ctaText: "Leafpost is our free Chrome extension: it turns web pages, selections and PDFs into clean e-books with images, a cover and a table of contents, and delivers them through Amazon's own Send to Kindle service.",
    ctaButton: 'Add Leafpost to Chrome — free',
    ctaEdge: 'Using Microsoft Edge? Get Leafpost from Edge Add-ons',
    updated: 'Updated',
    minRead: 'min read',
    related: 'Related guides',
    disclosure: 'Leafpost is made by the team behind this site. We recommend it where it genuinely solves the problem, and we list other options too.',
    privacy: 'Privacy policy',
    trademark: 'Leafpost is not affiliated with Amazon. Kindle is a trademark of Amazon.com, Inc. or its affiliates.',
    otherLang: 'Español',
    indexTitle: 'Kindle Guides: Send Articles, PDFs and Highlights — Leafpost',
    indexDescription: 'Practical guides to sending web articles and PDFs to Kindle, fixing Send to Kindle errors, finding your Kindle email and exporting highlights.',
    indexH1: 'Kindle guides',
    indexLead: 'Step-by-step answers to the most common questions about getting things onto your Kindle, and back out of it.',
  },
  es: {
    locale: 'es-ES',
    guides: 'Guías',
    index: 'es/guias/',
    ctaTitle: 'Envía cualquier artículo a tu Kindle con un clic',
    ctaText: 'Leafpost es nuestra extensión gratuita para Chrome: convierte páginas web, selecciones y PDFs en libros electrónicos limpios, con imágenes, portada e índice, y los envía con el servicio oficial Send to Kindle de Amazon.',
    ctaButton: 'Añadir Leafpost a Chrome — gratis',
    ctaEdge: '¿Usas Microsoft Edge? Descarga Leafpost en Edge Add-ons',
    updated: 'Actualizado el',
    minRead: 'min de lectura',
    related: 'Guías relacionadas',
    disclosure: 'Leafpost lo hace el mismo equipo que esta web. Lo recomendamos cuando de verdad resuelve el problema, y también explicamos otras opciones.',
    privacy: 'Política de privacidad',
    trademark: 'Leafpost no está afiliado a Amazon. Kindle es una marca de Amazon.com, Inc. o sus filiales.',
    otherLang: 'English',
    indexTitle: 'Guías de Kindle: enviar libros, PDFs y artículos — Leafpost',
    indexDescription: 'Guías prácticas para pasar libros, EPUB, PDFs y artículos a tu Kindle, configurar el correo de Kindle y solucionar errores de Send to Kindle.',
    indexH1: 'Guías de Kindle',
    indexLead: 'Respuestas paso a paso a las dudas más habituales para meter cosas en tu Kindle, y para sacarlas.',
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function loadGuides(folder, lang) {
  const dir = join(ROOT, '_build', folder);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => {
      const src = readFileSync(join(dir, f), 'utf8');
      const m = src.match(/^<!--([\s\S]*?)-->\s*/);
      if (!m) throw new Error(`${folder}/${f}: missing JSON header`);
      return { lang, ...JSON.parse(m[1]), body: src.slice(m[0].length) };
    })
    .sort((a, b) => a.order - b.order);
}

function ctaBox(lang, variant = 'inline') {
  const t = T[lang];
  return `<aside class="cta ${variant}">
  <img src="${BASE}icon128.png" alt="" width="48" height="48" loading="lazy" />
  <div>
    <p class="cta-title">${t.ctaTitle}</p>
    <p>${t.ctaText}</p>
    <a class="btn" href="${STORE_URL}" rel="noopener">${t.ctaButton}</a>
    <p class="alt-store"><a href="${EDGE_URL}" rel="noopener">${t.ctaEdge}</a></p>
  </div>
</aside>`;
}

function head({ lang, title, description, url, type = 'article', jsonLd = [], alternates = null }) {
  const hreflang = alternates
    ? Object.entries(alternates)
        .map(([l, u]) => `<link rel="alternate" hreflang="${l}" href="${u}" />`)
        .concat(`<link rel="alternate" hreflang="x-default" href="${alternates.en}" />`)
        .join('\n')
    : '';
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${url}" />
${hreflang}
<meta property="og:type" content="${type}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${BASE}img/og.png" />
<meta property="og:locale" content="${T[lang].locale.replace('-', '_')}" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="${BASE}icon128.png" />
<link rel="stylesheet" href="${BASE}style.css" />
<link rel="stylesheet" href="${BASE}guides.css" />
${jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:${JSON.stringify(EEA)},wait_for_update:500});gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});gtag('js',new Date());gtag('config','${GA}');addEventListener('load',function(){setTimeout(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA}';document.head.appendChild(s);},1200);});</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}" crossorigin="anonymous"></script>
</head>`;
}

function header(lang, otherUrl) {
  const t = T[lang];
  const other = lang === 'en' ? 'es' : 'en';
  return `<header class="top"><nav class="nav">
  <a href="${BASE}" class="logo"><img src="${BASE}icon128.png" alt="" width="28" height="28" />Leafpost</a>
  <a href="${BASE}${t.index}">${t.guides}</a>
  <a href="${otherUrl || BASE + T[other].index}" hreflang="${other}" lang="${other}">${t.otherLang}</a>
</nav></header>`;
}

function footer(lang) {
  const t = T[lang];
  return `<footer class="site">
  <p><a href="${BASE}">Leafpost</a> · <a href="${BASE}${t.index}">${t.guides}</a> · <a href="${BASE}privacy.html">${t.privacy}</a></p>
  <p>${t.trademark}</p>
</footer>`;
}

const urlOf = (g) => `${BASE}${g.slug}/`;

function renderGuide(g, all) {
  const t = T[g.lang];
  const url = urlOf(g);
  const sameLang = all.filter((o) => o.lang === g.lang);
  const related = sameLang.filter((o) => g.related?.includes(o.slug));
  const alt = g.alt ? all.find((o) => o.slug === g.alt) : null;
  const alternates = alt ? { [g.lang]: url, [alt.lang]: urlOf(alt) } : null;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: g.h1,
      description: g.description,
      inLanguage: g.lang,
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
        { '@type': 'ListItem', position: 2, name: t.guides, item: `${BASE}${t.index}` },
        { '@type': 'ListItem', position: 3, name: g.short, item: url },
      ],
    },
  ];
  const body = g.body.replace('<!--CTA-->', ctaBox(g.lang, 'inline'));
  const updated = new Date(g.updated || g.published).toLocaleDateString(t.locale, { year: 'numeric', month: 'long', day: 'numeric' });
  return `${head({ lang: g.lang, title: g.title, description: g.description, url, jsonLd, alternates })}
<body>
${header(g.lang, alt ? urlOf(alt) : null)}
<main class="guide">
  <nav class="crumbs"><a href="${BASE}${t.index}">${t.guides}</a> › ${esc(g.short)}</nav>
  <article>
    <h1>${esc(g.h1)}</h1>
    <p class="byline">${t.updated} ${updated} · ${g.minutes} ${t.minRead}</p>
    ${body}
  </article>
  ${ctaBox(g.lang, 'end')}
  ${related.length ? `<section class="related"><h2>${t.related}</h2><ul>${related.map((o) => `<li><a href="${urlOf(o)}">${esc(o.h1)}</a></li>`).join('')}</ul></section>` : ''}
  <p class="disclosure">${t.disclosure}</p>
</main>
${footer(g.lang)}
</body>
</html>
`;
}

function renderIndex(lang, guides) {
  const t = T[lang];
  const other = lang === 'en' ? 'es' : 'en';
  const url = `${BASE}${t.index}`;
  return `${head({ lang, title: t.indexTitle, description: t.indexDescription, url, type: 'website', alternates: { [lang]: url, [other]: `${BASE}${T[other].index}`, en: `${BASE}${T.en.index}` } })}
<body>
${header(lang, `${BASE}${T[other].index}`)}
<main class="guide">
  <h1>${t.indexH1}</h1>
  <p class="lead">${t.indexLead}</p>
  <ul class="guide-list">
    ${guides.map((g) => `<li><a href="${urlOf(g)}"><strong>${esc(g.h1)}</strong><span>${esc(g.description)}</span></a></li>`).join('\n    ')}
  </ul>
  ${ctaBox(lang, 'end')}
</main>
${footer(lang)}
</body>
</html>
`;
}

function renderSitemap(all) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: BASE, lastmod: today },
    { loc: `${BASE}${T.en.index}`, lastmod: today },
    { loc: `${BASE}${T.es.index}`, lastmod: today },
    ...all.map((g) => ({ loc: urlOf(g), lastmod: g.updated || g.published })),
    { loc: `${BASE}privacy.html`, lastmod: '2026-10-14' },
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`;
}

const en = loadGuides('guides', 'en');
const es = loadGuides('guides-es', 'es');
// Link English guides back to their Spanish versions.
for (const g of es) {
  if (!g.alt) continue;
  const target = en.find((o) => o.slug === g.alt);
  if (!target) throw new Error(`${g.slug}: alt "${g.alt}" not found`);
  target.alt = g.slug;
}
const all = [...en, ...es];
for (const g of all) {
  mkdirSync(join(ROOT, g.slug), { recursive: true });
  writeFileSync(join(ROOT, g.slug, 'index.html'), renderGuide(g, all));
}
for (const [lang, list] of [['en', en], ['es', es]]) {
  mkdirSync(join(ROOT, T[lang].index), { recursive: true });
  writeFileSync(join(ROOT, T[lang].index, 'index.html'), renderIndex(lang, list));
}
writeFileSync(join(ROOT, 'sitemap.xml'), renderSitemap(all));
console.log(`${en.length} English + ${es.length} Spanish guides built`);
