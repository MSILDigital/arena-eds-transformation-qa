import ctaUtils from '../../utility/ctaUtils.js';
import { fetchPlaceholders } from '../../scripts/aem.js';
import utility from '../../utility/utility.js';
import apiUtils from '../../utility/apiUtils.js';

const SVG_IMAGE = {
  pre_btn: `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path d="M12.2883 21.25H32.5V18.75H12.2883L21.7821 9.25625L20 7.5L7.5 20L20 32.5L21.7821 30.7437L12.2883 21.25Z" fill="#171C8F"/>
</svg>
`,
  next_btn: `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path d="M27.7117 21.25H7.5V18.75H27.7117L18.2179 9.25625L20 7.5L32.5 20L20 32.5L18.2179 30.7437L27.7117 21.25Z" fill="#171C8F"/>
</svg>
`,
  title_cover_yellow: `
<svg xmlns="http://www.w3.org/2000/svg" width="75" height="29" viewBox="0 0 75 29" fill="none">
  <path d="M74 9.15094V1H1V28H74V24.434" stroke="#FFD85C" stroke-width="2"/>
</svg>
`,
  title_cover_blue: `
<svg xmlns="http://www.w3.org/2000/svg" width="75" height="29" viewBox="0 0 75 29" fill="none">
  <path d="M74 9.15094V1H1V28H74V24.434" stroke="#171C8F" stroke-width="2"/>
</svg>
`,
};

async function fetchCar(domain) {
  const car = await fetch(
    `${domain}/graphql/execute.json/msil-platform/arenaBannerList`,
  );
  // eslint-disable-next-line
  return await car.json();
}

function priceFormatting(price) {
  return utility.formatToLakhs(price);
}

