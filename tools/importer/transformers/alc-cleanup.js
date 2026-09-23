/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ALC (alc.ca) site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 *
 * Block parser instance selectors that MUST survive beforeTransform:
 *   .carousel.list.parbase.hero, .winners_carousel.winners-carousel,
 *   .cmp-container--game-tiles, .cmp-container--hide-column-gutters
 * Background-image data (picturefill-background span[data-src], div.winner-image,
 * div.game-tile-image-container) is intentionally left untouched for the parsers.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Login "Multi-Factor Authentication" modal: <div id="loginFlow" class="alc-modal modal fade">
      '#loginFlow',
      // Browser-upgrade modal wrapper: <div class="common-modals aem-GridColumn ...">
      '.common-modals',
      // Countdown "Time Remaining:" timers inside hero slides: <div class="next-draw-timer">
      '.next-draw-timer',
      // Slick carousel clones in winners carousel: <div class="slick-slide slick-cloned">
      '.slick-cloned',
      // App-download banner ("Download our App ... Open / Chrome / Continue"),
      // inside .cmp-container--hide-column-gutters but in its own column container,
      // sibling of the promo .cmp-image column: <div class="banner"> > .alc-mobile-banner
      '.alc-mobile-banner',
      '.banner',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Tracking wrapper (body > div:nth-of-type(1)): <div id="ZN_3Eu2u7P45FmpwJ5">
      '#ZN_3Eu2u7P45FmpwJ5',
      // Skip link: <div class="cmp-page__skiptomaincontent">
      '.cmp-page__skiptomaincontent',
      // Global header XF: <div class="experiencefragment aem-GridColumn ...">
      'div.experiencefragment.aem-GridColumn',
      '.cmp-experiencefragment--header',
      // Global footer XF (incl. newsletter band): <footer class="experiencefragment aem-GridColumn ...">
      'footer.experiencefragment.aem-GridColumn',
      '.cmp-experiencefragment--footer',
      // Hidden mobile "winning numbers" promo: <div class="html-promo parbase ...">
      '.html-promo.parbase',
      // Tracking pixels / non-content elements
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
