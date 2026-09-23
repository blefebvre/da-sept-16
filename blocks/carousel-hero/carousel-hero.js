const OPTION_CLASSES = ['no-autoplay'];
const AUTOPLAY_DELAY = 6000;

function updateActiveSlide(block, slideIndex) {
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-hero-slide').forEach((slide, idx) => {
    const active = idx === slideIndex;
    slide.setAttribute('aria-hidden', !active);
    slide.querySelectorAll('a').forEach((link) => {
      if (active) link.removeAttribute('tabindex');
      else link.setAttribute('tabindex', '-1');
    });
  });

  block.querySelectorAll('.carousel-hero-indicator button').forEach((button, idx) => {
    if (idx === slideIndex) {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    } else {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  let realIndex = slideIndex;
  if (slideIndex < 0) realIndex = slides.length - 1;
  if (slideIndex >= slides.length) realIndex = 0;

  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: slides[realIndex].offsetLeft,
    behavior: 'smooth',
  });
  updateActiveSlide(block, realIndex);
}

function startAutoplay(block) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let timer;
  const stop = () => clearInterval(timer);
  const start = () => {
    stop();
    timer = setInterval(() => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    }, AUTOPLAY_DELAY);
  };

  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', start);
  start();
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-hero-indicator button').forEach((button) => {
    button.addEventListener('click', (e) => {
      showSlide(block, parseInt(e.currentTarget.parentElement.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSlide(block, parseInt(entry.target.dataset.slideIndex, 10));
      }
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => slideObserver.observe(slide));
}

/**
 * Builds one slide. The slide image is wrapped in the slide's link so the
 * whole banner is clickable (the CTA text is part of the image artwork).
 * Tolerates: link in the second cell, link already wrapping the image,
 * or no link at all.
 */
function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-hero-${carouselId}-slide-${slideIndex}`;
  slide.classList.add('carousel-hero-slide');

  const picture = row.querySelector('picture');
  const link = row.querySelector('a[href]');

  if (picture) {
    const media = document.createElement(link ? 'a' : 'div');
    media.classList.add('carousel-hero-slide-image');
    if (link) {
      media.href = link.href;
      const label = link.textContent.trim() || link.title;
      if (label && label !== link.href) media.setAttribute('aria-label', label);
      const img = picture.querySelector('img');
      if (img && !img.alt && label && label !== link.href) img.alt = label;
    }
    media.append(picture);
    slide.append(media);
  }

  // keep any authored text (optional) as slide content
  const text = [...row.children].filter((cell) => cell.textContent.trim()
    && !(link && cell.contains(link) && cell.textContent.trim() === link.textContent.trim()));
  if (text.length) {
    const content = document.createElement('div');
    content.classList.add('carousel-hero-slide-content');
    text.forEach((cell) => content.append(...cell.childNodes));
    slide.append(content);
  }

  return slide;
}

let carouselId = 0;
export default function decorate(block) {
  carouselId += 1;
  block.id = `carousel-hero-${carouselId}`;
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-hero-slides');

  let indicators;
  let controls;
  if (!isSingleSlide) {
    controls = document.createElement('div');
    controls.classList.add('carousel-hero-controls');

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Carousel Slide Controls');
    indicators = document.createElement('ol');
    indicators.classList.add('carousel-hero-indicators');
    nav.append(indicators);

    controls.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;
    controls.querySelector('.slide-prev').after(nav);
  }

  rows.forEach((row, idx) => {
    slidesWrapper.append(createSlide(row, idx, carouselId));

    if (indicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-hero-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      indicators.append(indicator);
    }
    row.remove();
  });

  const container = document.createElement('div');
  container.classList.add('carousel-hero-slides-container');
  container.append(slidesWrapper);
  block.replaceChildren(container);
  if (controls) block.append(controls);

  if (!isSingleSlide) {
    updateActiveSlide(block, 0);
    bindEvents(block);
    if (!active.includes('no-autoplay')) startAutoplay(block);
  }
}
