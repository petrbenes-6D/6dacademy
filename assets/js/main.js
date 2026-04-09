// Hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.style.display === 'flex';
  navLinks.style.display = isOpen ? 'none' : 'flex';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '72px';
  navLinks.style.left = '0';
  navLinks.style.right = '0';
  navLinks.style.background = 'white';
  navLinks.style.flexDirection = 'column';
  navLinks.style.padding = '24px 5%';
  navLinks.style.borderBottom = '1px solid #eee';
  navLinks.style.gap = '20px';
});

// Contact form
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Odesláno ✓';
  btn.style.background = '#72c369';
  setTimeout(() => {
    btn.textContent = 'Odeslat zprávu';
    btn.style.background = '';
  }, 3000);
}