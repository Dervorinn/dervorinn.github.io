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
function loadTab(tabName) {
  fetch(`${tabName}.html`)
    .then(res => {
      if (!res.ok) throw new Error("Błąd ładowania: " + res.status);
      return res.text();
    })
    .then(html => {
      document.getElementById("tabContent").innerHTML = html;

      // 🔽 Załaduj odpowiedni skrypt
      if (tabName === "tab3") {
        loadScript("script3.js");
      }
      // jeśli masz inne skrypty do innych zakładek, możesz je tu dopisać
    })
    .catch(err => {
      document.getElementById("tabContent").innerHTML =
        `<p style="color:red;">Nie udało się załadować zakładki.<br>${err.message}</p>`;
    });
}

function loadScript(src) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) existing.remove(); // usuń stary, jeśli istnieje

  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  document.body.appendChild(script);
}

document.addEventListener("DOMContentLoaded", () => {
  loadTab("tab3");
});