export default async function decorate(block) {
  const { publishDomain, apiKey } = await fetchPlaceholders();
  const carResponse = await fetchCar(publishDomain);
  let isDesktop = window.innerWidth > 998;
  let currentIndex = 0;
  let cardsPerPage = isDesktop ? 3 : 1;
  let highlightedSidebar = null;
  const forCode = '48';

  const carsObject = carResponse?.data?.carModelList?.items?.reduce(
    (acc, car) => {
      acc[car.modelId] = car;
      return acc;
    },
    {},
  );

  const authorization = await apiUtils.fetchAuthorisationToken(publishDomain);
  let exShowroomPrices = apiUtils.getLocalStorage('modelPrice');
  if (!exShowroomPrices) {
    const apiresp = await apiUtils.fetchExShowroomPrices(
      apiKey,
      authorization,
      forCode,
      '',
      'NRM',
      '',
    );
    if (apiresp) {
      exShowroomPrices = apiUtils.setLocalStorage(
        apiresp,
        forCode,
        'modelPrice',
      );
    }
  }

  const [bGImgContainer, ...carList] = block.children;

  function updateHtml(isBGImgContainer, isCarList) {
    const carContainersWrapper = document.createElement('div');

    const bgImg = isBGImgContainer.querySelector('picture');
    const imgEl = bgImg.querySelector('img');
    imgEl.setAttribute('width', '100%');
    imgEl.removeAttribute('height');

    isCarList.forEach((element) => {
      const [
        title,
        modelId,
        type,
        onRoadPrice,
        primaryCtaTextEl,
        primaryCtaLinkEl,
        primaryCtaTargetEl,
        secondaryCtaTextEl,
        secondaryCtaLinkEl,
        secondaryCtaTargetEl,
      ] = element.children;

      const carObjectItem = carsObject[modelId.textContent];
      const modelCode = carObjectItem?.modelId;
      const exShowroomPrice = exShowroomPrices
        ? priceFormatting(
          exShowroomPrices[modelCode]?.price[forCode],
        )?.replaceAll(',', ' ')
        : priceFormatting(carObjectItem?.exShowroomPrice);
      const [firstLetterTitle, ...rest] = title.textContent.split(' ');
      const restTitle = rest.join(' ');

      const primaryCta = ctaUtils.getLink(
        primaryCtaLinkEl,
        primaryCtaTextEl,
        primaryCtaTargetEl,
        '',
      );
      const secondaryCta = ctaUtils.getLink(
        secondaryCtaLinkEl,
        secondaryCtaTextEl,
        secondaryCtaTargetEl,
        '',
      );
      /* eslint no-underscore-dangle: 0 */
      carContainersWrapper.innerHTML += `
        <div class="car-container">
          <div class="sidebar-container">
            <img
              src=${carObjectItem?.carImage?._publishUrl || ''}
              alt=${carObjectItem?.carName || ''}
              class="sidebar-car--image"
            />
            <div class="sidebar">
              <div class="sidebar_text_container">
                <div class="text-container">
                  <span>${firstLetterTitle || ''} ${restTitle || ''}</span>
                </div>
                <img
                  src=${carObjectItem?.carLogoImage?._publishUrl || ''}
                  alt=${carObjectItem?.carName || ''}
                  class="sidebar-car--logo"
                />
                  <span><strong>${carObjectItem?.bodyType}</strong> | ${
  type?.textContent || ''
}</span>
                <div class="sidebar--hr"></div>
                <div class="sidebar--details">
                  <div class="sidebar--details--exshowroom">
                    <span>Ex. showroom:</span>
                      <span><strong>${exShowroomPrice || ''}</strong></span>
                  </div>
                  <div class="sidebar--details--onroad">
                    <span>Estd. On-road in Gurgaon:</span>
                      <span><strong>${
  onRoadPrice?.textContent || ''
}</strong></span>
                  </div>
                </div>
                <div class="buttons">
                  ${primaryCta ? primaryCta.outerHTML : ''}
                  ${secondaryCta ? secondaryCta.outerHTML : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    const heroBannerWrapper = `
      <div class="hero_banner_container_wrapper">
        ${bgImg.outerHTML}
        <div class="hero_banner_container">
          <button class="pre-btn">${SVG_IMAGE.pre_btn}</button>
          <button class="nxt-btn">${SVG_IMAGE.next_btn}</button>
          ${carContainersWrapper.innerHTML}
        </div>
      </div>
    `;

    block.innerHTML = heroBannerWrapper;
  }

  function initializeEventListeners() {
    const nxtBtn = document.querySelector('.nxt-btn');
    const preBtn = document.querySelector('.pre-btn');
    preBtn.disabled = true;

    const cards = document.querySelectorAll('.car-container');
    const cardCount = cards.length;

    if (cardCount - cardsPerPage === 0) {
      nxtBtn.disabled = true;
    }

    function addImgToTitleDesktop(indexSidebar, sideBarItem) {
      switch (indexSidebar) {
        case 0:
          sideBarItem.classList.add('left_sidebar');
          sideBarItem
            .querySelector('.text-container')
            .insertAdjacentHTML('afterbegin', SVG_IMAGE.title_cover_blue);
          break;
        case 1:
          sideBarItem.classList.add('mid_sidebar');
          sideBarItem
            .querySelector('.text-container')
            .insertAdjacentHTML('afterbegin', SVG_IMAGE.title_cover_yellow);
          break;
        case 2:
          sideBarItem.classList.add('right_sidebar');
          sideBarItem
            .querySelector('.text-container')
            .insertAdjacentHTML('afterbegin', SVG_IMAGE.title_cover_yellow);
          break;
        default:
          break;
      }
    }

    function addImgToTitleMobile(sideBarItem) {
      sideBarItem
        .querySelector('.text-container')
        .insertAdjacentHTML('afterbegin', SVG_IMAGE.title_cover_yellow);
    }

    function handleMouseEnter(event) {
      if (highlightedSidebar) {
        highlightedSidebar.classList.remove('highlight');
      }

      highlightedSidebar = event;
      highlightedSidebar.classList.add('highlight');
    }

    function handleMouseLeave() {
      if (highlightedSidebar) {
        highlightedSidebar.classList.remove('highlight');
      }
      const middleIndex = currentIndex + Math.floor(cardsPerPage / 2);
      if (middleIndex < cards.length) {
        highlightedSidebar = cards[middleIndex];
        highlightedSidebar.classList.add('highlight');
      }
    }

    function toggleDisableNxtPrvBtn(isCurrentIndex, totalCount) {
      if (isCurrentIndex === 0) {
        preBtn.disabled = true;
      } else {
        preBtn.disabled = false;
      }
      if (isCurrentIndex === totalCount - cardsPerPage) {
        nxtBtn.disabled = true;
      } else {
        nxtBtn.disabled = false;
      }
    }

    function showCards(index) {
      cards.forEach((card, i) => {
        const indexSidebar = i - index;
        const sideBarItem = card.querySelector('.sidebar');
        if (isDesktop) {
          addImgToTitleDesktop(indexSidebar, sideBarItem);
        } else {
          addImgToTitleMobile(sideBarItem);
        }
        card.classList.remove('show');
        if (i >= index && i < index + cardsPerPage) {
          card.classList.add('show');
          card
            .querySelector('.sidebar-container')
            .addEventListener('mouseenter', () => {
              handleMouseEnter(card);
            });
          card
            .querySelector('.sidebar-container')
            .addEventListener('mouseleave', () => {
              handleMouseLeave(card);
            });
        }
      });

      const middleIndex = Math.floor(cardsPerPage / 2);
      if (index + middleIndex < cards.length) {
        cards[index + middleIndex].classList.add('highlight');
        highlightedSidebar = cards[index + middleIndex];
      }
    }

    function addBullets(isCardCount, isCardsPerPage) {
      const bullets = document.createElement('div');
      bullets.classList.add('bullets');
      bullets.id = 'bullets';

      for (let i = 0; i < isCardCount; i += isCardsPerPage) {
        bullets.innerHTML += `<input id="bullet" type="radio" ${
          i === 0 ? 'checked' : ''
        } />`;
      }

      document
        .querySelector('.hero_banner_container_wrapper')
        .appendChild(bullets);
    }

    nxtBtn.addEventListener('click', () => {
      if (currentIndex + cardsPerPage < cards.length) {
        currentIndex += cardsPerPage;
        const pageCount = Math.floor(currentIndex / cardsPerPage);
        const isBullets = document.querySelector('#bullets').children;
        isBullets[pageCount - 1].checked = false;
        isBullets[pageCount].checked = true;
        toggleDisableNxtPrvBtn(currentIndex, cardCount);
        showCards(currentIndex);
      }
    });

    preBtn.addEventListener('click', () => {
      if (currentIndex - cardsPerPage >= 0) {
        currentIndex -= cardsPerPage;
        const pageCount = Math.floor(currentIndex / cardsPerPage);
        const isBullets = document.querySelector('#bullets').children;
        isBullets[pageCount + 1].checked = false;
        isBullets[pageCount].checked = true;
        toggleDisableNxtPrvBtn(currentIndex, cardCount);
        showCards(currentIndex);
      }
    });

    addBullets(cardCount, cardsPerPage);
    showCards(currentIndex);
  }

  function handleResize() {
    const newIsDesktop = window.innerWidth > 998;
    if (newIsDesktop !== isDesktop) {
      isDesktop = newIsDesktop;
      cardsPerPage = isDesktop ? 3 : 1;
      currentIndex = 0;
      updateHtml(bGImgContainer, carList);
      initializeEventListeners();
    }
  }

  window.addEventListener('resize', handleResize);

  updateHtml(bGImgContainer, carList);
  initializeEventListeners();
}
