import { fetchPlaceholders } from "../../scripts/aem.js";
import utility from "../../utility/utility.js";
import ctaUtils from "../../utility/ctaUtils.js";
import slider from "../../utility/sliderUtil.js";

export default async function decorate(block) {
  async function fetchCar(endPoint, option) {
    const car = await fetch(endPoint, option);
    return car.json();
  }
  const { publishDomain } = await fetchPlaceholders();
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
  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/arenaVariantList;modelId=${
    modelIdEl.querySelector("p").textContent
  }`;
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  await fetchCar(graphQlEndpoint, requestOptions)
    .then((response) => {
      itemArray = [...response.data.variantList.items];
      filterArray = [...itemArray, ...itemArray, ...itemArray];
    })
    .catch(() => {});

  tabList = itemArray.reduce((acc, item) => {
    if (!acc.includes(item.fuelType)) {
      acc.push(item.fuelType);
    }
    return acc;
  }, []);
  tabList.unshift("ALL");
  const startingPriceText = startingPriceTextEl?.textContent?.trim();
  const primaryCta = ctaUtils.getLink(
    primaryCtaLinkEl,
    primaryCtaTextEl,
    primaryCtaTargetEl,
    "button-primary-light"
  );
  primaryCta.classList.add("button");
  const secondaryCta = ctaUtils.getLink(
    secondaryCtaLinkEl,
    secondaryCtaTextEl,
    secondaryCtaTargetEl,
    "button-secondary-light"
  );
  secondaryCta.classList.add("button");
  function createItemList() {
    let itemHtml = "";
    /* eslint no-underscore-dangle: 0 */
    filterArray.forEach((item) => {
      itemHtml += `<div class="variant__card">
        <div class="variant__image">
            <img alt="${item.variantName}" src="${publishDomain}${
        item.variantImage._dynamicUrl
      }" />
        </div>
        <div class="variant__content">
            <div class="variant__title">
                <p>${item.variantName}</p>
            </div>
            <div class="variant__description">
                <p>${item.mileage} Km/L | ${item.highlightFeatures.join(
        " | "
      )}</p>
            </div>
            <div class="variant__price">
                <p>${startingPriceText} <span>Rs. ${utility.formatINR(
        item.exShowroomPrice
      )}</span></p>
            </div>
        </div>
    </div>`;
    });
    return itemHtml;
  }
  const newHtml = `
  <div class="container container__slider">
      <div class="slider__tabContent">
        ${tabList
          .map((item, i) => {
            if (i < tabList.length - 1) {
              return `<div class='tab__Iteam'>${item}</div><span class='tab__Iteam__saperator'> / </span>`;
            }
            return `<div class='tab__Iteam'>${item}</div>`;
          })
          .join("")}
      </div>
      <div class="variant-content">
        <div class="button__content">
            <button class="nav-arrow prev hide"></button>
            <button class="nav-arrow next"></button>
        </div>
      <div class="variant__cards">
          ${createItemList()}
      </div>
      </div>
      <div class="cta__container">
      ${primaryCta ? primaryCta.outerHTML : ""}
      ${secondaryCta ? secondaryCta.outerHTML : ""}
      </div>
  </div>
  `;
  function tabClick() {
    block.querySelectorAll(".tab__Iteam").forEach((element) => {
      element.classList.remove("tab__active");
    });
    this.classList.add("tab__active");
    if (this.textContent === "ALL") {
      filterArray = [...itemArray, ...itemArray, ...itemArray];
    } else {
      filterArray = itemArray.filter(
        (element) => this.textContent === element.fuelType
      );
    }
    block.querySelector(".variant__cards").innerHTML = "";
    block
      .querySelector(".variant__cards")
      .insertAdjacentHTML("beforeend", utility.sanitizeHtml(createItemList()));
    const sliderContainer = block.querySelector(".variant__cards");
    const prevButton = block.querySelector(".prev");
    const nextButton = block.querySelector(".next");
    const boxes = block.querySelectorAll(".variant__card");
    slider.initSlider(sliderContainer, prevButton, nextButton, boxes, 1, 1);
  }
  block.innerHTML = "";
  block.insertAdjacentHTML("beforeend", utility.sanitizeHtml(newHtml));
  const sliderContainer = block.querySelector(".variant__cards");
  const prevButton = block.querySelector(".prev");
  const nextButton = block.querySelector(".next");
  const boxes = block.querySelectorAll(".variant__card");
  slider.initSlider(sliderContainer, prevButton, nextButton, boxes, 1, 1);
  block.querySelectorAll(".tab__Iteam").forEach((element, index) => {
    if (index === 0) {
      element.classList.add("tab__active");
    }
    element.addEventListener("click", tabClick, false);
  });
}