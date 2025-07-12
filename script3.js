/* eslint-disable no-unused-vars */
window.hydrantJsonData = window.hydrantJsonData || [];
window.pressureToggleState = false;
function loadHydrantJsonAutomatically() {
  fetch("hydrantykato.json")
    .then(response => response.json())
    .then(data => {
      window.hydrantJsonData = data;

      const datalist = document.getElementById("hydrant-ulice");
      if (!datalist) {
        console.warn("Brak datalist #hydrant-ulice w DOM!");
        return;
      }

      datalist.innerHTML = "";
      const uliceSet = new Set(data.map(h => h.adres || h.ulica || h.Ulica).filter(Boolean));
      for (const adres of uliceSet) {
        const option = document.createElement("option");
        option.value = adres;
        datalist.appendChild(option);
      }

      console.log("Hydranty załadowane:", window.hydrantJsonData.length);
    })
    .catch(err => {
      console.error("Błąd ładowania hydrantów:", err);
    });
}

window.optionsMap = window.optionsMap || {
  interactiveText1: [
    "SKKM PSP w Katowicach przyjęło zgłoszenie na numer miejski",
    "SKKM PSP w Katowicach przyjęło formatkę monitoringu o treści",
    "SKKM PSP w Katowicach otrzymało zgłoszenie telefoniczne",
    "SKKM PSP w Katowicach przyjęło formatkę SI WCPR o treści"
  ],
  interactiveText2: [
    "Sytuacja zastana/rozpoznanie",
    "Sytuacja zastana",
    "Rozpoznanie"
  ]
};

window.menu = document.getElementById("menu");
window.myślniki = document.getElementById("myślniki");

function addResponderLine() {
  const line = document.createElement("div");
  line.className = "responder-line";

  line.innerHTML = `
    <span class="interactive responder-label">-</span>
    <span class="responder-text" data-selected="[]"></span>
    <button 
      class="delete-btn" 
      title="Usuń linię" 
      contenteditable="false" 
      draggable="false" 
      unselectable="on"
      aria-hidden="true"
      style="margin-left:10px; user-select: none; -webkit-user-select: none; -moz-user-select: none;"
    >
      🗑️
    </button>
  `;

  line.querySelector(".delete-btn").addEventListener("click", () => {
    line.remove();
    updateAllResponderPunctuation();
  });

  window.myślniki.appendChild(line);
  setupInteractiveHandlers();
  updateAllResponderPunctuation();
}

function addActionLine() {
  const line = document.createElement("div");
  line.className = "responder-line";

  line.innerHTML = `
    <span class="interactive action-label">-</span>
    <span class="action-text" data-custom=""></span>
    <button 
      class="delete-btn" 
      title="Usuń linię" 
      contenteditable="false" 
      draggable="false" 
      unselectable="on"
      aria-hidden="true"
      style="margin-left:10px; user-select: none; -webkit-user-select: none; -moz-user-select: none;"
    >
      🗑️
    </button>
  `;

  line.querySelector(".delete-btn").addEventListener("click", () => {
    line.remove();
    updateAllActionPunctuation();
  });

  document.getElementById("dzialaniaContainer").appendChild(line);
  setupInteractiveHandlers();
  updateAllActionPunctuation();
}

function updateRespondersText(textSpan, selected) {
  let text = selected.join(", ");
  if (textSpan.dataset.custom) {
    text = textSpan.dataset.custom;
  } else if (text === "KPP") {
    text = "nikt nie uskarża się na żadne dolegliwości - brak wskazań do KPP.";
  } else if (text) {
    text += " na miejscu";
    if (!text.endsWith(".")) text += ".";
  }
  textSpan.textContent = text;
  updateAllResponderPunctuation();
}

function updateAllResponderPunctuation() {
  const lines = [...window.myślniki.querySelectorAll(".responder-line")];
  lines.forEach((line, i) => {
    const span = line.querySelector(".responder-text");
    if (!span) return;
    const txt = span.textContent.replace(/[.,]$/, "");
    span.textContent = txt + (i === lines.length - 1 ? "." : ",");
  });
}

function updateActionText(textSpan, text) {
  if (text) {
    text = text.endsWith(".") ? text : text + ".";
    textSpan.textContent = text;
    textSpan.dataset.custom = text;
    updateAllActionPunctuation();
  }
}

function updateAllActionPunctuation() {
  const lines = [...document.querySelectorAll("#dzialaniaContainer .responder-line")];
  lines.forEach((line, i) => {
    const span = line.querySelector(".action-text");
    if (!span) return;
    const txt = span.textContent.replace(/[.,]$/, "");
    span.textContent = txt + (i === lines.length - 1 ? "." : ",");
  });
}

