import ctaUtils from "../../utility/ctaUtils.js";
import utility from "../../utility/utility.js";
import { fetchPlaceholders } from "../../scripts/aem.js";

async function fetchCar(domain) {
  const car = await fetch(
    `${domain}/graphql/execute.json/msil-platform/arenaPerformance?modelId=BZ`
  );
  return car.json();
}

function generateVariantList(carData) {
  if (!carData || !carData.data) {
    return "";
  }
  const variantItems = carData.data.variantList.items
    .map(
      (car) => `
      <li>
        <p>${car.variantName}</p>
        <p>${car.mileage}</p>
      </li>
    `
    )
    .join("");

  return `<ul>${variantItems}</ul>`;
}

export default async function decorate(block) {
  const [
    imageEl,
    titleEl,
    descriptionEl,
    ctaTextEl,
    ctaLinkEl,
    ctaTargetEl,
    featureTypeEl,
  ] = block.children;

  const image = imageEl?.querySelector("picture");
  if (image) {
    const img = image.querySelector("img");
    img.removeAttribute("width");
    img.removeAttribute("height");
  }

  const title = titleEl?.querySelector(":is(h1,h2,h3,h4,h5,h6)");
  const description = Array.from(descriptionEl.querySelectorAll("p"))
    .map((p) => p.outerHTML)
    .join("");
  const cta = ctaUtils.getLink(
    ctaLinkEl,
    ctaTextEl,
    ctaTargetEl,
    "button-primary-light"
  );
  const featureType = featureTypeEl?.textContent?.trim();

  let ctaHtml = "";
  if (cta) {
    ctaHtml = `
                     <div class="cta__actions">
                       ${cta ? cta.outerHTML : ""}
                     </div>
                   `;
  }
  let variantData = "";

  if (featureType) {
    block.classList.add(featureType);
    // Fetch Car Variant for 'feature-performance'
    if (featureType === "feature-performance") {
      const { publishDomain } = await fetchPlaceholders();
      const carData = await fetchCar(publishDomain);
      variantData = generateVariantList(carData);
    }
  }

  block.innerHTML = "";
  block.insertAdjacentHTML(
    "beforeend",
    utility.sanitizeHtml(`
                       <div class="feature__card">
                           ${
                             image
                               ? `<div class="feature__image">${image.outerHTML}</div>`
                               : ""
                           }
                           ${
                             variantData
                               ? '<div class="bottom__image"></div>'
                               : ""
                           }
                           <div class="feature__content">
                           ${
                             variantData
                               ? `<div class="feature__variant">${variantData}</div>`
                               : ""
                           }
                               <div class="feature__info">
                                   ${
                                     title
                                       ? `<div class="feature__title">${title.outerHTML}</div>`
                                       : ""
                                   }
                                   ${
                                     description
                                       ? `<div class="feature__description">${description}</div>`
                                       : ""
                                   }
                               </div>
                               ${ctaHtml}
                           </div>
                       </div>
                 `)
  );
  block.classList.add("container");

  // Select all <li> elements under ".car-detail-feature.feature-performance .feature__variant ul"
  const listItems = document.querySelectorAll(
    ".car-detail-feature.feature-performance .feature__variant ul li"
  );

  // Loop through each <li> element
  listItems.forEach((li) => {
    // Select all <p> elements within the current <li>
    const paragraphs = li.querySelectorAll("p");

    // Get the last <p> element within the current <li>
    const lastParagraph = paragraphs[paragraphs.length - 1];

    // Check if there is a last <p> element and it doesn't already contain a <span>
    if (lastParagraph && !lastParagraph.querySelector("span")) {
      // Create a <span> element
      const spanElement = document.createElement("span");
      spanElement.textContent = " km/l"; // Add text content to the <span> element

      // Append the <span> element to the last <p> element
      lastParagraph.appendChild(spanElement);
    }
  });
}
