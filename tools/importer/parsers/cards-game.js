/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-game. Base: cards.
 * Source: https://www.alc.ca/content/alc/en.html
 * Instance selector: .cmp-container--game-tiles
 *
 * Source structure (validated against live DOM + block-context/source.html):
 *   article.game-tile
 *     div.game-tile-image-container[style=background-image]  -> tile image
 *       div.game-flag.new ("[new-en]")                       -> NEW ribbon (optional)
 *       div.jackpot-* (prize bar overlay, duplicated by next-jackpot-prize; skipped)
 *     div.game-tile-content
 *       h3.game-tile-title
 *       div.game-tile-description > p (may contain a.read-more)
 *       div > p.next-jackpot-date, p.next-jackpot-prize, p.prize-info (optional, often empty)
 *       a.button.arrow-button                                -> CTA
 *
 * Output (2 columns, one row per tile):
 *   cell 1: tile image
 *   cell 2: [p "NEW"], h3 title, description p(s), [next draw / jackpot p], p CTA link
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

const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
const text = (el) => (el ? clean(el.textContent) : '');

// Rebuild a paragraph keeping inline links (absolute hrefs) and plain text.
function rebuildParagraph(document, srcP) {
  const p = document.createElement('p');
  srcP.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      const t = node.textContent.replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ');
      if (t.trim()) p.append(document.createTextNode(t));
    } else if (node.nodeType === 1) {
      if (node.tagName === 'A') {
        const a = document.createElement('a');
        a.href = absUrl(node.getAttribute('href'));
        a.textContent = text(node);
        if (p.childNodes.length) p.append(document.createTextNode(' '));
        p.append(a);
      } else if (['STRONG', 'B', 'EM', 'I'].includes(node.tagName)) {
        const el = document.createElement(node.tagName.toLowerCase());
        el.textContent = text(node);
        p.append(el);
      } else {
        const t = text(node);
        if (t) p.append(document.createTextNode(` ${t}`));
      }
    }
  });
  // normalise whitespace at edges
  if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, '');
  if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/\s+$/, '');
  return text(p) ? p : null;
}

export default function parse(element, { document }) {
  let tiles = [...element.querySelectorAll('article.game-tile')];
  if (!tiles.length) tiles = [...element.querySelectorAll('.game-tile')].filter((t) => !t.parentElement.closest('.game-tile'));

  const cells = [];
  tiles.forEach((tile) => {
    const titleEl = tile.querySelector('.game-tile-title, h3, h2');
    const cta = tile.querySelector('.game-tile-content a.button, a.arrow-button, a.button');
    if (!titleEl && !cta) return;
    const title = text(titleEl);

    // Cell 1: tile image (CSS background)
    const imgContainer = tile.querySelector('.game-tile-image-container');
    const src = bgUrl(imgContainer) || ((imgContainer && imgContainer.querySelector('img')) || {}).src || '';
    let imageCell = '';
    if (src) {
      const img = document.createElement('img');
      img.src = absUrl(src);
      img.alt = title;
      imageCell = img;
    }

    // Cell 2: content
    const content = [];
    if (tile.querySelector('.game-flag.new, .game-flag')) {
      const p = document.createElement('p');
      p.textContent = 'NEW';
      content.push(p);
    }

    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      content.push(h3);
    }

    const descParas = [...tile.querySelectorAll('.game-tile-description p')];
    if (descParas.length) {
      descParas.forEach((dp) => { const p = rebuildParagraph(document, dp); if (p) content.push(p); });
    } else {
      const desc = tile.querySelector('.game-tile-description');
      if (desc) { const p = rebuildParagraph(document, desc); if (p) content.push(p); }
    }

    tile.querySelectorAll('p.next-jackpot-date, p.next-jackpot-prize, p.prize-info').forEach((jp) => {
      const t = text(jp);
      if (!t) return;
      const p = document.createElement('p');
      p.textContent = t;
      content.push(p);
    });

    if (cta) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = absUrl(cta.getAttribute('href'));
      a.textContent = text(cta) || cta.getAttribute('title') || 'Learn more';
      p.append(a);
      content.push(p);
    }

    cells.push([imageCell, content]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-game', cells });
  element.replaceWith(block);
}
