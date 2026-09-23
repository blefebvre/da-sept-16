/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-winners. Base: carousel.
 * Source: https://www.alc.ca/content/alc/en.html
 * Instance selector: .winners_carousel.winners-carousel
 *
 * Source structure (validated against live DOM + block-context/source.html):
 *   .slick-slide[:not(.slick-cloned)] > div > div.slide
 *     div.winner-image[style=background-image]          -> winner photo
 *     div.winner-info > h3, span.h2 (location), a.all-winners
 *     div.prize-details > p.game-title > img.winning-game-logo, span.winning-game-ribbon
 *                       > p.prize-amount > span (digit groups)
 * Slick clones are skipped (also removed by alc-cleanup transformer).
 *
 * Output (2 columns, one row per winner):
 *   cell 1: winner photo
 *   cell 2: h3 name, p location, p link "See all winners", p game logo, p "Winner", p prize "$500,000"
 */
const ORIGIN = 'https://www.alc.ca';

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

const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

function para(document, content) {
  const p = document.createElement('p');
  if (typeof content === 'string') p.textContent = content;
  else p.append(content);
  return p;
}

export default function parse(element, { document }) {
  // Iterate the stable inner .slide wrapper of each non-cloned slick slide.
  let slides = [...element.querySelectorAll('.slick-slide:not(.slick-cloned)')]
    .map((s) => s.querySelector('.slide') || s);
  if (!slides.length) {
    // Fallback: slick not initialised — slides are plain .slide elements
    slides = [...element.querySelectorAll('.slide')].filter((s) => !s.closest('.slick-cloned'));
  }

  const cells = [];
  slides.forEach((slide) => {
    const nameEl = slide.querySelector('.winner-info h3, h3, h2:not(.h2)');
    const name = text(nameEl);
    if (!name) return;

    // Cell 1: winner photo
    const photoSrc = bgUrl(slide.querySelector('.winner-image'))
      || (slide.querySelector('.winner-image img') || {}).src || '';
    let imageCell = '';
    if (photoSrc) {
      const img = document.createElement('img');
      img.src = absUrl(photoSrc);
      img.alt = name;
      imageCell = img;
    }

    // Cell 2: winner details
    const content = [];
    const h3 = document.createElement('h3');
    h3.textContent = name;
    content.push(h3);

    const location = text(slide.querySelector('.winner-info .h2, .winner-info span, .winner-location'));
    if (location) content.push(para(document, location));

    const cta = slide.querySelector('a.all-winners, .winner-info a[href]');
    if (cta) {
      const a = document.createElement('a');
      a.href = absUrl(cta.getAttribute('href'));
      a.textContent = text(cta) || 'See all winners';
      content.push(para(document, a));
    }

    const logo = slide.querySelector('img.winning-game-logo, .game-title img');
    if (logo) {
      const img = document.createElement('img');
      img.src = absUrl(logo.getAttribute('src'));
      img.alt = logo.getAttribute('alt') || 'game logo';
      content.push(para(document, img));
    }

    const ribbon = text(slide.querySelector('.winning-game-ribbon'));
    if (ribbon) content.push(para(document, ribbon));

    const prizeEl = slide.querySelector('.prize-amount');
    if (prizeEl) {
      const groups = [...prizeEl.querySelectorAll('span')].map(text).filter(Boolean);
      const digits = groups.length ? groups.join(',') : text(prizeEl).replace(/\s+/g, ',');
      const prize = digits.replace(/^\$?\s*/, '$');
      content.push(para(document, prize));
    }

    cells.push([imageCell, content]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-winners', cells });
  element.replaceWith(block);
}
