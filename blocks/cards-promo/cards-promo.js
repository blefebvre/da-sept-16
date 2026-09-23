import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Promo banner: [image | link]. The image is wrapped in the row's link so the
 * whole banner is clickable (text and buttons are part of the artwork).
 * Tolerates the link already wrapping the image, a missing link, or extra
 * authored text (kept below the image).
 */
function createPromo(row) {
  const li = document.createElement('li');
  const picture = row.querySelector('picture');
  const link = row.querySelector('a[href]');

  if (picture) {
    const media = document.createElement(link ? 'a' : 'div');
    media.className = 'cards-promo-card-image';
    if (link) {
      media.href = link.href;
      const label = link.textContent.trim() || link.title;
      if (label && label !== link.href) media.setAttribute('aria-label', label);
    }
    media.append(picture);
    li.append(media);
  }

  const text = [...row.children].filter((cell) => cell.textContent.trim()
    && !(link && picture && cell.contains(link)
      && cell.textContent.trim() === link.textContent.trim()));
  if (text.length) {
    const body = document.createElement('div');
    body.className = 'cards-promo-card-body';
    text.forEach((cell) => body.append(...cell.childNodes));
    li.append(body);
  }

  return li;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => ul.append(createPromo(row)));
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
