// Static builder for the Leafpost guides (English and Spanish).
// Each file in _build/guides/ (en) or _build/guides-es/ (es) starts with a JSON
// header in an HTML comment (<!--{...}-->) followed by the article body.
// A Spanish guide may set "alt" to the slug of its English version; the
// English side is linked back automatically (hreflang). It also builds the Pro
// waitlist pages (pro/ and es/pro/). Run: node _build/build.mjs
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

// Pro waitlist. The extension's "Soon" buttons open pro/?f=<feature>&from=<place>&v=<version>;
// GA counts each arrival as a door_<feature> event. Sign-ups go to a Google Form owned by
// leafpost.dev@gmail.com ("Leafpost Pro waitlist", created 2026-10-27): `action` is its
// formResponse URL and `entry` maps our fields to its entry ids. Without them the page refuses to submit.
const FORM = {
  action: 'https://docs.google.com/forms/d/e/1FAIpQLScdXcUCX0gxzC544GPy_v9pci35rMe7un0DrUK7RWMeKzT53w/formResponse',
  entry: { email: 'entry.791917642', features: 'entry.75689870', comment: 'entry.1451580480', source: 'entry.1357422267' },
};
// Not built yet. Keep the ids in sync with extension/lib/doors.js.
const FEATURES = [
  {
    id: 'translate',
    en: ['Translate before sending', 'Read any article in your language: Leafpost translates it in your browser and sends the translated e-book.'],
    es: ['Traducir antes de enviar', 'Lee cualquier artículo en tu idioma: Leafpost lo traduce en tu navegador y envía el libro ya traducido.'],
  },
  {
    id: 'pocket',
    en: ['Import from Pocket or Instapaper', 'Bring the articles you saved there into your Leafpost reading list in one go.'],
    es: ['Importar desde Pocket o Instapaper', 'Trae de una vez a tu lista de lectura los artículos que guardaste allí.'],
  },
  {
    id: 'rss',
    en: ['Blogs and RSS feeds in your digest', 'Follow your favorite blogs and get their new posts on your Kindle with your daily or weekly digest.'],
    es: ['Blogs y feeds RSS en tu resumen', 'Sigue tus blogs favoritos y recibe sus entradas nuevas en el Kindle con tu resumen diario o semanal.'],
  },
  {
    id: 'notion',
    en: ['Highlights synced to Notion or Obsidian', 'New Kindle highlights show up in Notion or your Obsidian vault on their own, without exporting by hand.'],
    es: ['Subrayados sincronizados con Notion u Obsidian', 'Tus subrayados nuevos del Kindle aparecen solos en Notion o en Obsidian, sin exportarlos a mano.'],
  },
  {
    id: 'newsletters',
    en: ['Newsletters straight to your Kindle', 'Substack and email newsletters delivered to your Kindle as a weekly magazine.'],
    es: ['Newsletters directamente en tu Kindle', 'Las newsletters de Substack y del correo, en tu Kindle como una revista semanal.'],
  },
  {
    id: 'phone',
    en: ['Send from your phone', "Share an article from your phone's browser and find it on your Kindle."],
    es: ['Enviar desde el móvil', 'Comparte un artículo desde el navegador del móvil y encuéntralo en tu Kindle.'],
  },
];

