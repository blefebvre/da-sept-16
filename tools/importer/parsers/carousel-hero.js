/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.alc.ca/content/alc/en.html
 * Instance selector: .carousel.list.parbase.hero
 *
 * Source structure (validated against live DOM + block-context/source.html):
 *   ul.slides > li.slide > div.fca-carousel-slide-promo > article[data-gtm-name]
 *     > a[href] > div.slide-content.picturefill-background[style=background-image]
 *       > span[data-media][data-src] x3 (imageM / imageT / imageD renditions)
 *
 * Output (2 columns, one row per slide):
 *   cell 1: slide image (desktop rendition, imageD)
 *   cell 2: link to slide destination; text = slide topic derived from the URL
 *           (all visible copy/CTA is baked into the image)
 */
const ORIGIN = 'https://www.alc.ca';
const GENERIC_SEGMENTS = ['content', 'alc', 'en', 'fr', 'promos', 'game-configurator', 'referenced-content', 'external'];

function absUrl(url) {
  if (!url) return '';
  try { return new URL(url.trim(), ORIGIN).href; } catch (e) { return url; }
}

function bgUrl(el) {
  if (!el) return '';
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image\s*:\s*url\(\s*(['"]|&quot;)?(.*?)\1?\s*\)/i);
  return m ? m[2] : '';
}

function titleCase(str) {
  return str.split(/[-_\s]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Readable label from the destination path, e.g.
// /content/alc/en/promos/proline/season-kick-off.html -> "Proline Season Kick Off"
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

// Pick the desktop rendition: span[data-media*="1200"] > span[data-src*="imageD"] > last span > inline background
function slideImageSrc(slide) {
  const content = slide.querySelector('.slide-content, .picturefill-background');
  const spans = [...slide.querySelectorAll('span[data-src]')];
  const desktop = spans.find((s) => /1200/.test(s.getAttribute('data-media') || ''))
    || spans.find((s) => /imageD/i.test(s.getAttribute('data-src') || ''))
    || spans[spans.length - 1];
  if (desktop) return desktop.getAttribute('data-src');
  const bg = bgUrl(content);
  if (bg) return bg;
  const img = slide.querySelector('img');
  return img ? img.getAttribute('src') : '';
}

export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('ul.slides > li')];
  if (!slides.length) slides = [...element.querySelectorAll('.fca-carousel-slide-promo article, article')];
  // Ignore any carousel clones
  slides = slides.filter((s) => !s.classList.contains('clone') && !s.classList.contains('slick-cloned'));

  const cells = [];
  slides.forEach((slide) => {
    const src = slideImageSrc(slide);
    const link = slide.querySelector('a[href]');
    if (!src && !link) return;

    const href = link ? absUrl(link.getAttribute('href')) : '';
    const article = slide.querySelector('article') || slide;
    const label = labelFromHref(href) || (article.getAttribute('data-gtm-name') || '').trim() || 'Learn more';

    const imageCell = [];
    if (src) {
      const img = document.createElement('img');
      img.src = absUrl(src);
      img.alt = label;
      imageCell.push(img);
    }

    const textCell = [];
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      p.append(a);
      textCell.push(p);
    }

    cells.push([imageCell.length ? imageCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