function renderCheckboxMenu(textSpan) {
  window.menu.innerHTML = "";

  const selected = new Set(JSON.parse(textSpan.dataset.selected || "[]"));

  const groupedCheckboxes = {
    "👮‍♂️ Służby": ["ZRM", "Policja", "Straż Miejska", "Pogotowie gazowe", "Pomoc Drogowa", "Patrol Autostradowy"],
    "🏢 Osoby cywilne": ["zgłaszający", "brak zgłaszającego", "właściciel", "administracja",],
  };

  const updateOutput = () => {
    const list = Array.from(selected).join(", ");
    textSpan.textContent = list ? list + "." : "";
    textSpan.dataset.selected = JSON.stringify(Array.from(selected));
    delete textSpan.dataset.custom;
    updateRespondersText?.(textSpan, Array.from(selected));
  };

  Object.entries(groupedCheckboxes).forEach(([groupName, options]) => {
    const groupLi = document.createElement("li");
    groupLi.textContent = groupName;
    groupLi.className = "category collapsed";

    const subList = document.createElement("ul");
    subList.style.listStyle = "none";
    subList.style.paddingLeft = "0";
    subList.style.margin = "0";
    subList.style.width = "100%";
    subList.style.boxSizing = "border-box";
    subList.className = "subcategory";

    options.forEach(option => {
      const li = document.createElement("li");
      li.style.listStyle = "none";
      li.style.margin = "0";
      li.style.padding = "0";

      const label = document.createElement("label");
      label.style.display = "flex";
      label.style.alignItems = "center";
      label.style.gap = "8px";
      label.style.padding = "6px 10px";
      label.style.width = "100%";
      label.style.boxSizing = "border-box";
      label.style.textAlign = "left";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = option;
      checkbox.checked = selected.has(option);
      checkbox.type = "checkbox";
      checkbox.value = option;
      checkbox.checked = selected.has(option);

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          selected.add(option);
        } else {
          selected.delete(option);
        }
        updateOutput();
      });

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(" " + option));
      li.appendChild(label);
      subList.appendChild(li);
    });

    groupLi.onclick = (e) => {
      e.stopPropagation();
      const expanded = groupLi.classList.toggle("expanded");
      groupLi.classList.toggle("collapsed", !expanded);
      subList.classList.toggle("show", expanded);
    };

    window.menu.appendChild(groupLi);
    window.menu.appendChild(subList);
  });

  const kppCategory = document.createElement("li");
  kppCategory.textContent = "🩺 KPP";
  kppCategory.className = "category collapsed";

  const kppList = document.createElement("ul");
  kppList.className = "subcategory";

  const kppSentences = [
    {
      text: "Nikt nie uskarża się na żadne dolegliwości – brak wskazań do KPP.",
      selected: ["KPP"]
    },
  ];

  kppSentences.forEach(({ text, selected }) => {
    const item = document.createElement("li");
    item.textContent = text;
    item.addEventListener("click", () => {
      textSpan.dataset.custom = text;
      textSpan.textContent = text;
      textSpan.dataset.selected = JSON.stringify([]);
      updateRespondersText?.(textSpan, []);
    });
    kppList.appendChild(item);
  });

  kppCategory.onclick = (e) => {
    e.stopPropagation();
    const expanded = kppCategory.classList.toggle("expanded");
    kppCategory.classList.toggle("collapsed", !expanded);
    kppList.classList.toggle("show", expanded);
  };

  window.menu.appendChild(kppCategory);
  window.menu.appendChild(kppList);

  const sytuacjaCategory = document.createElement("li");
  sytuacjaCategory.textContent = "📋 Sytuacja";
  sytuacjaCategory.className = "category collapsed";

  const sytuacjaList = document.createElement("ul");
  sytuacjaList.className = "subcategory";

  const sytuacjaSentences = [
    {
      text: "sytuacja zgodna ze zgłoszeniem",
      selected: ["sytuacja zgodna z zgłoszeniem"]
    },
    { text: "brak innych służb na miejscu",
      selected: ["Brak innych służb"]
    }
  ];

  sytuacjaSentences.forEach(({ text, selected }) => {
    const item = document.createElement("li");
    item.textContent = text;
    item.addEventListener("click", () => {
      textSpan.dataset.custom = text;
      textSpan.textContent = text;
      textSpan.dataset.selected = JSON.stringify([]);
      updateRespondersText?.(textSpan, []);
    });
    sytuacjaList.appendChild(item);
  });

  sytuacjaCategory.onclick = (e) => {
    e.stopPropagation();
    const expanded = sytuacjaCategory.classList.toggle("expanded");
    sytuacjaCategory.classList.toggle("collapsed", !expanded);
    sytuacjaList.classList.toggle("show", expanded);
  };

  window.menu.appendChild(sytuacjaCategory);
  window.menu.appendChild(sytuacjaList);

  const kolizjaCategory = document.createElement("li");
  kolizjaCategory.textContent = "🚘 Drogowe";
  kolizjaCategory.className = "category collapsed";

  const kolizjaList = document.createElement("ul");
  kolizjaList.className = "subcategory";

  const kolizjaSentences = [
    {
      text: "kolizja samochodu osobowego z barierą energochłonną.",
      selected: ["kolizja z barierą"]
    },
    {
      text: "kierowca poza pojazdem.",
      selected: ["kierowca poza pojazdem"]
    },
    {
      text: "plama płynów eksploatacyjnych na jezdni (wielkość plamy)",
      selected: ["plama płynów eksploatacyjnych"]
    },
    {
      text: "plama substancji powodujacej śliskość jezdni (wielkość plamy)",
      selected: ["plama substancji"]
    },
    {
      text: "prośba o zadysponowanie dodatkowych SiŚ (jakich)",
      selected: ["dodatkowe siś"]
    },
  ];

  kolizjaSentences.forEach(({ text, selected }) => {
    const item = document.createElement("li");
    item.textContent = text;
    item.addEventListener("click", () => {
      textSpan.dataset.custom = text;
      textSpan.textContent = text;
      textSpan.dataset.selected = JSON.stringify([]);
      updateRespondersText?.(textSpan, []);
    });
    kolizjaList.appendChild(item);
  });

  kolizjaCategory.onclick = (e) => {
    e.stopPropagation();
    const expanded = kolizjaCategory.classList.toggle("expanded");
    kolizjaCategory.classList.toggle("collapsed", !expanded);
    kolizjaList.classList.toggle("show", expanded);
  };

  window.menu.appendChild(kolizjaCategory);
  window.menu.appendChild(kolizjaList);

  const pozarCategory = document.createElement("li");
  pozarCategory.textContent = "🔥 Pożary";
  pozarCategory.className = "category collapsed";

  const pozarList = document.createElement("ul");
  pozarList.className = "subcategory";

  const pozarSentences = [
    {
      text: "brak zewnętrznych oznak pożaru",
      selected: ["brak oznak"]
    },
    {
      text: "pożar (traw,śmieci) na nieużytkach o wielkości __ mkw.",
      selected: ["pożar traw"]
    },
    {
      text: "prośba o zadysponowanie dodatkowych SiŚ (jakich)",
      selected: ["dodatkowe siś"]
    },
    {
      text: "mieszkanie przewietrzone przed przybyciem JOP",
      selected: ["mieszkanie przewietrzone"]
    },
    {
      text: "mieszkanie nr ___ zamknięte brak kontaktu z lokatorem/ką",
      selected: ["mieszkanie zamknięte"]
    },
    {
      text: "lokatorzy mieszkania na zewnątrz",
      selected: ["lokatorzy na zewnątrz"]
    },
  ];

  pozarSentences.forEach(({ text, selected }) => {
    const item = document.createElement("li");
    item.textContent = text;
    item.addEventListener("click", () => {
      textSpan.dataset.custom = text;
      textSpan.textContent = text;
      textSpan.dataset.selected = JSON.stringify([]);
      updateRespondersText?.(textSpan, []);
    });
    pozarList.appendChild(item);
  });

  pozarCategory.onclick = (e) => {
    e.stopPropagation();
    const expanded = pozarCategory.classList.toggle("expanded");
    pozarCategory.classList.toggle("collapsed", !expanded);
    pozarList.classList.toggle("show", expanded);
  };

  window.menu.appendChild(pozarCategory);
  window.menu.appendChild(pozarList);

  const tlenekCategory = document.createElement("li");
  tlenekCategory.textContent = "💨 Tlenek";
  tlenekCategory.className = "category collapsed";

  const tlenekList = document.createElement("ul");
  tlenekList.className = "subcategory";

  const tlenekSentences = [
    {
      text: "mieszkanie przewietrzone przed przybyciem JOP",
      selected: ["mieszkanie przewietrzone"]
    },
    {
      text: "mieszkanie nr ___ zamknięte brak kontaktu z lokatorem/ką",
      selected: ["mieszkanie zamknięte"]
    },
    {
      text: "lokatorzy mieszkania na zewnątrz",
      selected: ["lokatorzy na zewnątrz"]
    },
    {
      text: "prośba o zadysponowanie dodatkowych SiŚ (jakich)",
      selected: ["dodatkowe siś"]
    },
  ];

  tlenekSentences.forEach(({ text, selected }) => {
    const item = document.createElement("li");
    item.textContent = text;
    item.addEventListener("click", () => {
      textSpan.dataset.custom = text;
      textSpan.textContent = text;
      textSpan.dataset.selected = JSON.stringify([]);
      updateRespondersText?.(textSpan, []);
    });
    tlenekList.appendChild(item);
  });

  tlenekCategory.onclick = (e) => {
    e.stopPropagation();
    const expanded = tlenekCategory.classList.toggle("expanded");
    tlenekCategory.classList.toggle("collapsed", !expanded);
    tlenekList.classList.toggle("show", expanded);
  };

  window.menu.appendChild(tlenekCategory);
  window.menu.appendChild(tlenekList);

  const otwarcieCategory = document.createElement("li");
  otwarcieCategory.textContent = "🏢🔐 Otwarcie";
  otwarcieCategory.className = "category collapsed";

  const otwarcieList = document.createElement("ul");
  otwarcieList.className = "subcategory";

  const otwarcieSentences = [
    {
      text: "mieszkanie nr ___ zamknięte brak kontaktu z lokatorem/ką",
      selected: ["mieszkanie zamknięte"]
    },
    {
      text: "prośba o zadysponowanie dodatkowych SiŚ (jakich)",
      selected: ["dodatkowe siś"]
    },
  ];

  otwarcieSentences.forEach(({ text, selected }) => {
    const item = document.createElement("li");
    item.textContent = text;
    item.addEventListener("click", () => {
      textSpan.dataset.custom = text;
      textSpan.textContent = text;
      textSpan.dataset.selected = JSON.stringify([]);
      updateRespondersText?.(textSpan, []);
    });
    otwarcieList.appendChild(item);
  });

  otwarcieCategory.onclick = (e) => {
    e.stopPropagation();
    const expanded = otwarcieCategory.classList.toggle("expanded");
    otwarcieCategory.classList.toggle("collapsed", !expanded);
    otwarcieList.classList.toggle("show", expanded);
  };

  window.menu.appendChild(otwarcieCategory);
  window.menu.appendChild(otwarcieList);

  const manual = document.createElement("input");
  manual.type = "text";
  manual.placeholder = "Wpisz własną...";
  manual.addEventListener("click", e => e.stopPropagation());
  manual.addEventListener("input", () => {
    const val = manual.value.trim();
    if (val) {
      const formatted = val.endsWith(".") ? val : val + ".";
      textSpan.dataset.custom = formatted;
      textSpan.textContent = formatted;
      textSpan.dataset.selected = JSON.stringify([]);
      updateRespondersText?.(textSpan, []);
    }
  });
  window.menu.appendChild(manual);
}

