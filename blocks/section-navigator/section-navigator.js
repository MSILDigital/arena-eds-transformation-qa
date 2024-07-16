export default function decorate(block) {
  const sectionsCount = document.querySelectorAll('.overview-section').length;

  const nav = document.createElement('nav');
  for (let i = 1; i <= sectionsCount; i += 1) {
    const span = document.createElement('span');
    span.className = 'dot';
    span.setAttribute('data-section', i);
    nav.appendChild(span);
  }

  block.innerHTML = '';
  block.appendChild(nav);

  function activateDot(dotIndex) {
    dots.forEach((dot) => dot.classList.remove('active'));
    if (dots[dotIndex]) {
      dots[dotIndex].classList.add('active');
    }
  }
  const sections = document.querySelectorAll('.overview-section');
  const dots = document.querySelectorAll('.dot');
  const dotsContainer = block.querySelector('nav');
  window.addEventListener('scroll', () => {
    let currentIndex = 0;
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < window.innerHeight) {
        currentIndex = index - 1;
      }
    });
    activateDot(currentIndex);
  });
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    });
  });
  sections.forEach((section) => {
    section.addEventListener('mouseover', () => {
      dotsContainer.style.opacity = '1';
    });
    section.addEventListener('mouseout', () => {
      dotsContainer.style.opacity = '0';
    });
  });
}
