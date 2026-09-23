import { toClassName } from '../../scripts/aem.js';

// the source header switches between its mobile and desktop layouts at 768px
const isDesktop = window.matchMedia('(width >= 768px)');

/**
 * Fetches the nav fragment. Tries the local content folder first (aem up),
 * then the site root (DA / EDS). Relative image paths are resolved against
 * the folder the fragment was served from.
 * @returns {Promise<HTMLElement|null>} container holding the fragment sections
 */
async function fetchNav() {
  let base = '/content/';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    base = '/';
    resp = await fetch('/nav.plain.html');
  }
  if (!resp.ok) return null;
  const container = document.createElement('div');
  container.innerHTML = await resp.text();
  const baseUrl = new URL(base, window.location.origin);
  container.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|\/|data:)/.test(src)) img.src = new URL(src, baseUrl).href;
  });
  return container;
}

const isLinkOnly = (el) => {
  const a = el && el.querySelector('a');
  return a && !el.querySelector('img') && el.textContent.trim() === a.textContent.trim();
};

function buildBrand(section) {
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const link = section.querySelector('a');
  if (link) {
    link.className = 'nav-brand-logo';
    link.setAttribute('aria-label', (link.querySelector('img') || {}).alt || 'Home');
    brand.append(link);
  }
  return brand;
}

/**
 * Builds the search form from the fragment link: href = results page,
 * link text = placeholder.
 */
function buildSearch(section) {
  const link = section && section.querySelector('a');
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.method = 'get';
  form.setAttribute('role', 'search');
  form.action = link ? link.href : '/search';
  const label = document.createElement('label');
  label.className = 'nav-sr-only';
  const id = `nav-search-${Math.random().toString(36).slice(2, 7)}`;
  label.setAttribute('for', id);
  label.textContent = 'Search';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.id = id;
  input.placeholder = link ? link.textContent.trim() : 'Search';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', 'Search');
  form.append(label, input, submit);
  return form;
}

/**
 * Utility links (list) + sign-in call to action (paragraph link).
 * Each utility item gets a class derived from its label so it can be styled.
 */
function buildTools(section) {
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const list = section.querySelector('ul');
  if (list) {
    list.className = 'nav-utility';
    [...list.children].forEach((li, idx) => {
      const a = li.querySelector('a');
      li.className = `nav-utility-item nav-utility-${toClassName(a ? a.textContent : `item-${idx}`)}`;
      if (a && idx === 0) {
        // short label used by the compact (mobile) bar, e.g. "Français" -> "FR"
        a.dataset.short = a.textContent.trim().slice(0, 2).toUpperCase();
      }
    });
    tools.append(list);
  }
  const signIn = [...section.querySelectorAll(':scope > p')].find(isLinkOnly);
  if (signIn) {
    const a = signIn.querySelector('a');
    a.className = 'nav-signin';
    const label = document.createElement('span');
    label.className = 'nav-signin-label';
    label.textContent = a.textContent.trim();
    a.replaceChildren(label);
    tools.append(a);
  }
  return tools;
}

/**
 * Turns a dropdown's content (tile list, heading paragraph, link list,
 * decorative image paragraph) into a megamenu panel.
 */
function buildPanel(item, idx) {
  const lists = [...item.querySelectorAll(':scope > ul')];
  const tileList = lists.find((ul) => ul.querySelector('img'));
  const moreList = lists.find((ul) => ul !== tileList);
  const paragraphs = [...item.querySelectorAll(':scope > p')];
  const heading = paragraphs.find((p) => !p.querySelector('a, img') && p.textContent.trim());
  const decoration = paragraphs.find((p) => p.querySelector('img') && !p.querySelector('a'));

  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = `nav-panel-${idx}`;

  const mobileList = document.createElement('ul');
  mobileList.className = 'nav-panel-mobile';

  if (tileList) {
    tileList.className = 'nav-panel-tiles';
    [...tileList.children].forEach((li) => {
      li.className = 'nav-tile';
      const links = [...li.querySelectorAll('a')];
      const logo = links.find((a) => a.querySelector('img'));
      const cta = links.find((a) => !a.querySelector('img'));
      if (logo) logo.className = 'nav-tile-logo';
      if (cta) {
        const strong = cta.closest('strong');
        cta.className = strong ? 'nav-tile-button' : 'nav-tile-link';
        if (strong) strong.replaceWith(cta);
      } else {
        li.classList.add('nav-tile-promo');
      }
      // compact list for the mobile accordion, labelled by the tile image
      const img = logo && logo.querySelector('img');
      if (logo && img && img.alt) {
        const mli = document.createElement('li');
        const ma = document.createElement('a');
        ma.href = logo.href;
        ma.textContent = img.alt;
        mli.append(ma);
        mobileList.append(mli);
      }
    });
    panel.append(tileList);
  }

  if (heading || moreList) {
    const more = document.createElement('div');
    more.className = 'nav-panel-more';
    if (heading) {
      heading.className = 'nav-panel-more-title';
      more.append(heading);
    }
    if (moreList) {
      moreList.className = 'nav-panel-more-list';
      more.append(moreList);
    }
    const bg = decoration && decoration.querySelector('img');
    if (bg) {
      more.style.backgroundImage = `url('${bg.src}')`;
      decoration.remove();
    }
    panel.append(more);
  }

  if (mobileList.children.length) panel.append(mobileList);
  return panel;
}

