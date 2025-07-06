let hydrantJsonData = [];
function loadHydrantJsonAutomatically() {
  fetch("hydrantykato.json")
    .then(response => response.json())
    .then(data => {
      hydrantJsonData = data;

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

      console.log("Hydranty załadowane:", hydrantJsonData.length);
    })
    .catch(err => {
      console.error("Błąd ładowania hydrantów:", err);
    });
}

const optionsMap = {
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

const checkboxOptions = [
  "ZRM", "Policja", "Straż Miejska", "Pogotowie gazowe",
  "Patrol autostradowy", "Pomoc drogowa", "Właściciel", "zgłaszający", "Administracja", "brak zgłaszającego"
];

const actionOptions = [
  "zabezpieczeniu miejsca zdarzenia",
  "podaniu jednego prądu wody w natarciu",
  "sprawdzeniu pogorzeliska przy użyciu kamery termowizyjnej Flir - brak wzrostu temperatury względem otoczenia",
  "złożeniu pociętego drewna na terenie zielonym w miejscu bezpiecznym. "
];

const menu = document.getElementById("menu");
const myślniki = document.getElementById("myślniki");

function addResponderLine() {
  const line = document.createElement("div");
  line.className = "responder-line";
  line.innerHTML = `
    <span class="interactive responder-label">-</span>
    <span class="responder-text" data-selected="[]"></span>
  `;
  myślniki.appendChild(line);
  setupInteractiveHandlers();
  updateAllResponderPunctuation();
}

function addActionLine() {
  const line = document.createElement("div");
  line.className = "responder-line";
  line.innerHTML = `
    <span class="interactive action-label">-</span>
    <span class="action-text" data-custom=""></span>
  `;
  document.getElementById("dzialaniaContainer").appendChild(line);
  setupInteractiveHandlers();
  updateAllActionPunctuation();
}

function updateRespondersText(textSpan, selected) {
  let text = selected.join(", ");
  if (textSpan.dataset.custom) {
    text = textSpan.dataset.custom;
  } else if (text === "KPP") {
    text = "Nikt nie uskarża się na żadne dolegliwości - brak wskazań do KPP.";
  } else if (text) {
    text += selected.length === 1 ? " na miejscu" : ", na miejscu";
    if (!text.endsWith(".")) text += ".";
  }
  textSpan.textContent = text;

  const allLines = [...myślniki.querySelectorAll(".responder-line")];
  const lastLine = allLines[allLines.length - 1];
  if (text && textSpan.closest(".responder-line") === lastLine) {
    addResponderLine();
  } else {
    updateAllResponderPunctuation();
  }
}

function updateAllResponderPunctuation() {
  const lines = [...myślniki.querySelectorAll(".responder-line")];
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

    const allLines = [...document.querySelectorAll("#dzialaniaContainer .responder-line")];
    const lastLine = allLines[allLines.length - 1];
    if (textSpan.closest(".responder-line") === lastLine) {
      addActionLine();
    } else {
      updateAllActionPunctuation();
    }
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
  menu.innerHTML = "";
  let selected = JSON.parse(textSpan.dataset.selected || "[]");

  checkboxOptions.forEach(option => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = option;
    checkbox.checked = selected.includes(option);

    checkbox.addEventListener("change", () => {
      delete textSpan.dataset.custom;
      selected = checkbox.checked
        ? [...new Set([...selected, option])]
        : selected.filter(o => o !== option);
      textSpan.dataset.selected = JSON.stringify(selected);
      updateRespondersText(textSpan, selected);
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(option));
    menu.appendChild(label);
  });

  const li = document.createElement("li");
  li.textContent = "Brak KPP";
  li.addEventListener("click", () => {
    textSpan.textContent = "Nikt nie uskarża się na żadne dolegliwości - brak wskazań do KPP.";
    textSpan.dataset.selected = JSON.stringify(["KPP"]);
    delete textSpan.dataset.custom;
    menu.style.display = "none";
    updateRespondersText(textSpan, ["KPP"]);
  });
  menu.appendChild(li);

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
      updateRespondersText(textSpan, []);
    }
  });
  menu.appendChild(manual);
}