function setupInteractiveHandlers() {
  document.querySelectorAll(".interactive").forEach(el => {
    el.onclick = (e) => {
      const rect = el.getBoundingClientRect();
      window.menu.style.top = `${rect.bottom + window.scrollY}px`;
      window.menu.style.left = `${rect.left + window.scrollX}px`;
      window.menu.style.display = "block";
      window.menu.innerHTML = "";

      if (el.classList.contains("responder-label")) {
        renderCheckboxMenu(el.nextElementSibling);

      } else if (el.classList.contains("action-label")) {
        const textSpan = el.nextElementSibling;

        const grouped = {
          "🚗Drogowe": [
            "zabezpieczeniu miejsca zdarzenia",
            "oświetleniu terenu działań",
            "odłączeniu klem akumulatora",
            "sorpcji plamy powodującej śliskość jezdni - zużyty sorbent zebrano celem przekazania do utylizacji",
            "uprzątnięciu elementów karoserii z jezdni",
            "neutralizacji plamy płynów powodujących śliskość jezdni przy pomocy sintanu  - jezdnie zmyto jednym prądem wody",
          ],
          "🔥Pożary": [
            "zabezpieczeniu miejsca zdarzenia",
            "podaniu jednego prądu wody w natarciu",
            "podaniu jednego prądu piany ciężkiej",
            "sprawdzeniu pogorzeliska przy użyciu kamery termowizyjnej - brak wzrostu temperatury względem otoczenia",
            "ugaszeniu palących się śmieci jednym prądem wody z hydronetki",
          ],
          "💨Tlenek": [
            "zabezpieczeniu miejsca zdarzenia",
            "wykonaniu pomiarów na obecność tlenku węgla w mieszkaniu nr ___ oraz w mieszkaniach w tym samym pionie mieszkalnym",
          ],
          "🏢🔐Otwarcie": [
            "zabezpieczeniu miejsca zdarzenia",
            "siłowym otwarciu mieszkania nr __",
            "siłowym otwarciu mieszkania nr __ na prośbę Policji",
            "wyłamaniu wkładki do mieszkania nr __",
            "wyłamaniu wkładki do mieszkania nr __ na prośbę Policji "
          ],
          "🌳Drzewo": [
            "zabezpieczeniu miejsca zdarzenia",
            "usunięciu złamanej gałęzi przy pomocy ___",
            "usunięciu złamanego konara przy pomocy ___",
            "usunięciu złamanego drzewa przy pomocy ___",
            "złożeniu pociętego drewna na terenie zielonym w miejscu bezpiecznym"
          ],
          "🐝OSP": [
            "zabezpieczeniu miejsca zdarzenia",
            "usunięciu gniazda os (jak, skąd)"
          ]
        };

        Object.entries(grouped).forEach(([category, actions]) => {
          const catItem = document.createElement("li");
          catItem.textContent = category;
          catItem.className = "category collapsed";

          const subList = document.createElement("ul");
          subList.className = "subcategory";

          actions.forEach(action => {
            const subItem = document.createElement("li");
            subItem.textContent = action;
            subItem.onclick = () => {
              updateActionText(textSpan, action);
              window.menu.style.display = "none";
            };
            subList.appendChild(subItem);
          });

          catItem.onclick = (e) => {
            e.stopPropagation();
            const expanded = catItem.classList.toggle("expanded");
            catItem.classList.toggle("collapsed", !expanded);
            subList.classList.toggle("show", expanded);
          };

          window.menu.appendChild(catItem);
          window.menu.appendChild(subList);
        });

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Wpisz własną...";
        input.addEventListener("click", ev => ev.stopPropagation());
        input.addEventListener("input", () => {
          updateActionText(textSpan, input.value.trim());
        });
        window.menu.appendChild(input);

      } else if (el.id === "defaultText") {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Opis zdarzenia...";
        let rawText = el.textContent.replace(/[„”]/g, "").trim();
        if (rawText === "wpisz opis zdarzenia...") rawText = "";
        input.value = rawText;
        input.addEventListener("click", ev => ev.stopPropagation());
        input.addEventListener("input", () => {
          el.textContent = `„${input.value}”`;
        });
        window.menu.appendChild(input);
      }

      else if (["interactiveText1", "interactiveText2"].includes(el.id)) {
        const options = window.optionsMap?.[el.id] || [];
        options.forEach(opt => {
          const li = document.createElement("li");
          li.textContent = opt + ":";
          li.onclick = () => {
            el.textContent = opt + ":";
            window.menu.style.display = "none";
          };
          window.menu.appendChild(li);
        });

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "(Zamienia nagłówek)";
        input.addEventListener("click", ev => ev.stopPropagation());
        input.addEventListener("input", () => {
          el.textContent = input.value.trim() + ":";
        });
        window.menu.appendChild(input);
      }

      else if (el.id === "przekazanie") {
        const options = [
          "Miejsce zdarzenia przekazano o godz. __ p. _____ z zaleceniem _________",
          "Miejsce zdarzenia wraz z zaleceniem ___________ przekazano.",
          "Miejsca zdarzenia nie przekazano ze względu na fakt, iż służbą wiodącą była Policja, o czym poinformowano SKKM.",
          "Miejsca zdarzenia nie przekazano ze względu na brak podjętych działań ratowniczych, o czym poinformowano SKKM.",
          "Miejsca zdarzenia nie przekazano ze względu na charakter zdarzenia i brak szkód, o czym poinformowano SKKM.",
          "Miejsca zdarzenia nie przekazano ze względu na brak właściciela obiektu na miejscu zdarzenia, o czym poinformowano SKKM.",
          "Miejsca zdarzenia nie przekazano ze względu na mnogość zdarzeń, o czym poinformowano SKKM.",
          "Miejsce zdarzenia bez zaleceń przekazano ___ o godz. _  "
        ];

        options.forEach(opt => {
          const li = document.createElement("li");
          li.textContent = opt;
          li.onclick = () => {
            el.textContent = opt;
            window.menu.style.display = "none";
          };
          window.menu.appendChild(li);
        });

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Wpisz własną treść...";
        input.addEventListener("click", e => e.stopPropagation());
        input.addEventListener("input", () => {
          el.textContent = input.value;
        });
        window.menu.appendChild(input);
      }

      else if (el.classList.contains("poziom-label")) {
        const textSpan = el.nextElementSibling;
        window.stopnieOptions.forEach(opt => {
          const li = document.createElement("li");
          li.textContent = opt;
          li.onclick = () => {
            textSpan.dataset.stopien = opt;
            updatePoziomText(textSpan);
          };
          window.menu.appendChild(li);
        });
        const inputName = document.createElement("input");
        inputName.type = "text";
        inputName.placeholder = "Imię i nazwisko";
        inputName.addEventListener("click", e => e.stopPropagation());
        inputName.addEventListener("input", () => {
          textSpan.dataset.name = inputName.value;
          updatePoziomText(textSpan);
        });
        window.menu.appendChild(inputName);
        const inputFrom = document.createElement("input");
        const inputTo = document.createElement("input");
        function formatHour(value) {
          value = value.replace(/[^\d:]/g, "");
          if (value.length === 2) {
            value += ":";
          } else if (value.length > 5) {
            value = value.slice(0, 5);
          }
          return value;
        }
        inputFrom.addEventListener("input", () => {
          inputFrom.value = formatHour(inputFrom.value);
          textSpan.dataset.from = inputFrom.value;
          updatePoziomText(textSpan);
        });

        inputTo.addEventListener("input", () => {
          inputTo.value = formatHour(inputTo.value);
          textSpan.dataset.to = inputTo.value;
          updatePoziomText(textSpan);
        });

        window.menu.appendChild(document.createTextNode(" od "));
        window.menu.appendChild(inputFrom);
        window.menu.appendChild(document.createTextNode(" do "));
        window.menu.appendChild(inputTo);

        const dup = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            checkbox.checked = false;
            addPoziomLine(true);
          }
        });
        dup.appendChild(checkbox);
        dup.appendChild(document.createTextNode(" Powiel"));
        window.menu.appendChild(dup);

      } else if (el.classList.contains("kdr-text")) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = el.dataset.korzystał === "tak";

        const label = document.createElement("label");
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" KDR korzystał"));

        checkbox.addEventListener("change", (event) => {
          event.stopPropagation();
          el.dataset.korzystał = checkbox.checked ? "tak" : "nie";
          el.textContent = checkbox.checked
            ? "Zgodnie z Rozporządzeniem Rady Ministrów z dnia 4 lipca 1992 r. w sprawie zakresu i trybu korzystania z praw przez kierującego działaniem ratowniczym KDR skorzystał z uprawnienia do zarządzenia:"
            : "KDR nie korzystał z praw określonych w Rozporządzeniu Rady Ministrów z dnia 4 lipca 1992 r. w sprawie zakresu i trybu korzystania z praw kierującego działaniem ratowniczym.";
          el.parentElement.dataset.final = "true";
          const prawaContainer = el.parentElement.querySelector(".kdr-rights-container");
          if (checkbox.checked) {
            if (!prawaContainer) {
              const newContainer = document.createElement("div");
              newContainer.className = "kdr-rights-container";
              el.parentElement.appendChild(newContainer);
            }
            window.menu.style.display = "none";
            setTimeout(() => el.click(), 0);
          } else {
            if (prawaContainer) prawaContainer.remove();
          }
        });
        window.menu.appendChild(label);

        if (el.dataset.korzystał === "tak") {
          const kdrRights = [
            { id: "kdrEvac", label: "Ewakuacja ludzi", text: "ewakuacji ludzi z rejonu objętego działaniem ratowniczym w przypadku zagrożenia życia i zdrowia" },
            { id: "kdrBanStay", label: "Zakaz przebywania", text: "zakazu przebywania w rejonie objętym działaniem ratowniczym osób postronnych oraz utrudniających prowadzenie działania ratowniczego" },
            { id: "kdrEvacProp", label: "Ewakuacja mienia", text: "ewakuacji mienia" },
            { id: "kdrDemol", label: "Prace wyburzeniowe", text: "prac wyburzeniowych oraz rozbiórkowych" },
            { id: "kdrCommBlock", label: "Blokada komunikacji", text: "wstrzymania komunikacji w ruchu lądowym" },
            { id: "kdrAcceptUse", label: "Użytkowanie zasobów", text: "przyjęcia w użytkowanie, na czas niezbędny do działania ratowniczego, pojazdów, środków technicznych i innych przedmiotów, a także ujęć wody, środków gaśniczych oraz nieruchomości przydatnych w działaniu ratowniczym, z wyjątkiem przypadków określonych w art. 24 ustawy z dnia 24 sierpnia 1991 r. o ochronie przeciwpożarowej (Dz. U. Nr 81, poz 351)" },
            { id: "kdrAbandonRules", label: "Odstąpienie od zasad", text: "odstąpienia od zasad uznanych za bezpieczne" }
          ];

          const rights = kdrRights
            .filter(r => document.getElementById(r.id)?.checked)
            .map(r => r.text);

          if (rights.length > 0) {
            const formattedRights = rights.map((item, index) => {
              const isLast = index === rights.length - 1;
              return `- ${item}${isLast ? "." : ","}`;
            }).join("");

            window.outputText += `\n${formattedRights}`;
          }

          const container = document.createElement("div");
          container.style.paddingTop = "8px";

          const currentContainer = el.parentElement.querySelector(".kdr-rights-container");
          if (!currentContainer) {
            const newContainer = document.createElement("div");
            newContainer.className = "kdr-rights-container";
            el.parentElement.appendChild(newContainer);
          }

          kdrRights.forEach(opt => {
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.id = opt.id;

            const lbl = document.createElement("label");
            lbl.style.display = "block";
            lbl.style.fontSize = "13px";
            lbl.style.cursor = "pointer";
            lbl.appendChild(cb);
            lbl.appendChild(document.createTextNode(" " + opt.label));
            container.appendChild(lbl);

            cb.addEventListener("change", () => {
              const rights = kdrRights
                .filter(r => document.getElementById(r.id)?.checked)
                .map(r => r.text);

              if (rights.length > 0) {
                const formattedRights = rights.map((item, index) => {
                  const isLast = index === rights.length - 1;
                  return `- ${item}${isLast ? "." : ","}`;
                }).join("<br>");

                el.parentElement.querySelector(".kdr-rights-container").innerHTML = formattedRights;
              } else {
                el.parentElement.querySelector(".kdr-rights-container").innerHTML = "";
              }
            });
          });

          window.menu.appendChild(container);
        }
      } else if (el.classList.contains("hydrant-label")) {
        const span = el.nextElementSibling;

        const fields = [
          { label: "Typ", key: "typ", options: ["podziemny", "nadziemny"] },
          { label: "Stan", key: "stan", options: ["sprawny", "niesprawny"] },
          { label: "Oznakowanie", key: "ozn", options: ["oznakowany", "nieoznakowany"] }
        ];

        fields.forEach(field => {
          const container = document.createElement("div");
          container.style.padding = "4px 0";

          const title = document.createElement("strong");
          title.textContent = field.label + ": ";
          container.appendChild(title);

          field.options.forEach(option => {
            const label = document.createElement("label");
            label.style.marginRight = "12px";
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = field.key + "-" + span.dataset.lineId;
            radio.value = option;
            radio.checked = span.dataset[field.key] === option;

            radio.addEventListener("change", () => {
              span.dataset[field.key] = option;
              updateHydrantText(span);
            });

            label.appendChild(radio);
            label.append(" " + option);
            container.appendChild(label);
          });

          window.menu.appendChild(container);
        });

        const ulInput = document.createElement("input");
        ulInput.placeholder = "Wpisz adres...";
        ulInput.style.border = "1px solid #ccc";
        ulInput.style.padding = "6px";
        ulInput.style.fontSize = "14px";
        ulInput.style.borderRadius = "4px";
        ulInput.style.width = "100%";
        ulInput.style.boxSizing = "border-box";
        ulInput.value = span.dataset.ul || "";
        window.menu.appendChild(ulInput);

        const ulList = document.createElement("ul");
        ulList.className = "suggestion-list";
        ulList.style.position = "absolute";
        ulList.style.maxHeight = "200px";
        ulList.style.overflowY = "auto";
        ulList.style.listStyle = "none";
        ulList.style.padding = "0";
        ulList.style.margin = "2px 0";
        ulList.style.zIndex = "10000";
        ulList.style.width = "calc(100% - 4px)";
        ulInput.after(ulList);

        ulInput.addEventListener("input", () => {
          const query = ulInput.value.toLowerCase();
          ulList.innerHTML = "";

          if (!query) return;

          const results = window.hydrantJsonData
            .map(h => h.adres)
            .filter(adres => adres.toLowerCase().includes(query))
            .slice(0, 10);

          results.forEach(adres => {
            const li = document.createElement("li");
            li.textContent = adres;
            li.style.padding = "6px 10px";
            li.style.cursor = "pointer";
            li.addEventListener("click", () => {
              ulInput.value = adres;
              ulList.innerHTML = "";
              span.dataset.ul = adres;
              const hydrant = window.hydrantJsonData.find(h => h.adres === adres);
              if (hydrant) {
                span.dataset.typ = hydrant.typ;
                span.dataset.stan = hydrant.stan;
                span.dataset.ozn = hydrant.ozn;
              }
              window.menu.querySelectorAll("input[type=radio]").forEach(radio => {
                if (
                  (radio.name.startsWith("typ") && radio.value === hydrant.typ) ||
                  (radio.name.startsWith("stan") && radio.value === hydrant.stan) ||
                  (radio.name.startsWith("ozn") && radio.value === hydrant.ozn)
                ) {
                  radio.checked = true;
                }
              });

              updateHydrantText(span);
            });
            ulList.appendChild(li);
          });
        });
        document.addEventListener("click", (e) => {
          if (!window.menu.contains(e.target)) {
            ulList.innerHTML = "";
          }
        });
        const infoLine = document.createElement("div");
        infoLine.textContent = "Autopodpowiedź - Spis był generowany automatycznie, może zawierać błędy.";
        infoLine.style.fontSize = "13px";
        infoLine.style.marginBottom = "4px";
        infoLine.style.color = "#444";
        window.menu.appendChild(infoLine);
        ulInput.setAttribute("list", "hydrant-ulice");
        ulInput.placeholder = "Wpisz adres...";
        ulInput.style.display = "block";
        ulInput.style.marginBottom = "6px";
        ulInput.value = span.dataset.ul || "";

        ulInput.addEventListener("click", ev => ev.stopPropagation());
        ulInput.addEventListener("input", () => {
          span.dataset.ul = ulInput.value;
          const hydrant = window.hydrantJsonData.find(h => h.adres === ulInput.value);
          if (hydrant) {
            span.dataset.typ = hydrant.typ;
            span.dataset.stan = hydrant.stan;
            span.dataset.ozn = hydrant.ozn;
            window.menu.querySelectorAll("input[type=radio]").forEach(radio => {
              if (
                (radio.name.startsWith("typ") && radio.value === hydrant.typ) ||
                (radio.name.startsWith("stan") && radio.value === hydrant.stan) ||
                (radio.name.startsWith("ozn") && radio.value === hydrant.ozn)
              ) {
                radio.checked = true;
              }
            });
          }

          updateHydrantText(span);
        });
        window.menu.appendChild(ulInput);

        const datalist = document.createElement("datalist");
        datalist.id = "hydrant-ulice";
        window.menu.appendChild(datalist);

        const checkboxOptions = [
          {
            key: "niskaTemp",
            label: "Nie sprawdzono ze względu na ujemną temperaturę"
          },
          {
            key: "wieleZdarzen",
            label: "Nie sprawdzono ze względu na mnogość zdarzeń"
          },
          {
            key: "niezlokalizowano",
            label: "W promieniu 200m nie zlokalizowano"
          }
        ];

        checkboxOptions.forEach(opt => {
          const label = document.createElement("label");
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = span.dataset[opt.key] === "true";

          checkbox.addEventListener("change", () => {
            span.dataset[opt.key] = checkbox.checked ? "true" : "false";
            updateHydrantText(span);
          });

          label.appendChild(checkbox);
          label.appendChild(document.createTextNode(" " + opt.label));
          window.menu.appendChild(label);
        });

      }
      if (el.id === "weatherResult") {
        const formGroup = document.createElement("div");
        formGroup.innerHTML = `
<label>Temp. (°C): <input type="text" id="temperatureInput" style="width: 60px;"></label><br>
<label>Warunki:
  <select id="weatherConditionSelect">
    <option value="">-- wybierz --</option>
    <option value="brak opadów">brak opadów</option>
    <option value="brak zachmurzenia">brak zachmurzenia</option>
    <option value="zachmurzenie - częściowe">zachmurzenie - częściowe</option>
    <option value="zachmurzenie - całkowite">zachmurzenie - całkowite</option>
    <option value="mgła">mgła</option>
    <option value="opad deszczu">opad deszczu</option>
    <option value="opad śniegu">opad śniegu</option>
  </select>
</label><br>
<label>Wiatr (km/h): <input type="text" id="windSpeedInput" style="width: 60px;"></label>
<span id="windSpeedMS">(~0 m/s)</span><br>
<label>Kierunek:
  <select id="windDirSelect">
    <option value="">-- wybierz --</option>
    <option value="północny">północny</option>
    <option value="północno-wschodni">północno-wschodni</option>
    <option value="wschodni">wschodni</option>
    <option value="południowo-wschodni">południowo-wschodni</option>
    <option value="południowy">południowy</option>
    <option value="południowo-zachodni">południowo-zachodni</option>
    <option value="zachodni">zachodni</option>
    <option value="północno-zachodni">północno-zachodni</option>
  </select>
</label><br>
<label><input type="checkbox" id="pressureToggle"> Uwzględnij ciśnienie</label><br>
<input type="text" id="pressureVal" placeholder="Ciśnienie (hPa)" style="width: 100px;">
  `;

        window.menu.appendChild(formGroup);

        const updateLive = () => {
          const t = document.getElementById("temperatureInput").value.trim();
          const w = document.getElementById("weatherConditionSelect").value;
          const ws = document.getElementById("windSpeedInput").value.trim();
          const wd = document.getElementById("windDirSelect").value;
          const pressureEnabled = document.getElementById("pressureToggle").checked;
          const pressureVal = document.getElementById("pressureVal").value.trim();

          const result = document.getElementById("weatherResult");

          const ms = ws && !isNaN(ws) ? (parseFloat(ws) * 0.27778).toFixed(1) : "0";
          document.getElementById("windSpeedMS").textContent = `(~${ms} m/s)`;

          const parts = [];

          if (t) parts.push(`Temp. ${t}°C`);
          if (w) parts.push(w);

          if (ws && wd) {
            parts.push(`wiatr ${ws} km/h ${wd}`);
          } else if (ws && !wd) {
            parts.push(`wiatr ${ws} km/h`);
          } else if (!ws && wd) {
            parts.push(`wiatr z kierunku ${wd}`);
          }

          if (pressureEnabled && pressureVal) {
            parts.push(`${pressureVal} hPa`);
          }

          result.innerText = parts.length ? parts.join(", ") + "." : "Kliknij tutaj, aby edytować pogodę";
        };
        if (window.weatherDataAuto) {
          const tIn = document.getElementById("temperatureInput");
          const wsIn = document.getElementById("windSpeedInput");
          const wdSel = document.getElementById("windDirSelect");
          const pVal = document.getElementById("pressureVal");
          const pToggle = document.getElementById("pressureToggle");

          if (tIn) tIn.value = window.weatherDataAuto.t;
          if (wsIn) wsIn.value = window.weatherDataAuto.ws;
          if (wdSel) wdSel.value = window.weatherDataAuto.wd;
          if (pVal) pVal.value = window.weatherDataAuto.p;
          if (pToggle) pToggle.checked = false;
          const fireEvent = (el, type = "input") => {
            if (el) el.dispatchEvent(new Event(type));
          };

          fireEvent(tIn);
          fireEvent(wsIn);
          fireEvent(wdSel, "change");
          fireEvent(pVal);
          fireEvent(pToggle, "change");
        }

        ["temperatureInput", "weatherConditionSelect", "windSpeedInput", "windDirSelect"].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener("input", updateLive);
            el.addEventListener("change", updateLive);
          } else {
            console.warn(`Element #${id} nie istnieje w DOM`);
          }
        });
        const pressureToggle = document.getElementById("pressureToggle");
        if (pressureToggle) {
          pressureToggle.checked = window.pressureToggleState || false;
          pressureToggle.addEventListener("change", (e) => {
            window.pressureToggleState = e.target.checked;
            updateLive();
          });
        }

        const pressureVal = document.getElementById("pressureVal");
        if (pressureVal) {
          pressureVal.addEventListener("input", updateLive);
        }

        e.stopPropagation();
        return;
      }
      else if (el.classList.contains("kanal-kom")) {
        const kanały = ["B004", "B025", "B028", "B049", "B050",];

        kanały.forEach(opt => {
          const li = document.createElement("li");
          li.textContent = opt;
          li.onclick = () => {
            el.textContent = opt;
            window.menu.style.display = "none";
          };
          window.menu.appendChild(li);
        });

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Wpisz własny kanał...";
        input.addEventListener("click", ev => ev.stopPropagation());
        input.addEventListener("input", () => {
          el.textContent = input.value.trim();
        });
        window.menu.appendChild(input);
      }
      else if (el.classList.contains("additional-label")) {
        const span = el.nextElementSibling;
        window.menu.innerHTML = "";

        Object.entries(window.additionalGroupedOptions).forEach(([category, options]) => {
          const catItem = document.createElement("li");
          catItem.textContent = category;
          catItem.className = "category collapsed";

          const subList = document.createElement("ul");
          subList.className = "subcategory";

          options.forEach(opt => {
            const subItem = document.createElement("li");
            subItem.textContent = opt;
            subItem.onclick = () => {
              span.textContent = opt;
              window.menu.style.display = "none";

              if (opt.includes("Lokalizacja medycznych działań ratowniczych")) {
                alert("Pamiętaj o wpisaniu nadzorującego medyczne czynności ratownicze!");
              }
            };
            subList.appendChild(subItem);
          });

          catItem.onclick = (e) => {
            e.stopPropagation();
            const expanded = catItem.classList.toggle("expanded");
            catItem.classList.toggle("collapsed", !expanded);
            subList.classList.toggle("show", expanded);
          };

          window.menu.appendChild(catItem);
          window.menu.appendChild(subList);
        });

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Wpisz własną treść...";
        input.addEventListener("click", e => e.stopPropagation());
        input.addEventListener("input", () => {
          span.textContent = input.value.trim();
        });
        window.menu.appendChild(input);
      }
    };
  });
}

