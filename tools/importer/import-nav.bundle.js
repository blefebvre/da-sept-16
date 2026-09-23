/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-nav.js
  var import_nav_exports = {};
  __export(import_nav_exports, {
    default: () => import_nav_default
  });
  var ORIGIN = "https://www.alc.ca";
  function abs(href) {
    try {
      return new URL(href, ORIGIN).href;
    } catch (e) {
      return href;
    }
  }
  function slug(href) {
    return new URL(href, ORIGIN).pathname.split("/").pop().replace(/\.html?$/, "");
  }
  function link(document, href, text) {
    const a = document.createElement("a");
    a.href = abs(href);
    a.textContent = text;
    return a;
  }
  function image(document, file, alt) {
    const img = document.createElement("img");
    img.setAttribute("src", `images/${file}`);
    img.setAttribute("alt", alt || "");
    return img;
  }
  function para(document, ...children) {
    const p = document.createElement("p");
    children.forEach((c) => p.append(c));
    return p;
  }
  function buildBrand(document, header) {
    const logo = header.querySelector("a.header-logo");
    const a = link(document, logo ? logo.getAttribute("href") : "/content/alc/en.html", "");
    a.append(image(document, "alc-header-logo-en.png", "Atlantic Lottery"));
    return [para(document, a)];
  }
  function buildSearch(document, header) {
    const form = header.querySelector(".search form");
    const input = form && form.querySelector("input.form-control");
    return [para(document, link(document, form ? form.getAttribute("action") : "/content/alc/en/search-results.html", input && input.placeholder || "Search"))];
  }
  function buildTools(document, header) {
    const ul = document.createElement("ul");
    const util = header.querySelector(".util-menu");
    const lang = util.querySelector("a.language-toggle");
    const items = [
      [lang ? lang.getAttribute("data-href") || "/content/alc/fr.html" : "/content/alc/fr.html", lang ? lang.textContent.trim() : "Fran\xE7ais"],
      [util.querySelector("a.help-link").getAttribute("href"), util.querySelector("a.help-link").textContent.trim()],
      [util.querySelector("a.create-account").getAttribute("href"), util.querySelector("a.create-account").textContent.trim()],
      [util.querySelector("a.shopping-cart").getAttribute("href"), util.querySelector("a.shopping-cart").getAttribute("title") || "Shopping Cart"]
    ];
    items.forEach(([href, text]) => {
      const li = document.createElement("li");
      li.append(link(document, href, text));
      ul.append(li);
    });
    const signIn = header.querySelector(".account-holder .button-text-underline");
    return [ul, para(document, link(document, "/content/alc/en/login.html", signIn ? signIn.textContent.trim() : "Sign In"))];
  }
  function buildNav(document) {
    const ul = document.createElement("ul");
    const items = document.querySelectorAll(".topnavigation ul.nav.navbar-nav > li");
    items.forEach((item) => {
      const trigger = item.querySelector(":scope > a");
      const li = document.createElement("li");
      const label = trigger.textContent.trim().replace(/\s+/g, " ");
      li.append(link(document, trigger.getAttribute("href"), label));
      const menu = item.querySelector(".dropdown-menu");
      if (menu) {
        const section = slug(trigger.getAttribute("href"));
        const tiles = document.createElement("ul");
        menu.querySelectorAll("li.game-list-primary-item").forEach((tile) => {
          const tli = document.createElement("li");
          const logo = tile.querySelector("a.game-logo, a.promo-image");
          const img = logo && logo.querySelector("img");
          if (logo && img) {
            const a = link(document, logo.getAttribute("href"), "");
            a.append(image(document, `nav-${section}-${slug(logo.getAttribute("href"))}.png`, img.getAttribute("alt")));
            tli.append(a);
          }
          const cta = tile.querySelector("a.button, a.game-text");
          if (cta) {
            const ca = link(document, cta.getAttribute("href"), cta.textContent.trim());
            if (cta.classList.contains("button")) {
              const strong = document.createElement("strong");
              strong.append(ca);
              tli.append(strong);
            } else {
              tli.append(ca);
            }
          }
          tiles.append(tli);
        });
        li.append(tiles);
        const heading = menu.querySelector(".game-list-secondary__header");
        li.append(para(document, heading ? heading.textContent.trim() : "More Games"));
        const more = document.createElement("ul");
        menu.querySelectorAll("li.game-list-secondary-item a").forEach((a) => {
          const mli = document.createElement("li");
          mli.append(link(document, a.getAttribute("href"), a.textContent.trim()));
          more.append(mli);
        });
        li.append(more);
        li.append(para(document, image(document, "nav-more-games-bg.png", "")));
      }
      ul.append(li);
    });
    return [ul];
  }
  var import_nav_default = {
    transform: ({ document }) => {
      const header = document.querySelector("header.tablet-desktop");
      const main = document.createElement("div");
      const sections = [
        buildBrand(document, header),
        buildSearch(document, header),
        buildTools(document, header),
        buildNav(document)
      ];
      sections.forEach((els, i) => {
        if (i > 0) main.append(document.createElement("hr"));
        els.forEach((el) => main.append(el));
      });
      document.body.replaceChildren(main);
      return [{ element: main, path: "/nav", report: { title: "nav", sections: sections.length } }];
    }
  };
  return __toCommonJS(import_nav_exports);
})();