const T = {
  en: {
    locale: 'en-US',
    guides: 'Guides',
    index: 'guides/',
    ctaTitle: 'Send any article to your Kindle in one click',
    ctaText: "Leafpost is our free extension for Chrome and Edge: it turns web pages, selections and PDFs into clean e-books with images, a cover and a table of contents, and delivers them through Amazon's own Send to Kindle service.",
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
    pro: 'pro/',
    proTitle: 'Leafpost Pro waitlist: vote for what we build next',
    proDescription: 'Pick the Leafpost features you want next and join the waitlist for Leafpost Pro.',
    proH1: 'What should Leafpost build next?',
    proLead: 'Leafpost Pro launches in spring 2027. Until then, everything in it today (reading list, daily digest, all tabs as one book and highlights export) is free. The features below are not built yet: pick the ones you want and we will build the most requested first.',
    proPick: 'Which ones would you use?',
    proSoon: 'Not built yet',
    proComment: 'Anything else you wish Leafpost did? (optional)',
    proEmail: 'Your email',
    proConsent: 'Email me when Leafpost Pro launches, with 50% off my first year. One or two emails, no spam, and I can ask to be removed at any time.',
    proButton: 'Join the waitlist',
    proSmall: 'Your email and choices are stored in Google Forms and used only for these launch emails.',
    proThanks: "You're on the list, thank you! We'll write once Pro is ready, and the most requested features go first.",
    proError: "That didn't go through. Please try again in a moment, or write to leafpost.dev@gmail.com.",
    proPickOne: 'Pick at least one feature, or tell us what you would like.',
  },
  es: {
    locale: 'es-ES',
    guides: 'Guías',
    index: 'es/guias/',
    ctaTitle: 'Envía cualquier artículo a tu Kindle con un clic',
    ctaText: 'Leafpost es nuestra extensión gratuita para Chrome y Edge: convierte páginas web, selecciones y PDFs en libros electrónicos limpios, con imágenes, portada e índice, y los envía con el servicio oficial Send to Kindle de Amazon.',
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
    pro: 'es/pro/',
    proTitle: 'Lista de espera de Leafpost Pro: vota qué hacemos después',
    proDescription: 'Elige las próximas funciones de Leafpost y apúntate a la lista de espera de Leafpost Pro.',
    proH1: '¿Qué debería hacer Leafpost a continuación?',
    proLead: 'Leafpost Pro sale en la primavera de 2027. Hasta entonces, todo lo que incluye hoy (lista de lectura, resumen diario, todas las pestañas en un libro y exportar subrayados) es gratis. Las funciones de abajo aún no existen: elige las que quieras y haremos primero las más pedidas.',
    proPick: '¿Cuáles usarías?',
    proSoon: 'Aún no existe',
    proComment: '¿Algo más que te gustaría que hiciera Leafpost? (opcional)',
    proEmail: 'Tu correo',
    proConsent: 'Avísame por correo cuando salga Leafpost Pro, con un 50 % de descuento el primer año. Uno o dos correos, sin spam, y puedo pedir que me borréis cuando quiera.',
    proButton: 'Apuntarme a la lista',
    proSmall: 'Tu correo y lo que elijas se guardan en Google Forms y solo se usan para estos avisos.',
    proThanks: '¡Ya estás en la lista, gracias! Te escribiremos cuando Pro esté listo, y lo más pedido irá primero.',
    proError: 'No se ha podido enviar. Inténtalo de nuevo en un momento o escribe a leafpost.dev@gmail.com.',
    proPickOne: 'Elige al menos una función o cuéntanos qué te gustaría.',
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

function head({ lang, title, description, url, type = 'article', jsonLd = [], alternates = null, robots = '', ads = true }) {
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
${robots ? `<meta name="robots" content="${robots}" />\n` : ''}${hreflang}
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
${ads ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}" crossorigin="anonymous"></script>\n` : ''}</head>`;
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

// The waitlist is noindex and stays out of the sitemap: it is a form, not content.
function renderWaitlist(lang) {
  const t = T[lang];
  const other = lang === 'en' ? 'es' : 'en';
  const url = `${BASE}${t.pro}`;
  const config = {
    form: FORM,
    ids: FEATURES.map((f) => f.id),
    error: t.proError,
    pickOne: t.proPickOne,
  };
  return `${head({ lang, title: t.proTitle, description: t.proDescription, url, type: 'website', robots: 'noindex', ads: false, alternates: { [lang]: url, [other]: `${BASE}${T[other].pro}`, en: `${BASE}${T.en.pro}` } })}
<body>
${header(lang, `${BASE}${T[other].pro}`)}
<main class="guide">
  <h1>${t.proH1}</h1>
  <p class="lead">${t.proLead}</p>
  <form id="waitlist" class="waitlist">
    <fieldset>
      <legend>${t.proPick}</legend>
      ${FEATURES.map((f) => `<label class="feature"><input type="checkbox" name="feature" value="${f.id}" /><span><strong>${esc(f[lang][0])}</strong> <em>${t.proSoon}</em><br />${esc(f[lang][1])}</span></label>`).join('\n      ')}
    </fieldset>
    <label class="field"><span>${t.proComment}</span><textarea name="comment" rows="3" maxlength="1000"></textarea></label>
    <label class="field"><span>${t.proEmail}</span><input type="email" name="email" required autocomplete="email" maxlength="200" /></label>
    <label class="consent"><input type="checkbox" name="consent" required /><span>${t.proConsent}</span></label>
    <button class="btn" type="submit">${t.proButton}</button>
    <p class="form-msg" role="alert" hidden></p>
    <p class="small-print">${t.proSmall} <a href="${BASE}privacy.html">${t.privacy}</a>.</p>
  </form>
  <p id="thanks" class="answer" role="status" hidden>${t.proThanks}</p>
  ${ctaBox(lang, 'end')}
</main>
${footer(lang)}
<script>
(function () {
  var C = ${JSON.stringify(config)};
  var q = new URLSearchParams(location.search);
  var door = C.ids.indexOf(q.get('f')) >= 0 ? q.get('f') : '';
  var from = (q.get('from') || 'web').replace(/[^a-z]/g, '').slice(0, 12);
  var version = (q.get('v') || '').replace(/[^0-9.]/g, '').slice(0, 12);
  var form = document.getElementById('waitlist');
  var msg = form.querySelector('.form-msg');
  var box = function (id) { return form.querySelector('input[value="' + id + '"]'); };
  if (door) {
    box(door).checked = true;
    gtag('event', 'door_' + door, { door_from: from });
  }
  function fail(text) {
    msg.textContent = text;
    msg.hidden = false;
    form.querySelector('button').disabled = false;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var picked = C.ids.filter(function (id) { return box(id).checked; });
    var comment = form.elements.comment.value.trim();
    if (!picked.length && !comment) return fail(C.pickOne);
    if (!C.form.action) return fail(C.error);
    var body = new URLSearchParams();
    body.append(C.form.entry.email, form.elements.email.value.trim());
    body.append(C.form.entry.features, picked.join(', '));
    body.append(C.form.entry.comment, comment);
    body.append(C.form.entry.source, [from, document.documentElement.lang, version && 'v' + version, door && 'door=' + door].filter(Boolean).join(' | '));
    form.querySelector('button').disabled = true;
    msg.hidden = true;
    // Google Forms sends no CORS headers: the response is opaque, so a resolved request counts as sent.
    fetch(C.form.action, { method: 'POST', mode: 'no-cors', body: body }).then(function () {
      gtag('event', 'waitlist_signup', { door_from: from });
      picked.forEach(function (id) { gtag('event', 'want_' + id); });
      form.hidden = true;
      document.getElementById('thanks').hidden = false;
    }, function () { fail(C.error); });
  });
})();
</script>
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
    { loc: `${BASE}privacy.html`, lastmod: '2026-10-27' },
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
for (const lang of ['en', 'es']) {
  mkdirSync(join(ROOT, T[lang].pro), { recursive: true });
  writeFileSync(join(ROOT, T[lang].pro, 'index.html'), renderWaitlist(lang));
}
writeFileSync(join(ROOT, 'sitemap.xml'), renderSitemap(all));
console.log(`${en.length} English + ${es.length} Spanish guides built, plus the Pro waitlist`);
if (!FORM.action) console.warn('Waitlist: FORM.action is empty, so sign-ups are refused until the Google Form is connected.');
