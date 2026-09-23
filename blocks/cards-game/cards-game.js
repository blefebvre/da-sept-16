import { createOptimizedPicture } from '../../scripts/aem.js';

const BADGE_PATTERN = /^(new|nouveau)$/i;
// "Next Draw: ..." / "Prochain tirage : ..." starts the draw-info lines (date + jackpot)
const DRAW_PATTERN = /^(next draw|prochain tirage)/i;

const isLinkOnly = (el) => {
  const link = el.querySelector('a');
  return link && el.textContent.trim() === link.textContent.trim();
};

/**
 * Game tile: [image | badge?, title, description, draw info?, CTA].
 * A short paragraph reading "NEW" is lifted onto the image as a corner badge;
 * the last link-only paragraph becomes the tile's CTA, pinned to the bottom.
 */
function decorateCard(li) {
  [...li.children].forEach((div) => {
    if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-game-card-image';
    else div.className = 'cards-game-card-body';
  });

  const image = li.querySelector('.cards-game-card-image');
  const body = li.querySelector('.cards-game-card-body');
  if (!body) return;

  const badge = [...body.children].find((el) => BADGE_PATTERN.test(el.textContent.trim()));
  if (badge) {
    badge.className = 'cards-game-card-badge';
    (image || li).append(badge);
  }

  const cta = [...body.children].reverse().find((el) => isLinkOnly(el));
  if (cta) cta.classList.add('cards-game-card-cta');

  // group the copy: description paragraphs, then the (green) next-draw / jackpot lines
  const paragraphs = [...body.children].filter((el) => el.tagName === 'P' && el !== cta);
  const drawStart = paragraphs.findIndex((p) => DRAW_PATTERN.test(p.textContent.trim()));
  const description = drawStart < 0 ? paragraphs : paragraphs.slice(0, drawStart);
  const draw = drawStart < 0 ? [] : paragraphs.slice(drawStart);
  const wrap = (els, className) => {
    if (!els.length) return;
    const div = document.createElement('div');
    div.className = className;
    els[0].before(div);
    div.append(...els);
  };
  wrap(description, 'cards-game-card-description');
  wrap(draw, 'cards-game-card-draw');
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    decorateCard(li);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