window.stopnieOptions = [
  "dh.", "ogn.", "st. ogn.", "mł. asp.",
  "asp.", "st. asp.", "asp. sztab.", "mł. kpt.", "kpt.", "st. kpt.", "mł. bryg.",
];

function addPoziomLine(isDuplicate = false) {
  const line = document.createElement("div");
  line.className = "responder-line";

  const lineId = "line-" + Date.now();
  line.dataset.lineId = lineId;

  line.innerHTML = `
    <span class="interactive poziom-label">Poziom kierowania działaniem ratowniczym – interwencyjny</span>: 
    <span class="poziom-text" data-info=""></span>
    <br>
    <span class="kdr-text interactive" data-default="true">KDR nie korzystał z praw określonych w Rozporządzeniu Rady Ministrów z dnia 4 lipca 1992 r. w sprawie zakresu i trybu korzystania z praw kierującego działaniem ratowniczym.</span>
  `;

  if (isDuplicate) {
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "🗑️ Usuń";
    deleteBtn.setAttribute("aria-hidden", "true");
    deleteBtn.setAttribute("draggable", "false");
    deleteBtn.setAttribute("contenteditable", "false");
    deleteBtn.style = `
    margin-left: 10px;
    background: #fdd;
    border: 1px solid #c00;
    color: #600;
    cursor: pointer;
    border-radius: 4px;
    padding: 2px 6px;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
  `;

    deleteBtn.addEventListener("click", () => {
      line.remove();
      const brToRemove = container.querySelector(`br[data-line-id="${lineId}"]`);
      if (brToRemove) brToRemove.remove();
    });

    line.appendChild(deleteBtn);
  }

  const container = document.getElementById("poziomContainer");
  container.appendChild(line);

  const spacer = document.createElement("br");
  spacer.dataset.lineId = lineId;
  container.appendChild(spacer);

  setupInteractiveHandlers();
  updatePoziomPunctuation();
}
function updatePoziomText(span) {
  span.classList.add("updating");

  const stopien = span.dataset.stopien || "";
  const name = span.dataset.name || "";
  const from = span.dataset.from || "";
  const to = span.dataset.to || "";

  let text = "";
  if (stopien) text += stopien;
  if (name) text += (text ? " " : "") + name;
  if (from) text += (text ? " od godz. " : "od ") + from;
  if (to) text += (from ? " do godz. " : "do ") + to;

  text = text.trim();
  if (text) {
    span.textContent = text.replace(/[\s.,]*$/, ".");
    span.parentElement.dataset.final = "true";
  } else {
    span.textContent = "";
    span.parentElement.removeAttribute("data-final");
  }
  span.classList.remove("updating");
  setTimeout(updatePoziomPunctuation, 0);
}

