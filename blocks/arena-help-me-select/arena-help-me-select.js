import utility from '../../utility/utility.js';
import teaser from '../../utility/teaserUtils.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const [...teaserListEl] = block.children;
  const teasers = teaserListEl.map((card) => {
    const teaserObj = teaser.getTeaser(card)?.firstElementChild;
    moveInstrumentation(card, teaserObj);
    utility.mobileLazyLoading(teaserObj, '.teaser__image img');
    return teaserObj.outerHTML;
  });

  const newHtml = `
            <div class="teaser-content">
                <div class="teaser__cards">
                     ${teasers.join('')}
                </div>
        </div>
        `;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));

  const buttons = document.querySelectorAll('.primary__btn');

  buttons.forEach((button) => {
    button.classList.remove('primary__btn');
    button.classList.add('button-primary-light');
  });
}
