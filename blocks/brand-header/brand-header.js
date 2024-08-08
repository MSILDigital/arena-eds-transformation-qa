import ctaUtils from '../../utility/ctaUtils.js';
import utility from '../../utility/utility.js';

export default async function decorate(block) {
  const [
    logoImageEl,
    primaryCtaTextEl,
    primaryCtaLinkEl,
    primaryCtaTargetEl,
    secondaryCtaTextEl,
    secondaryCtaLinkEl,
    secondaryCtaTargetEl,
    ...headerItems
  ] = block.children;

  let headerItemsHtml = '';

  headerItems.forEach((element) => {
    const [titleEl, scrollClassEl] = element.children;
    const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
    const scrollCLass = scrollClassEl?.textContent?.trim();
    const headerItemHtml = `  <div class="brand-header__header-item">
                                ${
  title
    ? `<div ${
      scrollCLass ? `name=${scrollCLass}` : ''
    } class="brand-header__title">${
      title.outerHTML
    }</div>`
    : ''
}
                            </div>
                            `;
    headerItemsHtml += headerItemHtml;
  });
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

  const image = logoImageEl?.querySelector('picture');
  const img = image.querySelector('img');
  img.removeAttribute('width');
  img.removeAttribute('height');

  let ctaHtml = '';
  if (primaryCta || secondaryCta) {
    ctaHtml = `
                     <div class="brand-header__actions">
                       ${primaryCta ? primaryCta.outerHTML : ''}
                       ${secondaryCta ? secondaryCta.outerHTML : ''}
                     </div>
                   `;
  }

  block.innerHTML = '';
  block.insertAdjacentHTML(
    'beforeend',
    utility.sanitizeHtml(`
                   <div class="brand-header-container">
                       ${
  image
    ? `<div class="brand-header__logo">${image.outerHTML}</div>`
    : ''
}
                       
                            <div class="brand-header__items">
                                ${headerItemsHtml}
                            </div>
                       ${ctaHtml}
                      
                   </div>
             `),
  );

  const sectionNames = [];
  const links = document.querySelectorAll('.brand-header__title');

  function activeHandler() {
    links.forEach((l) => l.classList.remove('active'));
    this.classList.add('active');
    const targetClass = this.getAttribute('name');
    sectionNames.push(targetClass);
    const targetElement = targetClass
      ? document.querySelector(`.${targetClass}`)
      : null;
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }

  links.forEach((link) => {
    link.addEventListener('click', activeHandler);
    sectionNames.push(link.getAttribute('name'));
  });

  let sticky;
  let navbar;
  let mainHeader;
  let sections;
  let currentIndex = -1;

  // sticky brand header

  function stickyHandler() {
    if (window.pageYOffset >= sticky) {
      navbar?.classList?.add('sticky');
      mainHeader?.classList?.remove('sticky');
      currentIndex = 0;
    } else {
      navbar?.classList?.remove('sticky');
      mainHeader?.classList?.add('sticky');
      currentIndex = undefined;
    }
  }

  function updateActiveLink() {
    let found = false;
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const isInViewport = rect.top - 66 < 0 && rect.bottom >= 0
      && rect.top + 66 < window.innerHeight;
      if (isInViewport && section.classList.contains('overview-section') && index < 5) {
        currentIndex = 0;
        found = true;
      } else if (isInViewport && !section.classList.contains('overview-section') && index > 4) {
        if (!found) {
          currentIndex = index - 4;
          found = true;
        }
      }
    });
    if (!found) {
      currentIndex = -1;
    }
  }

  function activateDot() {
    links.forEach((l) => l.classList.remove('active'));
    if (links[currentIndex]) {
      links[currentIndex].classList.add('active');
    }
  }

  window.addEventListener('scroll', () => {
    currentIndex = 0;
    stickyHandler();
    updateActiveLink();
    activateDot();
  });

  function addBrandLinkSection() {
    const overviewSection = document.querySelectorAll('.car-detail-feature-container.overview-section ');
    overviewSection.forEach((l) => l.classList.add('brandlink'));
  }

  setTimeout(() => {
    navbar = block?.querySelector('.brand-header-container');
    mainHeader = document.querySelector('.header-wrapper');
    sticky = navbar?.getBoundingClientRect().top;
    addBrandLinkSection();
    sections = document.querySelectorAll('.brandlink');
  }, 3000);
}
