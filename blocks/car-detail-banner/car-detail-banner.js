import { fetchPlaceholders } from '../../scripts/aem.js';
import ctaUtils from '../../utility/ctaUtils.js';
import utility from '../../utility/utility.js';
import apiUtils from '../../utility/apiUtils.js';

export default async function decorate(block) {
  let carObject = null;
  const { publishDomain, apiKey } = await fetchPlaceholders();

  // Destructure children elements and hide them to avoid layout shift
  const [
    modelIdEl,
    bgImageEl,
    startingPriceTextEl,
    testDriveTextEl,
    scrollMoreTextEl,
    primaryCtaTextEl,
    primaryCtaLinkEl,
    primaryCtaTargetEl,
    secondaryCtaTextEl,
    secondaryCtaLinkEl,
    secondaryCtaTargetEl,
  ] = [...block.children];

  // Hide elements initially to avoid layout shifts
  const elementsToHide = [
    modelIdEl,
    bgImageEl,
    startingPriceTextEl,
    testDriveTextEl,
    scrollMoreTextEl,
    primaryCtaTextEl,
    primaryCtaLinkEl,
    primaryCtaTargetEl,
    secondaryCtaTextEl,
    secondaryCtaLinkEl,
    secondaryCtaTargetEl,
  ];

  elementsToHide.forEach((el) => el?.classList.add('hide'));
  const image = bgImageEl?.querySelector('picture');
  const img = image?.querySelector('img');
  img?.removeAttribute('width');
  img?.removeAttribute('height');
  const scrollMoreText = scrollMoreTextEl?.textContent?.trim();
  // Clear block innerHTML to prepare for new content
  block.innerHTML = '';
  block.innerHTML = utility.sanitizeHtml(`
    <div class="hero__banner">
      ${
  image ? `<div class="hero__banner--image">${image.outerHTML}</div>` : ''
}
      <div class="banner__content">
      </div>
    </div>
    <div class="hero__bottom-gradient">
      ${
  scrollMoreText
    ? `<div class="banner__scrollMoreText"><span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M5.625 8.3135L5.625 2.25H6.375L6.375 8.3135L9.22312 5.46538L9.75 6L6 9.75L2.25 6L2.77688 5.46538L5.625 8.3135Z" fill="white"/>
      </svg></span>${scrollMoreText}</div>`
    : ''
}
    </div>
  `);
  // Fetch the required data
  const modelId = modelIdEl?.textContent?.trim();
  const authorization = await apiUtils.fetchAuthorisationToken(publishDomain);

  let exShowroomPrices = apiUtils.getLocalStorage('modelPrice');
  if (!exShowroomPrices) {
    const apiresp = await apiUtils.fetchExShowroomPrices(
      apiKey,
      authorization,
      '48',
      '',
      'NRM',
      '',
    );
    if (apiresp) {
      exShowroomPrices = apiUtils.setLocalStorage(apiresp, '48', 'modelPrice');
    }
  }

  // Function to populate the banner
  function populateBanner(car) {
    const exShowroomPrice = exShowroomPrices
      ? utility.formatINR(exShowroomPrices[modelId].price['48'])
      : utility.formatINR(car?.exShowroomPrice);
    const carImage = publishDomain + car.carImage._dynamicUrl;
    const carLogoImage = car.carLogoImage._publishUrl;

    const startingPriceText = [...startingPriceTextEl.querySelectorAll('p')]
      .map((p) => p.outerHTML)
      .join('');
    const testDriveText = [...testDriveTextEl.querySelectorAll('p')]
      .map((p) => p.outerHTML)
      .join('');

    const primaryCta = ctaUtils.getLink(
      primaryCtaLinkEl,
      primaryCtaTextEl,
      primaryCtaTargetEl,
      'button-secondary-dark',
    );
    const secondaryCta = ctaUtils.getLink(
      secondaryCtaLinkEl,
      secondaryCtaTextEl,
      secondaryCtaTargetEl,
      'button-secondary-light',
    );

    let ctaHtml = '';
    if (primaryCta || secondaryCta) {
      ctaHtml = `
        <div class="banner__actions">
          ${primaryCta ? primaryCta.outerHTML : ''}
          ${secondaryCta ? secondaryCta.outerHTML : ''}
        </div>
      `;
    }
    const bannerContent = `<div class="banner__info container">
    ${
  car.carDescription
    ? `<div class="banner__carDescription">${car.carDescription}</div>`
    : ''
}
    ${
  carLogoImage && car.altText
    ? `<div class="banner__carLogoImage"><img src="${carLogoImage}" alt="${car.altText}"></div>`
    : ''
}
    ${
  startingPriceText
    ? `<div class="banner__startingPriceText"><p>${startingPriceText}</p></div>`
    : ''
}
    ${
  exShowroomPrice
    ? `<div class="banner__exShowroomPrice">${exShowroomPrice}</div>`
    : ''
}
    ${
  testDriveText
    ? `<div class="banner__testDriveText">${testDriveText}</div>`
    : ''
}
    ${
  carImage && car.altText
    ? `<div class="banner__carImage"><img src="${carImage}" alt="${car.altText}"></div>`
    : ''
}
    ${ctaHtml}
  </div>`;
    block.querySelector('.banner__content').innerHTML = utility.sanitizeHtml(bannerContent);
  }

  // Fetch car details and populate the banner
  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/carDetailBanner;modelCd=${modelId}`;
  fetch(graphQlEndpoint, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((result) => {
      carObject = result?.data?.carModelList?.items[0];
      populateBanner(carObject);
    })
    .catch((error) => console.error('Error fetching car details:', error));
}