function addHydrantLine() {
  const line = document.createElement("div");
  line.className = "responder-line";
  const lineId = "hydrant-" + Date.now();
  line.dataset.lineId = lineId;

  line.innerHTML =
    `
    <span class="interactive hydrant-label">Hydrant</span>: 
    <span class="hydrant-text" data-typ="" data-stan="" data-ozn="" data-ul="" data-niska-temp="false" data-line-id="${lineId}"></span>
  `;

  document.getElementById("hydrantContainer").appendChild(line);
  setupInteractiveHandlers();
}

function updateHydrantText(span) {
  const typ = span.dataset.typ || "";
  const stan = span.dataset.stan || "";
  const ozn = span.dataset.ozn || "";
  const ul = span.dataset.ul || "";

  const temp = span.dataset.niskaTemp === "true";
  const wieleZdarzen = span.dataset.wieleZdarzen === "true";
  const niezlokalizowano = span.dataset.niezlokalizowano === "true";
  if (wieleZdarzen) {
    span.textContent = "Nie sprawdzono ze względu na mnogość zdarzeń.";
    return;
  }
  if (niezlokalizowano) {
    span.textContent = "W promieniu 200m nie zlokalizowano.";
    return;
  }
  if (!typ && !ozn && !ul && !stan) {
    span.textContent = "";
    return;
  }
  let text = typ;
  if (stan) text += `, ${stan}`;
  if (ozn) text += `, ${ozn}`;
  if (ul) text += ` - ul. ${ul}`;
  text += temp ? " - nie sprawdzono ze względu na ujemną temperaturę." : ".";

  span.textContent = text;
}