function setupInteractiveHandlers() {
  document.querySelectorAll(".interactive").forEach(el => {
    el.onclick = (e) => {
      const rect = el.getBoundingClientRect();
      menu.style.top = `${rect.bottom + window.scrollY}px`;
      menu.style.left = `${rect.left + window.scrollX}px`;
      menu.style.display = "block";
      menu.innerHTML = "";

      if (el.classList.contains("responder-label")) {
        renderCheckboxMenu(el.nextElementSibling);

      } else if (el.classList.contains("action-label")) {
        const textSpan = el.nextElementSibling;
        actionOptions.forEach(option => {
          const li = document.createElement("li");
          li.textContent = option;
          li.onclick = () => {
            updateActionText(textSpan, option);
            menu.style.display = "none";
          };
          menu.appendChild(li);
        });

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Wpisz własną...";
        input.addEventListener("click", ev => ev.stopPropagation());
        input.addEventListener("input", () => {
          updateActionText(textSpan, input.value.trim());
        });
        menu.appendChild(input);

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
        menu.appendChild(input);
    }
      
    else if (el.id === "przekazanie") {
  const options = [
    "Miejsce zdarzenia wraz z zaleceniem ___________ przekazano.",
    "Miejsca zdarzenia nie przekazano ze względu na fakt, iż służbą wiodącą była Policja, o czym poinformowano SKKM.",
    "Miejsca zdarzenia nie przekazano ze względu na brak podjętych działań ratowniczych, o czym poinformowano SKKM.",
    "Miejsca zdarzenia nie przekazano ze względu na brak właściciela obiektu, o czym poinformowano SKKM.",
    "Miejsca zdarzenia nie przekazano ze względu na charakter zdarzenia i brak szkód, o czym poinformowano SKKM.",
    "Miejsca zdarzenia nie przekazano ze względu na brak właściciela obiektu na miejscu zdarzenia, o czym poinformowano SKKM.",
    "Miejsca zdarzenia nie przekazano ze względu na mnogość zdarzeń, o czym poinformowano SKKM."
  ];

  options.forEach(opt => {
    const li = document.createElement("li");
    li.textContent = opt;
    li.onclick = () => {
      el.textContent = opt;
      menu.style.display = "none";
    };
    menu.appendChild(li);
  });

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Wpisz własną treść...";
  input.addEventListener("click", e => e.stopPropagation());
  input.addEventListener("input", () => {
    el.textContent = input.value;
  });
  menu.appendChild(input);
}  

       else if (el.classList.contains("poziom-label")) {
        const textSpan = el.nextElementSibling;
        stopnieOptions.forEach(opt => {
          const li = document.createElement("li");
          li.textContent = opt;
          li.onclick = () => {
            textSpan.dataset.stopien = opt;
            updatePoziomText(textSpan);
          };
          menu.appendChild(li);
        });
        const inputName = document.createElement("input");
        inputName.type = "text";
        inputName.placeholder = "Imię i nazwisko";
        inputName.addEventListener("click", e => e.stopPropagation());
        inputName.addEventListener("input", () => {
          textSpan.dataset.name = inputName.value;
          updatePoziomText(textSpan);
        });
        menu.appendChild(inputName);
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

        menu.appendChild(document.createTextNode(" od "));
        menu.appendChild(inputFrom);
        menu.appendChild(document.createTextNode(" do "));
        menu.appendChild(inputTo);

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
        menu.appendChild(dup);
        
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
    ? "KDR korzystał z praw określonych w Rozporządzeniu Rady Ministrów z dnia 4 lipca 1992 r. w sprawie zakresu i trybu korzystania z praw kierującego działaniem ratowniczym:"
    : "KDR nie korzystał z praw określonych w Rozporządzeniu Rady Ministrów z dnia 4 lipca 1992 r. w sprawie zakresu i trybu korzystania z praw kierującego działaniem ratowniczym.";
  const prawaContainer = el.parentElement.querySelector(".kdr-rights-container");
  
  if (checkbox.checked) {
    if (!prawaContainer) {
      const newContainer = document.createElement("div");
      newContainer.className = "kdr-rights-container";
      el.parentElement.appendChild(newContainer);
    }
    menu.style.display = "none";
    setTimeout(() => el.click(), 0);
  } else {
    if (prawaContainer) prawaContainer.remove(); 
  }
});
  menu.appendChild(label);

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
    return `- ${item}${isLast ? '.' : ','}`;
  }).join("");

  outputText += `\n${formattedRights}`;
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
      return `- ${item}${isLast ? '.' : ','}`;
    }).join("<br>");

    el.parentElement.querySelector(".kdr-rights-container").innerHTML = formattedRights;
  } else {
    el.parentElement.querySelector(".kdr-rights-container").innerHTML = "";
  }
      });
    });

    menu.appendChild(container);
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

    menu.appendChild(container);
  });

  const ulInput = document.createElement("input");
