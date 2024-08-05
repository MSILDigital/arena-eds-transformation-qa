import { fetchPlaceholders } from '../../scripts/aem.js';
import utility from '../../utility/utility.js';
import ctaUtils from '../../utility/ctaUtils.js';
import slider from '../../utility/sliderUtil.js';
import apiUtils from '../../utility/apiUtils.js';

export default async function decorate(block) {
  async function fetchCar(endPoint, option) {
    const car = await fetch(endPoint, option);
    return car.json();
  }
  const { publishDomain, apiKey } = await fetchPlaceholders();
  let itemArray = [];
  let filterArray = [];
  let tabList = [];
  const [
    modelIdEl,
    startingPriceTextEl,
    primaryCtaTextEl,
    primaryCtaLinkEl,
    primaryCtaTargetEl,
    secondaryCtaTextEl,
    secondaryCtaLinkEl,
    secondaryCtaTargetEl,
  ] = block.children;
  const forCode = '48';
  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/arenaVariantList;modelCd=${
    modelIdEl.querySelector('p').textContent
  }`;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  await fetchCar(graphQlEndpoint, requestOptions)
    .then((response) => {
      itemArray = [...response.data.carVariantList.items];
      filterArray = [...itemArray];
    })
    .catch(() => {});
  const modelId = modelIdEl.querySelector('p').textContent;
  const authorization = await apiUtils.fetchAuthorisationToken(publishDomain);
  let exShowroomPrices = apiUtils.getLocalStorage('varientPrice');
  if (!exShowroomPrices) {
    const apiresp = await apiUtils.fetchExShowroomPrices(apiKey, authorization, forCode, modelId, 'NRM', true);
    if (apiresp) {
      exShowroomPrices = apiUtils.setLocalStorageVarientList(apiresp, forCode, 'varientPrice');
    }
  }

  tabList = itemArray.reduce((acc, item) => {
    if (!acc.includes(item.fuelType)) {
      acc.push(item.fuelType);
    }
    return acc;
  }, []);
  tabList.unshift('ALL');
  const startingPriceText = startingPriceTextEl?.textContent?.trim();
  const primaryCta = ctaUtils.getLink(
    primaryCtaLinkEl,
    primaryCtaTextEl,
    primaryCtaTargetEl,
    'button-primary-light',
  );
  primaryCta.classList.add('button');
  const secondaryCta = ctaUtils.getLink(
    secondaryCtaLinkEl,
    secondaryCtaTextEl,
    secondaryCtaTargetEl,
    'button-secondary-light',
  );
  secondaryCta.classList.add('button');
  function createItemList() {
    let itemHtml = '';
    /* eslint no-underscore-dangle: 0 */
    filterArray.forEach((item) => {
      let exShowroomPrice;
      const { variantCd } = item;
      try {
        const varientPrice = Object.values(exShowroomPrices[variantCd]).find((color) => color.colorType === 'M')?.price[forCode];
        if (exShowroomPrices && varientPrice) {
          exShowroomPrice = utility.formatINR(varientPrice);
        } else {
          exShowroomPrice = utility.formatINR(item.exShowroomPrice);
        }
      } catch {
        exShowroomPrice = utility.formatINR(item.exShowroomPrice);
      }

      itemHtml += `<div class="variant__card">
        <div class="variant__image">
            <img alt="${item.variantDesc}" src="${publishDomain}${
  item.variantImage._dynamicUrl
}" />
        </div>
        <div class="variant__content">
            <div class="variant__title">
                <p>${item.variantDesc}</p>
            </div>
            <div class="variant__description">
                <p>${item.fuelEfficiency} | ${item.highlightFeatures.join(
  ' | ',
)}</p>
            </div>
            <div class="variant__price">
                <p>${startingPriceText} <span>Rs. ${
  exShowroomPrice
}</span></p>
            </div>
        </div>
    </div>`;
    });
    return itemHtml;
  }
  const newHtml = `
  <div class="button__content">
  <button class="nav-arrow_variant prev_variant disabled"></button>
  <button class="nav-arrow_variant next_variant"></button>
  </div>
  <div class="container container__slider">
      <div class="slider__tabContent">
        ${tabList
    .map((item, i) => {
      if (i < tabList.length - 1) {
        return `<div class='tab__Iteam'>${item}</div><span class='tab__Iteam__saperator'> / </span>`;
      }
      return `<div class='tab__Iteam'>${item}</div>`;
    })
    .join('')}
      </div>
      <div class="variant-content">
       
      <div class="variant__cards">
          ${createItemList()}
      </div>
      </div>
      <div class="cta__container">
      ${primaryCta ? primaryCta.outerHTML : ''}
      ${secondaryCta ? secondaryCta.outerHTML : ''}
      </div>
  </div>
  `;
  function tabClick() {
    block.querySelectorAll('.tab__Iteam').forEach((element) => {
      element.classList.remove('tab__active');
    });
    this.classList.add('tab__active');
    if (this.textContent === 'ALL') {
      filterArray = [...itemArray, ...itemArray, ...itemArray];
    } else {
      filterArray = itemArray.filter(
        (element) => this.textContent === element.fuelType,
      );
    }
    block.querySelector('.variant__cards').innerHTML = '';
    block
      .querySelector('.variant__cards')
      .insertAdjacentHTML('beforeend', utility.sanitizeHtml(createItemList()));
    const sliderContainer = block.querySelector('.variant__cards');
    const prevButton = block.querySelector('.prev_variant');
    const nextButton = block.querySelector('.next_variant');
    const boxes = block.querySelectorAll('.variant__card');
    slider.initSlider(sliderContainer, prevButton, nextButton, boxes, 1, 1, 'disabled');
  }
  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));
  block.classList.add('brandlink');
  const sliderContainer = block.querySelector('.variant__cards');
  const prevButton = block.querySelector('.prev_variant');
  const nextButton = block.querySelector('.next_variant');
  const boxes = block.querySelectorAll('.variant__card');
  slider.initSlider(sliderContainer, prevButton, nextButton, boxes, 1, 1, 'disabled');
  block.querySelectorAll('.tab__Iteam').forEach((element, index) => {
    if (index === 0) {
      element.classList.add('tab__active');
    }
    element.addEventListener('click', tabClick, false);
  });
}