function updatePoziomPunctuation() {
  const allLines = [...document.querySelectorAll("#poziomContainer .responder-line")];
  const finalLines = allLines.filter(line => line.dataset.final === "true");

  finalLines.forEach((line, i) => {
    const span = line.querySelector(".poziom-text");
    if (!span || span.classList.contains("updating")) return;
    if (span.textContent.trim().endsWith(".")) return;
    const txt = span.textContent.replace(/[.,]$/, "");
    span.textContent = txt + (i === finalLines.length - 1 ? "." : ",");
  });
}

document.addEventListener("click", (e) => {
  if (!window.menu.contains(e.target) && !e.target.classList.contains("interactive")) {
    window.menu.style.display = "none";
  }
});

function kopiujZawartosc() {
  const box = document.getElementById("editableBox");
  const selection = window.getSelection();
  const range = document.createRange();

  selection.removeAllRanges();
  range.selectNodeContents(box);
  selection.addRange(range);

  try {
    const successful = document.execCommand("copy");
    if (!successful) {
      console.warn("Kopiowanie nie powiodło się");
    }
  } catch (err) {
    console.error("Błąd kopiowania:", err);
  }

  selection.removeAllRanges();
}

function kopiujsluzby() {
  const ignorowane = ["właściciel", "zgłaszający", "administracja", "brak zgłaszającego"];
  const sluzby = new Set();

  document.querySelectorAll("#myślniki .responder-text").forEach(span => {
    const selected = JSON.parse(span.dataset.selected || "[]");
    selected.forEach(s => {
      if (!ignorowane.includes(s)) {
        sluzby.add(s);
      }
    });
  });

  const wynik = [...sluzby].join(", ");
  if (wynik) {
    const temp = document.createElement("textarea");
    temp.value = wynik;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
  }
}

function kopiujPogode() {
  const tekst = document.getElementById("weatherResult").textContent;
  if (!tekst) return;

  const temp = document.createElement("textarea");
  temp.value = tekst;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
}

function kopiujprzekazanie() {
  const tekst = document.getElementById("przekazanie").textContent;
  if (!tekst) return;

  const temp = document.createElement("textarea");
  temp.value = tekst;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
}

window.weatherDataAuto = null;

function fetchWeatherFromIMGW() {
  const url = "https://danepubliczne.imgw.pl/api/data/synop/station/katowice";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data) {
        console.error("Brak danych pogodowych z IMGW");
        return;
      }

      window.weatherDataAuto = {
        t: Math.round(data.temperatura),
        ws: Math.round(data.predkosc_wiatru),
        wd: degToDirection(parseInt(data.kierunek_wiatru)),
        p: Math.round(data.cisnienie)
      };

      const summary = [];

      if (window.weatherDataAuto.t) summary.push(`Temp. ${window.weatherDataAuto.t}°C`);
      summary.push("brak opadów");
      if (window.weatherDataAuto.ws && window.weatherDataAuto.wd)
        summary.push(`wiatr ${window.weatherDataAuto.ws} km/h ${window.weatherDataAuto.wd}`);
      else if (window.weatherDataAuto.ws)
        summary.push(`wiatr ${window.weatherDataAuto.ws} km/h`);
      else if (window.weatherDataAuto.wd)
        summary.push(`wiatr z kierunku ${window.weatherDataAuto.wd}`);
      const summaryText = summary.length
        ? summary.join(", ") + "."
        : "Kliknij tutaj, aby edytować pogodę";

      const weatherResult = document.getElementById("weatherResult");
      if (weatherResult && weatherResult.textContent.includes("Kliknij")) {
        weatherResult.textContent = summaryText;
      }
    })
    .catch(err => {
      console.error("Błąd IMGW:", err);
    });
}

