document.addEventListener("DOMContentLoaded", () => {
  // 🔽 1. Wczytaj domyślny tab
  loadTab("tab3");

  // 🔽 2. Obsługa logo
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

// 🔽 Funkcja do ładowania zakładek
function loadTab(tabName) {
  fetch(`${tabName}.html`)
    .then(res => {
      if (!res.ok) throw new Error("Błąd ładowania: " + res.status);
      return res.text();
    })
    .then(html => {
      const content = document.getElementById("tabContent");
      if (!content) {
        console.error("Brak elementu #tabContent w DOM");
        return;
      }

      content.innerHTML = html;

      // 🔽 Dobierz odpowiedni skrypt do zakładki
      let scriptName = null;
      switch (tabName) {
        case "tab1":
          scriptName = "script1.js";
          break;
        case "tab2":
          scriptName = "script2.js";
          break;
        case "tab3":
          scriptName = "script3.js";
          break;
        case "tab4":
          scriptName = "script4.js";
          break;
      }

      if (scriptName) {
        // 🔽 Ładuj i uruchom funkcję inicjalizującą
        setTimeout(() => {
          loadScript(scriptName, () => {
            const fnName = `initialize${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
            if (typeof window[fnName] === "function") {
              window[fnName]();
            } else {
              console.warn(`Funkcja ${fnName}() nie istnieje.`);
            }
          });
        }, 50);
      }
    })
    .catch(err => {
      document.getElementById("tabContent").innerHTML =
        `<p style="color:red;">Nie udało się załadować zakładki.<br>${err.message}</p>`;
    });
}

// 🔽 Funkcja do ładowania skryptu JS z callbackiem
function loadScript(src, callback) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) existing.remove();

  const script = document.createElement("script");
  script.src = src;
  script.defer = true;

  script.onload = () => {
    if (typeof callback === "function") callback();
  };

  script.onerror = () => {
    console.error(`Nie udało się załadować skryptu: ${src}`);
  };

  document.body.appendChild(script);
}
