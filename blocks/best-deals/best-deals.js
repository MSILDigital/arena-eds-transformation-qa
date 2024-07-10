import utility from '../../utility/utility.js';
import teaser from '../../utility/teaserUtils.js';
import slider from '../../utility/sliderUtil.js';
import ctaUtils from '../../utility/ctaUtils.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const [
    titleEl,
    subtitleEl,
    ctaTextEl,
    ctaLinkEl,
    ctaTargetEl,
    ...teaserListEl
  ] = block.children;
  const sliderTitle = titleEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  const subtitle = subtitleEl?.textContent?.trim();
  const primaryCta = ctaUtils.getLink(ctaLinkEl, ctaTextEl, ctaTargetEl, 'button-primary-light');

  const teasers = teaserListEl.map((card) => {
    const teaserObj = teaser.getTeaser(card)?.firstElementChild;
    moveInstrumentation(card, teaserObj);
    utility.mobileLazyLoading(teaserObj, '.teaser__image img');
    return teaserObj.outerHTML;
  });

  const bestDealsHtml = `
        <div class="container container__slider">
          <div class="slider-header">
            ${sliderTitle ? sliderTitle.outerHTML : ''}
            <p>${subtitle}</p>
            <div>${primaryCta ? primaryCta.outerHTML : ''}</div>
          </div>
          <div class="teaser-content">
            <div class="btn-content">
              <button class="nav-arrow prev">←</button>
              <button class="nav-arrow next hide">→</button>
            </div>
            <div class="teaser__cards">
                ${teasers.join('')}
            </div>
          </div>
      </div>
    `;
  const parser = new DOMParser();
  const doc = parser.parseFromString(bestDealsHtml, 'text/html');
  const teaserCards = doc.querySelectorAll('.teaser__card');

  teaserCards.forEach((card) => {
    const actionsDiv = card.querySelector('.teaser__actions');
    const anchorTag = actionsDiv.querySelector('a');
    anchorTag.classList.remove('primary__btn', 'button');
    const anchorWrapper = anchorTag.cloneNode();

    actionsDiv.remove();

    anchorWrapper.innerHTML = card.outerHTML;
    card.replaceWith(anchorWrapper);
  });

  const updatedHtmlString = doc.body.innerHTML;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(updatedHtmlString));

  const sliderContainer = document.querySelector('.teaser__cards');
  const nextButton = document.querySelector('.prev');
  const prevButton = document.querySelector('.next');
  const boxes = document.querySelectorAll('.teaser__card');
  slider.initSlider(sliderContainer, prevButton, nextButton, boxes);
}