function addAdditionalLine(isDuplicate = false) {
  const container = document.getElementById("additionalContainer");
  const lineId = "additional-" + Date.now();

  const line = document.createElement("div");
  line.className = "responder-line";
  line.dataset.lineId = lineId;

  line.innerHTML = `
  <span 
    class="interactive additional-label" 
    contenteditable="false" 
    draggable="false" 
    unselectable="on" 
    style="user-select: none; -webkit-user-select: none;"
  >
    ➕ Dodatkowe zdania
  </span>
  <div class="additional-text"></div>
 <button 
  class="delete-btn" 
  onclick="
    this.parentElement.remove();
    const container = document.getElementById('additionalContainer');
    const checkbox = document.getElementById('additionalToggle');
    if (container.children.length === 0) {
      checkbox.checked = false;
      container.style.display = 'none';
    }
  "
  contenteditable="false" 
  draggable="false" 
  unselectable="on" 
  style="user-select: none; -webkit-user-select: none;"
>
  🗑️
</button>
<label 
  style="margin-left:10px;" 
  contenteditable="false" 
  draggable="false" 
  aria-hidden="true" 
  tabindex="-1"
>
  <input 
    type="checkbox" 
    onclick="this.checked=false; addAdditionalLine(true)" 
    contenteditable="false" 
    draggable="false" 
    tabindex="-1"
  >
  <span 
    style="user-select: none; -webkit-user-select: none;" 
    aria-hidden="true"
  >Powiel</span>
</label>
`;

  container.appendChild(line);
  setupInteractiveHandlers();
}

window.additionalGroupedOptions = {
  "📷 Dokumentacja": [
    "Dokumentacji fotograficznej z miejsca zdarzenia nie sporządzono ze względu na fakt, iż usunięty konar nie przekraczał 30% korony drzewa.",
    "Wykonano dokumentację fotograficzną."
  ],
  "🚑 Medyczne": [
    "Przybyły na miejsce ZRM po przebadaniu osoby poszkodowanej podjął decyzję o konieczności przetransportowania osoby do szpitala xxxxxxx celem dalszej diagnostyki.",
    "Lokalizacja medycznych działań ratowniczych: xx.xx.xxxx r. godz. xx:xx.",
    "Osoba/y podróżująca/e samochodem decyzją ZRM nie wymagała/y dalszej hospitalizacji.",
    "W wyniku zdarzenia nikt nie ucierpiał, nie wymagał udzielenia KPP",
    "Nikt nie uskarża się na żadne dolegliwości - brak wskazań do KPP.",
    "W momencie odjazdu JOP z miejsca zdarzenia, ZRM nie podjął decyzji o hospitalizacji."
  ],
  "🕒 Utrudnienia": [
    "Wydłużony czas dojazdu spowodowany był nieprecyzyjnym zgłoszeniem."
  ],
  "🚓 Policja": [
    "ID sprawy Policji:",
    "Dalsze czynności prowadzi Policja."
  ]
};

function toggleCOForm() {
  const checkbox = document.getElementById("coCheckbox");
  const form = document.getElementById("coForm");
  const label = document.querySelector(".co-toggle-label");
  const isChecked = checkbox.checked;

  form.style.display = isChecked ? "block" : "none";
  label.classList.toggle("active", isChecked);

  if (isChecked) {
    // ⬇️ Uruchamiamy dopiero gdy formularz jest widoczny
    ["aptNumber", "checkedFlats", "uncheckedFlats"].forEach(id => {
      enhanceCommaInput(id);
    });

    const weatherResult = document.getElementById("weatherResult");
    if (weatherResult) {
      weatherResult.click();

      setTimeout(() => {
        const pressureCheckbox = document.getElementById("pressureToggle");
        if (pressureCheckbox) {
          pressureCheckbox.checked = true;
          pressureCheckbox.dispatchEvent(new Event("change"));
        }
        if (window.menu) {
          window.menu.style.display = "none";
        }
      }, 150);
    }

    updateCODescription();
  } else {
    document.getElementById("coOutput").textContent = "";
  }
}

function updateCODescription() {
  const checkbox = document.getElementById("coCheckbox");
  const output = document.getElementById("coOutput");

  if (!checkbox.checked) {
    output.textContent = "";
    output.style.display = "none";
    return;
  }

  const apt = document.getElementById("aptNumber").value || "___";
  const flats = document.getElementById("checkedFlats").value || "brak danych";
  const unflats = document.getElementById("uncheckedFlats").value || "nie dotyczy";
  const evac = document.getElementById("evacuation").checked;
  const kpp = document.getElementById("kpp").checked;
  const ban = document.getElementById("ban").checked;

  const deviceSelect = document.getElementById("deviceSelect");
  const deviceValue = deviceSelect ? deviceSelect.value : "msa";

  const devices = {
    drager: "Drager X-am 2500",
    msa: "MSA Altair 4XR",
    tetra: "Tetra 3",
    microclip: "MicroClip"
  };

  const selectedDeviceName = devices[deviceValue] || "MSA Altair 4XR";
  const text =
    `\n1. Ewakuacja - ${evac ? "przeprowadzono" : "nie przeprowadzono"}.
    2. KPP - lokatorzy mieszkania nr ${apt} ${kpp ? "wymagali" : "nie wymagali"} udzielenia KPP oraz wezwania ZRM na miejsce zdarzenia.
    3. Pomiary w miejscu zdarzenia - wykonano pomiary na obecność tlenku węgla w mieszkaniu nr ${apt} - I pomiar wynik 0 ppm, po przewietrzeniu mieszkania - wynik wskazywał 0 ppm.
    4. Użyty sprzęt - sprzęt pomiarowy ${selectedDeviceName} oraz sprzęt ochrony dróg oddechowych.
    5. Pomiary w pozostałej części obiektu, sprawdzono mieszkania w tym samym pionie: mieszkania nr: ${flats} przy włączonym piecyku - wynik 0 ppm, po przewietrzeniu mieszkań - wynik 0 ppm. Nie dokonano pomiarów w mieszkaniach nr: ${unflats} - brak dostępu do mieszkań.
    6. Ewentualny zakaz użytkowania - ${ban ? "wydano" : "nie wydano. Zalecono wietrzenie mieszkania."}
    7. Sposób przekazania miejsca zdarzenia - miejsce zdarzenia przekazano lokatorce mieszkania nr ${apt}.`;

  output.textContent = text;
  output.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  ["coCheckbox", "deviceSelect", "aptNumber", "checkedFlats", "uncheckedFlats", "evacuation", "kpp", "ban"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const eventType = (el.type === "checkbox" || el.tagName === "SELECT") ? "change" : "input";
    el.addEventListener(eventType, updateCODescription);
  });
  ["aptNumber", "checkedFlats", "uncheckedFlats"].forEach(enhanceCommaInput);
});

function getLocalDatetimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function setDispatchTimeNow() {
  const dispatchTimeInput = document.getElementById("dispatchTime");
  if (dispatchTimeInput && !dispatchTimeInput.value) {
    dispatchTimeInput.value = getLocalDatetimeString();
  }
}

function formatReportSuffix() {
  const input = document.getElementById("meldunekSuffix");
  if (!input) return;

  let val = input.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (val.length > 1) {
    val = val.slice(0, 1) + "-" + val.slice(1, 5);
  }

  input.value = val.slice(0, 6);
}

function generateDispatchText() {
  const dispatchToggle = document.getElementById("dispatchToggle");
  const output = document.getElementById("dispatchOutput");

  if (!dispatchToggle.checked) {
    if (output) output.innerHTML = "";
    return;
  }

  const timeInput = document.getElementById("dispatchTime")?.value;
  const vehicle = document.getElementById("dispatchVehicle")?.value;
  const reportPrefix = document.getElementById("meldunekPrefix")?.value.trim();
  const reportSuffix = document.getElementById("meldunekSuffix")?.value.trim();

  if (!timeInput || !vehicle || !output) {
    return;
  }

  const dateObj = new Date(timeInput);
  const formatted =
    ("0" + dateObj.getDate()).slice(-2) + "-" +
    ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" +
    dateObj.getFullYear() + " " +
    ("0" + dateObj.getHours()).slice(-2) + ":" +
    ("0" + dateObj.getMinutes()).slice(-2);

  const reportText = reportSuffix ? ` nr meldunku ${reportPrefix}${reportSuffix}.` : "";
  const fullText = `Siły i środki przedysponowane do innych zdarzeń:\n- ${formatted}: ${vehicle}${reportText}`;
  const firstLine = output.querySelector(".dispatch-line");
  if (firstLine) {
    firstLine.textContent = fullText;
  } else {
    addEditableDispatchLine(fullText);
  }
}

