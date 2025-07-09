document.addEventListener("DOMContentLoaded", () => {
  loadTab("tab3");
  const logo = document.querySelector(".navbar-logo");
  const span = document.getElementById("logoText");

  const animateTextChange = (newText, newFontSize) => {
    span.classList.add("fade-out");
    setTimeout(() => {
      span.textContent = newText;
      span.style.fontSize = newFontSize;
      span.classList.remove("fade-out");
      span.classList.add("fade-in");
      setTimeout(() => {
        span.classList.remove("fade-in");
      }, 300);
    }, 300);
  };

  if (logo && span) {
    logo.addEventListener("mouseenter", () => {
      animateTextChange("APP", "14px");
    });
    logo.addEventListener("mouseleave", () => {
      animateTextChange("K", "24px");
    });
  }
});
function loadTab(tabName) {
  const tabContent = document.getElementById("tabContent");
  let tabDiv = document.getElementById(`container_${tabName}`);

  if (!tabDiv) {
    tabDiv = document.createElement("div");
    tabDiv.id = `container_${tabName}`;
    tabDiv.classList.add("tab-inner-content");
    tabDiv.style.display = "none";
    tabContent.appendChild(tabDiv);

    fetch(`${tabName}.html`)
      .then(res => {
        if (!res.ok) throw new Error("Błąd ładowania: " + res.status);
        return res.text();
      })
      .then(html => {
        tabDiv.innerHTML = html;
        loadTabScript(tabName);
        showTab(tabName);
      })
      .catch(err => {
        tabDiv.innerHTML = `<p style="color:red;">Nie udało się załadować zakładki.<br>${err.message}</p>`;
        showTab(tabName);
      });
  } else {
    showTab(tabName);
  }
}

function showTab(tabName) {
  document.querySelectorAll("#tabContent > div.tab-inner-content").forEach(div => {
    div.style.display = (div.id === `container_${tabName}`) ? "block" : "none";
  });
}

function loadTabScript(tabName) {
  let scriptName = null;
  switch (tabName) {
  case "tab1": scriptName = "script.js"; break;
  case "tab2": scriptName = "script2.js"; break;
  case "tab3": scriptName = "script3.js"; break;
  case "tab4": scriptName = "script4.js"; break;
  }

  if (scriptName) {
    const uniqueSrc = `${scriptName}?t=${Date.now()}`;
    loadScript(uniqueSrc, () => {
      const fnName = `initialize${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
      setTimeout(() => {
        if (typeof window[fnName] === "function") {
          window[fnName]();
        }
      }, 50);
    });
  }
}
function loadScript(src, callback) {
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
document.addEventListener("DOMContentLoaded", () => {
  const btnClear = document.getElementById("btnClear");
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      location.reload();
    });
  }
});