function closePanels(nav, except) {
  nav.querySelectorAll('.nav-drop').forEach((drop) => {
    if (drop === except) return;
    drop.classList.remove('is-open');
    const trigger = drop.querySelector('.nav-link');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
}

function togglePanel(nav, drop, force) {
  const open = force !== undefined ? force : !drop.classList.contains('is-open');
  closePanels(nav, drop);
  drop.classList.toggle('is-open', open);
  drop.querySelector('.nav-link').setAttribute('aria-expanded', open ? 'true' : 'false');
}

function buildSections(section) {
  const sections = document.createElement('div');
  sections.className = 'nav-sections';
  const list = section.querySelector('ul');
  if (!list) return sections;
  list.className = 'nav-list';
  [...list.children].forEach((item, idx) => {
    item.className = 'nav-item';
    const p = item.querySelector(':scope > p');
    const link = item.querySelector(':scope > a') || (p && p.querySelector('a'));
    if (p && link) p.replaceWith(link);
    if (link) link.className = 'nav-link';
    if (item.querySelector(':scope > ul')) {
      item.classList.add('nav-drop');
      const panel = buildPanel(item, idx);
      [...item.children].forEach((child) => { if (child !== link) child.remove(); });
      item.append(panel);
      link.setAttribute('aria-expanded', 'false');
      link.setAttribute('aria-controls', panel.id);
      link.setAttribute('role', 'button');
    }
  });
  sections.append(list);
  return sections;
}

function toggleMenu(nav, force) {
  const open = force !== undefined ? force : nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.classList.toggle('nav-open', open && !isDesktop.matches);
  const button = nav.querySelector('.nav-hamburger');
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
  button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  if (!open) closePanels(nav);
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;
  const [brandSection, searchSection, toolsSection, navSection] = [...fragment.children];

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  nav.setAttribute('aria-label', 'Main');

  // row 1: brand, search, utility links, sign in
  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  const barInner = document.createElement('div');
  barInner.className = 'nav-bar-inner';
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav-drawer');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"><span></span><span></span><span></span></span><span class="nav-hamburger-label">Menu</span>';
  const tools = toolsSection ? buildTools(toolsSection) : document.createElement('div');
  barInner.append(
    hamburger,
    brandSection ? buildBrand(brandSection) : document.createElement('div'),
    buildSearch(searchSection),
    tools,
  );
  bar.append(barInner);

  // row 2 (desktop) / off-canvas drawer (mobile)
  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  drawer.id = 'nav-drawer';

  // drawer-only account row and footer re-use the utility/sign-in links
  const account = document.createElement('div');
  account.className = 'nav-drawer-account';
  const drawerFooter = document.createElement('div');
  drawerFooter.className = 'nav-drawer-footer';
  const utilityItems = [...tools.querySelectorAll('.nav-utility-item')];
  const accountItem = utilityItems[2];
  const signIn = tools.querySelector('.nav-signin');
  if (accountItem) account.append(accountItem.querySelector('a').cloneNode(true));
  if (signIn) account.append(signIn.cloneNode(true));
  drawerFooter.append(buildSearch(searchSection));
  const footerLinks = document.createElement('p');
  footerLinks.className = 'nav-drawer-links';
  [utilityItems[1], utilityItems[0]].filter(Boolean).forEach((li) => {
    const a = li.querySelector('a').cloneNode(true);
    a.className = li.className.replace('nav-utility-item ', 'nav-drawer-link ');
    footerLinks.append(a);
  });
  drawerFooter.append(footerLinks);

  const sections = navSection ? buildSections(navSection) : document.createElement('div');
  drawer.append(account, sections, drawerFooter);
  nav.append(bar, drawer);

  // interactions
  hamburger.addEventListener('click', () => toggleMenu(nav));
  sections.querySelectorAll('.nav-drop > .nav-link').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      togglePanel(nav, trigger.parentElement);
    });
  });
  document.addEventListener('click', (e) => {
    if (isDesktop.matches && !e.target.closest('.nav-drop')) closePanels(nav);
  });
  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('.nav-drop.is-open');
    if (open) {
      closePanels(nav);
      open.querySelector('.nav-link').focus();
    } else if (nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.focus();
    }
  });
  // switching between layouts resets any open menu / panel
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    closePanels(nav);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);
}
