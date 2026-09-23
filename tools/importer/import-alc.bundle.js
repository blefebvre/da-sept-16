/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-alc.js
  var import_alc_exports = {};
  __export(import_alc_exports, {
    default: () => import_alc_default
  });

  // tools/importer/parsers/carousel-hero.js
  var ORIGIN = "https://www.alc.ca";
  var GENERIC_SEGMENTS = ["content", "alc", "en", "fr", "promos", "game-configurator", "referenced-content", "external"];
  function absUrl(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN).href;
    } catch (e) {
      return url;
    }
  }
  function bgUrl(el) {
    if (!el) return "";
    const style = el.getAttribute("style") || "";
    const m = style.match(/background-image\s*:\s*url\(\s*(['"]|&quot;)?(.*?)\1?\s*\)/i);
    return m ? m[2] : "";
  }
  function titleCase(str) {
    return str.split(/[-_\s]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  function labelFromHref(href) {
    try {
      const { pathname } = new URL(href, ORIGIN);
      const segs = pathname.replace(/\.html?$/i, "").split("/").filter(Boolean);
      const last = segs.pop() || "";
      const parent = segs.pop() || "";
      const parts = [];
      if (parent && !GENERIC_SEGMENTS.includes(parent.toLowerCase())) parts.push(parent);
      parts.push(last);
      return titleCase(parts.join(" "));
    } catch (e) {
      return "";
    }
  }
  function slideImageSrc(slide) {
    const content = slide.querySelector(".slide-content, .picturefill-background");
    const spans = [...slide.querySelectorAll("span[data-src]")];
    const desktop = spans.find((s) => /1200/.test(s.getAttribute("data-media") || "")) || spans.find((s) => /imageD/i.test(s.getAttribute("data-src") || "")) || spans[spans.length - 1];
    if (desktop) return desktop.getAttribute("data-src");
    const bg = bgUrl(content);
    if (bg) return bg;
    const img = slide.querySelector("img");
    return img ? img.getAttribute("src") : "";
  }
  function parse(element, { document: document2 }) {
    let slides = [...element.querySelectorAll("ul.slides > li")];
    if (!slides.length) slides = [...element.querySelectorAll(".fca-carousel-slide-promo article, article")];
    slides = slides.filter((s) => !s.classList.contains("clone") && !s.classList.contains("slick-cloned"));
    const cells = [];
    slides.forEach((slide) => {
      const src = slideImageSrc(slide);
      const link = slide.querySelector("a[href]");
      if (!src && !link) return;
      const href = link ? absUrl(link.getAttribute("href")) : "";
      const article = slide.querySelector("article") || slide;
      const label = labelFromHref(href) || (article.getAttribute("data-gtm-name") || "").trim() || "Learn more";
      const imageCell = [];
      if (src) {
        const img = document2.createElement("img");
        img.src = absUrl(src);
        img.alt = label;
        imageCell.push(img);
      }
      const textCell = [];
      if (href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = label;
        p.append(a);
        textCell.push(p);
      }
      cells.push([imageCell.length ? imageCell : "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-winners.js
  var ORIGIN2 = "https://www.alc.ca";
  function absUrl2(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN2).href;
    } catch (e) {
      return url;
    }
  }
  function bgUrl2(el) {
    if (!el) return "";
    const style = el.getAttribute("style") || "";
    const m = style.match(/background-image\s*:\s*url\(\s*(['"]|&quot;)?(.*?)\1?\s*\)/i);
    return m ? m[2] : "";
  }
  var text = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  function para(document2, content) {
    const p = document2.createElement("p");
    if (typeof content === "string") p.textContent = content;
    else p.append(content);
    return p;
  }
  function parse2(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".slick-slide:not(.slick-cloned)")].map((s) => s.querySelector(".slide") || s);
    if (!slides.length) {
      slides = [...element.querySelectorAll(".slide")].filter((s) => !s.closest(".slick-cloned"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const nameEl = slide.querySelector(".winner-info h3, h3, h2:not(.h2)");
      const name = text(nameEl);
      if (!name) return;
      const photoSrc = bgUrl2(slide.querySelector(".winner-image")) || (slide.querySelector(".winner-image img") || {}).src || "";
      let imageCell = "";
      if (photoSrc) {
        const img = document2.createElement("img");
        img.src = absUrl2(photoSrc);
        img.alt = name;
        imageCell = img;
      }
      const content = [];
      const h3 = document2.createElement("h3");
      h3.textContent = name;
      content.push(h3);
      const location = text(slide.querySelector(".winner-info .h2, .winner-info span, .winner-location"));
      if (location) content.push(para(document2, location));
      const cta = slide.querySelector("a.all-winners, .winner-info a[href]");
      if (cta) {
        const a = document2.createElement("a");
        a.href = absUrl2(cta.getAttribute("href"));
        a.textContent = text(cta) || "See all winners";
        content.push(para(document2, a));
      }
      const logo = slide.querySelector("img.winning-game-logo, .game-title img");
      if (logo) {
        const img = document2.createElement("img");
        img.src = absUrl2(logo.getAttribute("src"));
        img.alt = logo.getAttribute("alt") || "game logo";
        content.push(para(document2, img));
      }
      const ribbon = text(slide.querySelector(".winning-game-ribbon"));
      if (ribbon) content.push(para(document2, ribbon));
      const prizeEl = slide.querySelector(".prize-amount");
      if (prizeEl) {
        const groups = [...prizeEl.querySelectorAll("span")].map(text).filter(Boolean);
        const digits = groups.length ? groups.join(",") : text(prizeEl).replace(/\s+/g, ",");
        const prize = digits.replace(/^\$?\s*/, "$");
        content.push(para(document2, prize));
      }
      cells.push([imageCell, content]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-winners", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-game.js
  var ORIGIN3 = "https://www.alc.ca";
  function absUrl3(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN3).href;
    } catch (e) {
      return url;
    }
  }
  function bgUrl3(el) {
    if (!el) return "";
    const style = el.getAttribute("style") || "";
    const m = style.match(/background-image\s*:\s*url\(\s*(['"]|&quot;)?(.*?)\1?\s*\)/i);
    return m ? m[2] : "";
  }
  var clean = (s) => (s || "").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
  var text2 = (el) => el ? clean(el.textContent) : "";
  function rebuildParagraph(document2, srcP) {
    const p = document2.createElement("p");
    srcP.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        const t = node.textContent.replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ");
        if (t.trim()) p.append(document2.createTextNode(t));
      } else if (node.nodeType === 1) {
        if (node.tagName === "A") {
          const a = document2.createElement("a");
          a.href = absUrl3(node.getAttribute("href"));
          a.textContent = text2(node);
          if (p.childNodes.length) p.append(document2.createTextNode(" "));
          p.append(a);
        } else if (["STRONG", "B", "EM", "I"].includes(node.tagName)) {
          const el = document2.createElement(node.tagName.toLowerCase());
          el.textContent = text2(node);
          p.append(el);
        } else {
          const t = text2(node);
          if (t) p.append(document2.createTextNode(` ${t}`));
        }
      }
    });
    if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, "");
    if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/\s+$/, "");
    return text2(p) ? p : null;
  }
  function parse3(element, { document: document2 }) {
    let tiles = [...element.querySelectorAll("article.game-tile")];
    if (!tiles.length) tiles = [...element.querySelectorAll(".game-tile")].filter((t) => !t.parentElement.closest(".game-tile"));
    const cells = [];
    tiles.forEach((tile) => {
      const titleEl = tile.querySelector(".game-tile-title, h3, h2");
      const cta = tile.querySelector(".game-tile-content a.button, a.arrow-button, a.button");
      if (!titleEl && !cta) return;
      const title = text2(titleEl);
      const imgContainer = tile.querySelector(".game-tile-image-container");
      const src = bgUrl3(imgContainer) || (imgContainer && imgContainer.querySelector("img") || {}).src || "";
      let imageCell = "";
      if (src) {
        const img = document2.createElement("img");
        img.src = absUrl3(src);
        img.alt = title;
        imageCell = img;
      }
      const content = [];
      if (tile.querySelector(".game-flag.new, .game-flag")) {
        const p = document2.createElement("p");
        p.textContent = "NEW";
        content.push(p);
      }
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        content.push(h3);
      }
      const descParas = [...tile.querySelectorAll(".game-tile-description p")];
      if (descParas.length) {
        descParas.forEach((dp) => {
          const p = rebuildParagraph(document2, dp);
          if (p) content.push(p);
        });
      } else {
        const desc = tile.querySelector(".game-tile-description");
        if (desc) {
          const p = rebuildParagraph(document2, desc);
          if (p) content.push(p);
        }
      }
      tile.querySelectorAll("p.next-jackpot-date, p.next-jackpot-prize, p.prize-info").forEach((jp) => {
        const t = text2(jp);
        if (!t) return;
        const p = document2.createElement("p");
        p.textContent = t;
        content.push(p);
      });
      if (cta) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = absUrl3(cta.getAttribute("href"));
        a.textContent = text2(cta) || cta.getAttribute("title") || "Learn more";
        p.append(a);
        content.push(p);
      }
      cells.push([imageCell, content]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-game", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  var ORIGIN4 = "https://www.alc.ca";
  var GENERIC_SEGMENTS2 = ["content", "alc", "en", "fr", "promos", "referenced-content", "external", "sponsorships"];
  function absUrl4(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN4).href;
    } catch (e) {
      return url;
    }
  }
  function titleCase2(str) {
    return str.split(/[-_\s]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  function labelFromHref2(href) {
    try {
      const { pathname } = new URL(href, ORIGIN4);
      const segs = pathname.replace(/\.html?$/i, "").split("/").filter(Boolean);
      const last = segs.pop() || "";
      const parent = segs.pop() || "";
      const parts = [];
      if (parent && !GENERIC_SEGMENTS2.includes(parent.toLowerCase())) parts.push(parent);
      parts.push(last);
      return titleCase2(parts.join(" "));
    } catch (e) {
      return "";
    }
  }
  function imageSrc(item) {
    const sources = [...item.querySelectorAll("picture source[srcset]")];
    const desktop = sources.find((s) => /1200/.test(s.getAttribute("media") || "")) || sources.find((s) => /imageD/i.test(s.getAttribute("srcset") || ""));
    if (desktop) return desktop.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    const img = item.querySelector("img");
    return img ? img.getAttribute("src") : "";
  }
  function parse4(element, { document: document2 }) {
    const items = [...element.querySelectorAll(".cmp-image")].filter((el) => !el.closest(".banner, .alc-mobile-banner"));
    const cells = [];
    items.forEach((item) => {
      const src = imageSrc(item);
      const link = item.querySelector("a[href]");
      if (!src && !link) return;
      const href = link ? absUrl4(link.getAttribute("href")) : "";
      const srcImg = item.querySelector("img");
      const rawAlt = (srcImg && srcImg.getAttribute("alt") || "").trim();
      const gtmEl = item.querySelector("[data-gtm-name]");
      const gtmName = gtmEl ? gtmEl.getAttribute("data-gtm-name") || "" : "";
      const isGenericAlt = !rawAlt || /^promo image$/i.test(rawAlt);
      const label = !isGenericAlt && rawAlt || labelFromHref2(href) || gtmName.trim() || "Learn more";
      let imageCell = "";
      if (src) {
        const img = document2.createElement("img");
        img.src = absUrl4(src);
        img.alt = isGenericAlt ? label : rawAlt;
        imageCell = img;
      }
      let linkCell = "";
      if (href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/alc-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Login "Multi-Factor Authentication" modal: <div id="loginFlow" class="alc-modal modal fade">
        "#loginFlow",
        // Browser-upgrade modal wrapper: <div class="common-modals aem-GridColumn ...">
        ".common-modals",
        // Countdown "Time Remaining:" timers inside hero slides: <div class="next-draw-timer">
        ".next-draw-timer",
        // Slick carousel clones in winners carousel: <div class="slick-slide slick-cloned">
        ".slick-cloned",
        // App-download banner ("Download our App ... Open / Chrome / Continue"),
        // inside .cmp-container--hide-column-gutters but in its own column container,
        // sibling of the promo .cmp-image column: <div class="banner"> > .alc-mobile-banner
        ".alc-mobile-banner",
        ".banner"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Tracking wrapper (body > div:nth-of-type(1)): <div id="ZN_3Eu2u7P45FmpwJ5">
        "#ZN_3Eu2u7P45FmpwJ5",
        // Skip link: <div class="cmp-page__skiptomaincontent">
        ".cmp-page__skiptomaincontent",
        // Global header XF: <div class="experiencefragment aem-GridColumn ...">
        "div.experiencefragment.aem-GridColumn",
        ".cmp-experiencefragment--header",
        // Global footer XF (incl. newsletter band): <footer class="experiencefragment aem-GridColumn ...">
        "footer.experiencefragment.aem-GridColumn",
        ".cmp-experiencefragment--footer",
        // Hidden mobile "winning numbers" promo: <div class="html-promo parbase ...">
        ".html-promo.parbase",
        // Tracking pixels / non-content elements
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/alc-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-alc.js
  var PAGE_TEMPLATE = {
    name: "alc",
    description: "ALC homepage: hero promo carousel, recent winners carousel, featured games tiles with promo rail",
    urls: [
      "https://www.alc.ca/content/alc/en.html"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [".carousel.list.parbase.hero"]
      },
      {
        name: "carousel-winners",
        instances: [".winners_carousel.winners-carousel"]
      },
      {
        name: "cards-game",
        instances: [".cmp-container--game-tiles"]
      },
      {
        name: "cards-promo",
        instances: [".cmp-container--hide-column-gutters"]
      }
    ],
    sections: [
      {
        id: "1",
        name: "Hero promo carousel",
        selector: [".carousel.list.parbase.hero"],
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "2",
        name: "Recent winners",
        selector: [".section-header.cmp-section-header--alc-blue"],
        style: "recent-winners",
        blocks: ["carousel-winners"],
        defaultContent: [".cmp-section-header--alc-blue .cmp-section-header__title"]
      },
      {
        id: "3",
        name: "Featured games and promotions",
        selector: [".section-header.cmp-section-header--alc-green"],
        style: "featured-games",
        blocks: ["cards-game", "cards-promo"],
        defaultContent: [".cmp-section-header--alc-green .cmp-section-header__title"]
      }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    "carousel-winners": parse2,
    "cards-game": parse3,
    "cards-promo": parse4
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_alc_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_alc_exports);
})();
