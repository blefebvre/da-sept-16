/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards.
 * Source: https://www.alc.ca/content/alc/en.html
 * Instance selector: .cmp-container--hide-column-gutters
 *
 * Source structure (validated against live DOM + block-context/source.html):
 *   .reference.parbase > .cq-dd-paragraph > div.cmp.cmp-image
 *     > div.impress[data-gtm-name?] > a[href] > picture
 *         > source[media="(min-width: 1200px)"][srcset] (imageD), ... , img[src][alt]
 * The sibling column holding the app-download .banner is ignored (removed by alc-cleanup too).
 *
 * Output (2 columns, one row per promo):
 *   cell 1: promo image (desktop rendition)
 *   cell 2: link to promo destination (the <a> wrapping the image)
 */
const ORIGIN = 'https://www.alc.ca';
const GENERIC_SEGMENTS = ['content', 'alc', 'en', 'fr', 'promos', 'referenced-content', 'external', 'sponsorships'];

function absUrl(url) {
  if (!url) return '';
  try { return new URL(url.trim(), ORIGIN).href; } catch (e) { return url; }
}

function titleCase(str) {
  return str.split(/[-_\s]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function labelFromHref(href) {
  try {
    const { pathname } = new URL(href, ORIGIN);
    const segs = pathname.replace(/\.html?$/i, '').split('/').filter(Boolean);
    const last = segs.pop() || '';
    const parent = segs.pop() || '';
    const parts = [];
    if (parent && !GENERIC_SEGMENTS.includes(parent.toLowerCase())) parts.push(parent);
    parts.push(last);
    return titleCase(parts.join(' '));
  } catch (e) {
    return '';
  }
}

function imageSrc(item) {
  const sources = [...item.querySelectorAll('picture source[srcset]')];
  const desktop = sources.find((s) => /1200/.test(s.getAttribute('media') || ''))
    || sources.find((s) => /imageD/i.test(s.getAttribute('srcset') || ''));
  if (desktop) return desktop.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0];
  const img = item.querySelector('img');
  return img ? img.getAttribute('src') : '';
}

export default function parse(element, { document }) {
  // Iterate the block-level .cmp-image wrappers (not the anchors).
  const items = [...element.querySelectorAll('.cmp-image')]
    .filter((el) => !el.closest('.banner, .alc-mobile-banner'));

  const cells = [];
  items.forEach((item) => {
    const src = imageSrc(item);
    const link = item.querySelector('a[href]');
    if (!src && !link) return;

    const href = link ? absUrl(link.getAttribute('href')) : '';
    const srcImg = item.querySelector('img');
    const rawAlt = (srcImg && srcImg.getAttribute('alt') || '').trim();
    const gtmEl = item.querySelector('[data-gtm-name]');
    const gtmName = gtmEl ? gtmEl.getAttribute('data-gtm-name') || '' : '';
    const isGenericAlt = !rawAlt || /^promo image$/i.test(rawAlt);
    const label = (!isGenericAlt && rawAlt) || labelFromHref(href) || gtmName.trim() || 'Learn more';

    let imageCell = '';
    if (src) {
      const img = document.createElement('img');
      img.src = absUrl(src);
      img.alt = isGenericAlt ? label : rawAlt;
      imageCell = img;
    }

    let linkCell = '';
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      p.append(a);
      linkCell = p;
    }

    cells.push([imageCell, linkCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
