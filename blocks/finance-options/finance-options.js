import utility from '../../utility/utility.js';
import teaser from '../../utility/teaserUtils.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const [titleEl, ...teaserListEl] = block.children;
  const heading = titleEl?.textContent?.trim();

  const teasers = teaserListEl.map((card) => {
    const teaserObj = teaser.getTeaser(card)?.firstElementChild;
    moveInstrumentation(card, teaserObj);
    utility.mobileLazyLoading(teaserObj, '.teaser__image img');
    return teaserObj.outerHTML;
  });

  const newHtml = `
        <div class="container">
        ${(heading) ? `<div class="finance__heading"><h2>${heading}</h2></div>` : ''}
            <div class="teaser-content">
                <div class="teaser__cards">
                     ${teasers.join('')}
                </div>
            </div>
        </div>
        `;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));
}
