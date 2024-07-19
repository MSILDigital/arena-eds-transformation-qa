// teaser.js
import ctaUtils from '../../utility/ctaUtils.js';
import utility from '../../utility/utility.js';

export default function decorate(block) {
  function initImage(image, altTextEl) {
    const img = image.querySelector('img');
    img.removeAttribute('width');
    img.removeAttribute('height');
    const alt = altTextEl?.textContent?.trim() || 'image';
    img.setAttribute('alt', alt);
  }
  const [
    imageEl,
    altTextEl,
    pretitleEl,
    titleEl,
    descriptionEl,
    primaryCtaTextEl,
    primaryCtaLinkEl,
    primaryCtaTargetEl,
    secondaryCtaTextEl,
    secondaryCtaLinkEl,
    secondaryCtaTargetEl,
    themeEl,
    themeTypeEl,
  ] = block.children;
  const image = imageEl?.querySelector('picture');
  if (image) {
    initImage(image, altTextEl);
  }

  const pretitle = pretitleEl?.textContent?.trim();
  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  const description = Array.from(descriptionEl.querySelectorAll('p')).map((p) => p.outerHTML).join('');
  const primaryCta = ctaUtils.getLink(primaryCtaLinkEl, primaryCtaTextEl, primaryCtaTargetEl, 'button-primary-light');
  const secondaryCta = ctaUtils.getLink(secondaryCtaLinkEl, secondaryCtaTextEl, secondaryCtaTargetEl, 'secondary__btn');
  const theme = themeEl?.textContent?.trim();
  const themeType = themeTypeEl?.textContent?.trim();
  let ctaHtml = '';
  if (primaryCta || secondaryCta) {
    ctaHtml = `
                   <div class="teaser__actions">
                     ${(primaryCta) ? primaryCta.outerHTML : ''}
                     ${(secondaryCta) ? secondaryCta.outerHTML : ''}
                   </div>
                 `;
  }
  if (theme) {
    block.classList.add(theme);
  }
  if (themeType) {
    block.classList.add(themeType);
  }
  const newHtml = `
  <div class="container">
    <div class="teaser__card">
      ${(image) ? `${image.outerHTML}` : ''}
      <div class="teaser__content">
        <div class="teaser__info">
          ${(pretitle) ? `<div class="teaser__pretitle"><p>${pretitle}</p></div>` : ''}
          ${(title) ? `<div class="teaser__title">${title.outerHTML}</div>` : ''}
          ${(description) ? `<div class="teaser__description">${description}</div>` : ''}
        </div>
        ${ctaHtml}
      </div>
    </div>
  </div>
  `;
  block.innerHTML = '';
  block.insertAdjacentHTML(
    'beforeend',
    utility.sanitizeHtml(newHtml),
  );
}
