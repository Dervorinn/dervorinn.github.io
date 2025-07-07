  function updateDescription() {
    const co = document.getElementById("coCheckbox").checked;
    let outputText = "";

    if (co) {
      const apt = document.getElementById("aptNumber").value;
      const flats = document.getElementById("checkedFlats").value || "brak danych";
      const unflats = document.getElementById("uncheckedFlats").value || "nie dotyczy";
      const evac = document.getElementById("evacuation").checked;
      const kpp = document.getElementById("kpp").checked;
      const drager = document.getElementById("drager").checked;
      const ban = document.getElementById("ban").checked;

      outputText += `1. Ewakuacja - ${evac ? 'przeprowadzono' : 'nie przeprowadzono'}.\n`;
      outputText += `2. KPP - lokatorzy mieszkania nr ${apt} ${kpp ? 'wymagali' : 'nie wymagali'} udzielenia KPP oraz wezwania ZRM na miejsce zdarzenia.\n`;
      outputText += `3. Pomiary w miejscu zdarzenia - wykonano pomiary na obecność tlenku węgla w mieszkaniu nr ${apt} - I pomiar wynik 0 ppm., po przewietrzeniu mieszkania - wynik wskazywał 0 ppm.\n`;
      outputText += `4. Użyty sprzęt - sprzęt pomiarowy ${drager ? 'Drager X-am 2500' : 'MSA Altair 4X'} oraz sprzęt ochrony dróg oddechowych.\n`;
      outputText += `5. Pomiary w pozostałej części obiektu, sprawdzono mieszkania w tym samym pionie: mieszkania nr: ${flats} przy włączonym piecyku - wynik 0 ppm, po przewietrzeniu mieszkań - wynik 0 ppm. Nie dokonano pomiarów w mieszkaniach nr: ${unflats} - brak dostępu do mieszkań.\n`;
      outputText += `6. Ewentualny zakaz użytkowania - ${ban ? 'wydano' : 'nie wydano. Zalecono wietrzenie mieszkania.'}\n`;
      outputText += `7. Sposób przekazania miejsca zdarzenia - miejsce zdarzenia przekazano lokatorce mieszkania nr ${apt}.\n\n`;
    }

    document.getElementById("output").value = outputText;
  }

  function copyDescriptionOnly() {
    const output = document.getElementById("output").value;
    const lines = output.trim().split("\\n");
    const tempIndex = lines.findIndex(line => line.trim().startsWith("Temp."));
    const relevantLines = tempIndex !== -1 ? lines.slice(0, tempIndex) : lines;
    navigator.clipboard.writeText(relevantLines.join("\\n").trim());
  }
