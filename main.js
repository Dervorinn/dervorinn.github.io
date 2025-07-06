function loadTab(tabName) {
  document.getElementById('tabFrame').src = tabName + '.html';
}
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.navbar-logo');
  const span = document.getElementById('logoText');

  const animateTextChange = (newText, newFontSize) => {
    span.classList.add('fade-out');

    setTimeout(() => {
      span.textContent = newText;
      span.style.fontSize = newFontSize;
      span.classList.remove('fade-out');
      span.classList.add('fade-in');

      setTimeout(() => {
        span.classList.remove('fade-in');
      }, 300);
    }, 300); 
  };
  if (logo && span) {
    logo.addEventListener('mouseenter', () => {
      animateTextChange('APP', '14px');
    });
    logo.addEventListener('mouseleave', () => {
      animateTextChange('K', '24px');
    });
  } else {
    console.error("Nie znaleziono logo lub span.");
  }
});