function setupDispatchListeners() {
  setDispatchTimeNow();

  const dispatchTimeInput = document.getElementById("dispatchTime");
  const dispatchVehicle = document.getElementById("dispatchVehicle");
  const meldunekPrefix = document.getElementById("meldunekPrefix");
  const meldunekSuffix = document.getElementById("meldunekSuffix");

  dispatchTimeInput?.addEventListener("input", generateDispatchText);
  dispatchVehicle?.addEventListener("change", generateDispatchText);
  meldunekPrefix?.addEventListener("input", generateDispatchText);
  meldunekSuffix?.addEventListener("input", () => {
    formatReportSuffix();
    generateDispatchText();
  });

  generateDispatchText();
}

function degToDirection(deg) {
  const dirs = ["północny", "północno-wschodni", "wschodni", "południowo-wschodni", "południowy", "południowo-zachodni", "zachodni", "północno-zachodni"];
  return dirs[Math.round(deg / 45) % 8];
}

function toggleDispatchForm() {
  const dispatchToggle = document.getElementById("dispatchToggle");
  const dispatchFormContainer = document.getElementById("dispatchFormContainer");

  if (dispatchToggle.checked) {
    dispatchFormContainer.style.display = "block";
    setDispatchTimeNow();
    generateDispatchText();
  } else {
    dispatchFormContainer.style.display = "none";
    const output = document.getElementById("dispatchOutput");
    if (output) output.textContent = "";
  }
}

function toggleAdditionalForm() {
  const checkbox = document.getElementById("additionalToggle");
  const container = document.getElementById("additionalContainer");
  container.style.display = checkbox.checked ? "block" : "none";

  if (checkbox.checked && container.children.length === 0) {
    addAdditionalLine(false);
  }
}

function createDeviceSelect() {
  const container = document.getElementById("coForm");
  if (!container) return;
  const oldSelect = document.getElementById("deviceSelect");
  if (oldSelect) oldSelect.remove();

  const label = document.createElement("label");
  label.setAttribute("for", "deviceSelect");
  label.textContent = "Sprzęt pomiarowy: ";

  const select = document.createElement("select");
  select.id = "deviceSelect";

  const devices = [
    { value: "drager", text: "Drager X-am 2500" },
    { value: "msa", text: "MSA Altair 4XR" },
    { value: "tetra", text: "Tetra 3" },
    { value: "microclip", text: "MicroClip" },
  ];

  devices.forEach(device => {
    const option = document.createElement("option");
    option.value = device.value;
    option.textContent = device.text;
    select.appendChild(option);
  });

  select.addEventListener("change", updateCODescription);
  container.appendChild(label);
  container.appendChild(select);
}

function enhanceCommaInput(id) {
  const input = document.getElementById(id);
  if (!input) return;

  input.addEventListener("keydown", function(e) {
    if (e.key === " ") {
      e.preventDefault();

      const start = input.selectionStart;
      const end = input.selectionEnd;
      const value = input.value;

      const before = value.slice(0, start);
      const after = value.slice(end);
      const trimmedBefore = before.trimEnd();
      const lastChar = trimmedBefore.slice(-1);

      let insert = "";

      if (lastChar && lastChar !== ",") {
        insert = ", ";
      } else if (lastChar === ",") {
        insert = " ";
      }

      input.value = trimmedBefore + insert + after;
      const newPos = trimmedBefore.length + insert.length;
      input.setSelectionRange(newPos, newPos);

      updateCODescription();
    }
  });
}

window.addEventListener("load", () => {
  ["aptNumber", "checkedFlats", "uncheckedFlats"].forEach(id => {
    console.log("🔧 enhanceCommaInput init for", id);
    enhanceCommaInput(id);
  });
});

function addEditableDispatchLine(text = "", allowDuplicate = true) {
  const output = document.getElementById("dispatchOutput");
  if (!output) return;

  const lineWrapper = document.createElement("div");
  lineWrapper.className = "dispatch-entry";
  lineWrapper.style.marginBottom = "6px";

  const editable = document.createElement("div");
  editable.className = "dispatch-line";
  editable.contentEditable = "true";
  editable.style.border = "1px dashed #ccc";
  editable.style.padding = "4px";
  editable.style.display = "inline-block";
  editable.style.minWidth = "300px";
  editable.style.userSelect = "text";
  editable.classList.add("dispatch-line");
  editable.textContent = text;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.title = "Usuń";
  deleteBtn.className = "delete-btn";
  Object.assign(deleteBtn.style, {
    marginLeft: "8px",
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none"
  });
  deleteBtn.setAttribute("contenteditable", "false");
  deleteBtn.setAttribute("draggable", "false");
  deleteBtn.setAttribute("unselectable", "on");
  deleteBtn.onclick = () => lineWrapper.remove();

  const duplicateBtn = document.createElement("button");
  duplicateBtn.textContent = "➕";
  duplicateBtn.title = "Powiel";
  duplicateBtn.className = "add-line-btn";
  Object.assign(duplicateBtn.style, {
    marginLeft: "4px",
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none"
  });
  duplicateBtn.setAttribute("contenteditable", "false");
  duplicateBtn.setAttribute("draggable", "false");
  duplicateBtn.setAttribute("unselectable", "on");

  if (allowDuplicate) {
    duplicateBtn.onclick = () => {
      // przy powielaniu przekazujemy allowDuplicate = false, bo kopii nie chcemy powielać dalej
      const cleanText = editable.textContent
        .replace(/Siły i środki przedysponowane do innych zdarzeń:.*/i, "")
        .trim();
      addEditableDispatchLine(cleanText, false);
    };
  } else {
    // ukryj przycisk powielania dla kopii
    duplicateBtn.style.display = "none";
  }

  lineWrapper.appendChild(editable);
  lineWrapper.appendChild(deleteBtn);
  lineWrapper.appendChild(duplicateBtn);

  output.appendChild(lineWrapper);
}

function duplicateLastDispatch() {
  const lines = document.querySelectorAll("#dispatchOutput .dispatch-line");
  if (!lines.length) return;

  const last = lines[lines.length - 1];
  const text = last.textContent.trim();
  addEditableDispatchLine(text);
}

function initializeTab3() {
  addResponderLine();
  addActionLine();
  setupInteractiveHandlers();
  addPoziomLine(false);
  addHydrantLine();
  loadHydrantJsonAutomatically();
  fetchWeatherFromIMGW();
  setupDispatchListeners();
  createDeviceSelect();

  const addResponderBtn = document.createElement("button");
  addResponderBtn.textContent = "➕ Dodaj linię";
  addResponderBtn.onclick = addResponderLine;
  addResponderBtn.className = "add-line-btn";
  addResponderBtn.setAttribute("contenteditable", "false");
  addResponderBtn.setAttribute("draggable", "false");
  addResponderBtn.setAttribute("unselectable", "on");
  addResponderBtn.setAttribute("aria-hidden", "true");
  addResponderBtn.style.userSelect = "none";
  addResponderBtn.style.webkitUserSelect = "none";
  addResponderBtn.style.mozUserSelect = "none";
  addResponderBtn.style.marginTop = "8px";

  document.getElementById("myślniki").after(addResponderBtn);

  const addActionBtn = document.createElement("button");
  addActionBtn.textContent = "➕ Dodaj linię";
  addActionBtn.onclick = addActionLine;
  addActionBtn.className = "add-line-btn";
  addActionBtn.setAttribute("contenteditable", "false");
  addActionBtn.setAttribute("draggable", "false");
  addActionBtn.setAttribute("unselectable", "on");
  addActionBtn.setAttribute("aria-hidden", "true");
  addActionBtn.style.userSelect = "none";
  addActionBtn.style.webkitUserSelect = "none";
  addActionBtn.style.mozUserSelect = "none";
  addActionBtn.style.marginTop = "8px";

  document.getElementById("dzialaniaContainer").after(addActionBtn);
}
