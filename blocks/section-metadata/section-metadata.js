import { readBlockConfig, toClassName } from '../../scripts/aem.js';

/**
 * Applies section metadata to the parent section: "style" values become
 * section classes, any other key becomes a data attribute. The block
 * (and its wrapper) is removed afterwards.
 */
export default function decorate(block) {
  const section = block.closest('.section');
  const config = readBlockConfig(block);

  if (section) {
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'style') {
        String(value).split(',')
          .map((style) => toClassName(style.trim()))
          .filter(Boolean)
          .forEach((style) => section.classList.add(style));
      } else {
        section.dataset[key.replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = value;
      }
    });
  }

  const wrapper = block.parentElement;
  block.remove();
  if (wrapper && wrapper.classList.contains('section-metadata-wrapper') && !wrapper.children.length) {
    wrapper.remove();
  }
}
