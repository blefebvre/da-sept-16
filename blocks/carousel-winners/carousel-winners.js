const OPTION_CLASSES = ['autoplay'];
const AUTOPLAY_DELAY = 6000;

function updateActiveSlide(block, slideIndex) {
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-winners-slide').forEach((slide, idx) => {
    const active = idx === slideIndex;
    slide.setAttribute('aria-hidden', !active);
    slide.querySelectorAll('a').forEach((link) => {
      if (active) link.removeAttribute('tabindex');
      else link.setAttribute('tabindex', '-1');
    });
  });

  block.querySelectorAll('.carousel-winners-indicator button').forEach((button, idx) => {
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
  const slides = block.querySelectorAll('.carousel-winners-slide');
  let realIndex = slideIndex;
  if (slideIndex < 0) realIndex = slides.length - 1;
  if (slideIndex >= slides.length) realIndex = 0;

  block.querySelector('.carousel-winners-slides').scrollTo({
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
  block.querySelectorAll('.carousel-winners-indicator button').forEach((button) => {
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
  block.querySelectorAll('.carousel-winners-slide').forEach((slide) => slideObserver.observe(slide));
}

const isLinkOnly = (el) => {
  const link = el.querySelector('a');
  return link && el.textContent.trim() === link.textContent.trim() && !el.querySelector('picture');
};

/**
 * Marks up the prize group: game logo, "Winner" label, and prize amount
 * (the last text-only element).
 */
function decoratePrize(prize) {
  const items = [...prize.children];
  const textItems = items.filter((el) => !el.querySelector('picture') && el.textContent.trim());
  items.forEach((el) => {
    if (el.querySelector('picture')) el.classList.add('carousel-winners-logo');
  });
  const amount = textItems.pop();
  if (amount) {
    amount.classList.add('carousel-winners-amount');
    // split the digits into boxed thousand groups ("$500000" -> [500][000])
    const text = amount.textContent.trim();
    const digits = text.replace(/\D/g, '');
    if (digits) {
      const groups = Number(digits).toLocaleString('en-US').split(',');
      const label = document.createElement('span');
      label.classList.add('carousel-winners-amount-label');
      label.textContent = text;
      const boxes = groups.map((group) => {
        const box = document.createElement('span');
        box.classList.add('carousel-winners-amount-group');
        box.setAttribute('aria-hidden', 'true');
        box.textContent = group;
        return box;
      });
      amount.replaceChildren(label, ...boxes);
    }
  }
  textItems.forEach((el) => el.classList.add('carousel-winners-label'));
}

/**
 * Builds one winner slide: [photo | details | prize].
 * Accepts either 3 cells (photo | details | prize) or 2 cells, where the
 * content cell is split at the first element containing an image (the game
 * logo): everything from there on is the prize group, except link-only
 * paragraphs (the CTA), which stay with the details.
 */
function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-winners-${carouselId}-slide-${slideIndex}`;
  slide.classList.add('carousel-winners-slide');

  const cells = [...row.children];
  // the photo cell is the first image-only cell (normally the first cell)
  const photoCell = cells.find((cell) => cell.querySelector('picture')
    && cell.textContent.trim() === '');
  const rest = cells.filter((cell) => cell !== photoCell);

  const photo = document.createElement('div');
  photo.classList.add('carousel-winners-photo');
  if (photoCell) photo.append(...photoCell.childNodes);

  const details = document.createElement('div');
  details.classList.add('carousel-winners-details');
  const prize = document.createElement('div');
  prize.classList.add('carousel-winners-prize');

  if (rest.length >= 2) {
    details.append(...rest[0].childNodes);
    rest.slice(1).forEach((cell) => prize.append(...cell.childNodes));
  } else if (rest.length === 1) {
    let inPrize = false;
    [...rest[0].children].forEach((el) => {
      if (el.querySelector('picture')) inPrize = true;
      if (inPrize && !isLinkOnly(el)) prize.append(el);
      else details.append(el);
    });
  }

  details.querySelectorAll('a').forEach((link) => {
    if (isLinkOnly(link.parentElement)) {
      link.parentElement.classList.add('carousel-winners-cta');
      link.classList.add('button', 'primary');
    }
  });
  decoratePrize(prize);

  const heading = details.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    if (!heading.id) heading.id = `${slide.id}-title`;
    slide.setAttribute('aria-labelledby', heading.id);
  }

  [photo, details, prize].forEach((el) => {
    if (el.children.length) slide.append(el);
  });
  return slide;
}

let carouselId = 0;
export default function decorate(block) {
  carouselId += 1;
  block.id = `carousel-winners-${carouselId}`;
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-winners-slides-container');
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-winners-slides');
  container.append(slidesWrapper);

  let indicators;
  if (!isSingleSlide) {
    const buttons = document.createElement('div');
    buttons.classList.add('carousel-winners-navigation-buttons');
    buttons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;
    container.append(buttons);
  }

  rows.forEach((row, idx) => {
    slidesWrapper.append(createSlide(row, idx, carouselId));
    row.remove();
  });

  block.replaceChildren(container);

  if (!isSingleSlide) {
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Carousel Slide Controls');
    indicators = document.createElement('ol');
    indicators.classList.add('carousel-winners-indicators');
    rows.forEach((row, idx) => {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-winners-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      indicators.append(indicator);
    });
    nav.append(indicators);
    block.append(nav);

    updateActiveSlide(block, 0);
    bindEvents(block);
    if (active.includes('autoplay')) startAutoplay(block);
  }
}