ulInput.placeholder = "Wpisz adres...";
ulInput.style.display = "block";
ulInput.style.marginBottom = "6px";
ulInput.value = span.dataset.ul || "";
menu.appendChild(ulInput);

// 🔻 Kontener na podpowiedzi
const ulList = document.createElement("ul");
ulList.className = "suggestion-list";
ulList.style.position = "absolute";
ulList.style.background = "white";
ulList.style.border = "1px solid #ccc";
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

  const results = hydrantJsonData
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

      // Wstaw dane do span
      span.dataset.ul = adres;
      const hydrant = hydrantJsonData.find(h => h.adres === adres);
      if (hydrant) {
        span.dataset.typ = hydrant.typ;
        span.dataset.stan = hydrant.stan;
        span.dataset.ozn = hydrant.ozn;
      }

      // zaznacz radio buttony zgodnie z nowymi danymi
      menu.querySelectorAll("input[type=radio]").forEach(radio => {
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
  if (!menu.contains(e.target)) {
    ulList.innerHTML = "";
  }
});
  const infoLine = document.createElement("div");
infoLine.textContent = "Autopodpowiedź - Spis był generowany automatycznie, może zawierać błędy.";
infoLine.style.fontSize = "13px";
infoLine.style.marginBottom = "4px";
infoLine.style.color = "#444"; 
menu.appendChild(infoLine);
  ulInput.setAttribute("list", "hydrant-ulice");
  ulInput.placeholder = "Wpisz adres...";
  ulInput.style.display = "block";
  ulInput.style.marginBottom = "6px";
  ulInput.value = span.dataset.ul || "";

  ulInput.addEventListener("click", ev => ev.stopPropagation());
  ulInput.addEventListener("input", () => {
    span.dataset.ul = ulInput.value;
    const hydrant = hydrantJsonData.find(h => h.adres === ulInput.value);
if (hydrant) {
  span.dataset.typ = hydrant.typ;
  span.dataset.stan = hydrant.stan;
  span.dataset.ozn = hydrant.ozn;
  menu.querySelectorAll("input[type=radio]").forEach(radio => {
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
  menu.appendChild(ulInput);

  const datalist = document.createElement("datalist");
  datalist.id = "hydrant-ulice";
  menu.appendChild(datalist);

  const jsonInput = document.createElement("input");
  jsonInput.type = "file";
  jsonInput.accept = ".json";
  jsonInput.style.display = "block";
  jsonInput.style.marginBottom = "6px";
  jsonInput.addEventListener("click", ev => ev.stopPropagation());
  //jsonInput.addEventListener("change", handleHydrantJsonLoad);
  menu.appendChild(jsonInput);

const checkboxOptions = [
  {
    key: "niskaTemp",
    label: "Nie sprawdzono ze względu na ujemną temperaturę"
  },
  {
    key: "wieleZdarzen",
    label: "Nie sprawdzono ze względu na mnogość zdarzeń"
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
  menu.appendChild(label);
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

  menu.appendChild(formGroup);

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
if (weatherDataAuto) {
  const tIn = document.getElementById("temperatureInput");
  const wsIn = document.getElementById("windSpeedInput");
  const wdSel = document.getElementById("windDirSelect");
  const pVal = document.getElementById("pressureVal");
  const pToggle = document.getElementById("pressureToggle");

  if (tIn) tIn.value = weatherDataAuto.t;
  if (wsIn) wsIn.value = weatherDataAuto.ws;
  if (wdSel) wdSel.value = weatherDataAuto.wd;
  if (pVal) pVal.value = weatherDataAuto.p;
  if (pToggle) pToggle.checked = false;

  // wyzwól ręcznie input/change, żeby od razu uaktualnić tekst
  const fireEvent = (el, type = "input") => {
    if (el) el.dispatchEvent(new Event(type));
  };

  fireEvent(tIn);
  fireEvent(wsIn);
  fireEvent(wdSel, "change");
  fireEvent(pVal);
  fireEvent(pToggle, "change");
}

  ["temperatureInput", "weatherConditionSelect", "windSpeedInput", "windDirSelect"]
    .forEach(id => {
      document.getElementById(id).addEventListener("input", updateLive);
      document.getElementById(id).addEventListener("change", updateLive);
      document.getElementById("pressureToggle").addEventListener("change", updateLive);
      document.getElementById("pressureVal").addEventListener("input", updateLive);
    });
    
  e.stopPropagation();
  return;
      const id = el.id;
      if (optionsMap[id]) {
        optionsMap[id].forEach(opt => {
          const li = document.createElement("li");
          li.textContent = opt + ":";
          li.onclick = () => {
            el.textContent = opt + ":";
            menu.style.display = "none";
          };
          menu.appendChild(li);
        });

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Wpisz własną...";
        input.addEventListener("click", ev => ev.stopPropagation());
        input.addEventListener("input", () => {
          el.textContent = input.value.trim() + ":";
        });
        menu.appendChild(input);
      }
}
        
       else {
        const id = el.id;
        optionsMap[id]?.forEach(opt => {
          const li = document.createElement("li");
          li.textContent = opt + ":";
          li.onclick = () => {
            el.textContent = opt + ":";
            menu.style.display = "none";
          };
          menu.appendChild(li);
        });

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "(Zamienia nagłówek)";
        input.addEventListener("click", ev => ev.stopPropagation());
        input.addEventListener("input", () => {
          el.textContent = input.value.trim() + ":";
        });
        menu.appendChild(input);
      }
      e.stopPropagation(); 
    };
  });

  
}

const stopnieOptions = [
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
    <span class="kdr-text interactive" data-default="true">KDR nie korzystał z praw określonych w Rozporządzeniu Rady Ministrów z dnia 4 lipca 1992 r. w sprawie zakresu i trybu korzystania z praw kierującego działaniem ratowniczym:</span>
  `;

  if (isDuplicate) {
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "🗑️ Usuń";
    deleteBtn.style = "margin-left: 10px; background: #fdd; border: 1px solid #c00; color: #600; cursor: pointer; border-radius: 4px; padding: 2px 6px;";
    
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
  if (wieleZdarzen) {
    span.textContent = "Nie sprawdzono ze względu na mnogość zdarzeń.";
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

document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && !e.target.classList.contains('interactive')) {
    menu.style.display = 'none';
  }
});
function renderRightsLines(container, options) {
  const rights = [];
  container.querySelectorAll("input[type='checkbox']").forEach(cb => {
    if (cb.checked) rights.push(cb.dataset.text);
  });

  const existing = container.querySelector(".rights-lines");
  if (existing) existing.remove();

  if (rights.length) {
    const div = document.createElement("div");
    div.className = "rights-lines";
    rights.forEach((right, i) => {
      const line = document.createElement("div");
      line.textContent = `- ${right}${i === rights.length - 1 ? "." : ","}`;
      div.appendChild(line);
    });
    container.appendChild(div);
  }
}

function kopiujZawartosc() {
  const box = document.getElementById("editableBox");
  const clone = box.cloneNode(true); 
  clone.querySelectorAll(".delete-btn").forEach(btn => btn.remove());
  const temp = document.createElement("textarea");
  temp.value = clone.innerText.trim(); 
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
}

function kopiujsluzby() {
  const ignorowane = ["Właściciel", "Zgłaszający", "Administracja", "Brak zgłaszającego"];
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

let weatherDataAuto = null;

function fetchWeatherFromIMGW() {
  const url = "https://danepubliczne.imgw.pl/api/data/synop/station/katowice";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data) {
        console.error("Brak danych pogodowych z IMGW");
        return;
      }

      weatherDataAuto = {
        t: Math.round(data.temperatura),
        ws: Math.round(data.predkosc_wiatru),
        wd: degToDirection(parseInt(data.kierunek_wiatru)),
        p: Math.round(data.cisnienie)
      };

      const summary = [];

if (weatherDataAuto.t) summary.push(`Temp. ${weatherDataAuto.t}°C`);
summary.push("brak opadów");
if (weatherDataAuto.ws && weatherDataAuto.wd)
  summary.push(`wiatr ${weatherDataAuto.ws} km/h ${weatherDataAuto.wd}`);
else if (weatherDataAuto.ws)
  summary.push(`wiatr ${weatherDataAuto.ws} km/h`);
else if (weatherDataAuto.wd)
  summary.push(`wiatr z kierunku ${weatherDataAuto.wd}`);
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

function degToDirection(deg) {
  const dirs = ["północny", "północno-wschodni", "wschodni", "południowo-wschodni", "południowy", "południowo-zachodni", "zachodni", "północno-zachodni"];
  return dirs[Math.round(deg / 45) % 8];
}
addResponderLine();
addActionLine();
setupInteractiveHandlers();
addPoziomLine(false);
addHydrantLine();
document.addEventListener("DOMContentLoaded", () => {
  loadHydrantJsonAutomatically();
  fetchWeatherFromIMGW();
});