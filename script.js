function toggleCO() {
    document.getElementById("coDetails").style.display = document.getElementById("coCheckbox").checked ? "block" : "none";
}

function toggleKDR() {
    document.getElementById("kdrDetails").style.display = document.getElementById("kdrRightsCheckbox").checked ? "block" : "none";
}

function formatTime(input) {
    input.value = input.value.replace(/\s/g, '');
    if (input.value.length === 4 && !input.value.includes(":")) {
        input.value = input.value.slice(0, 2) + ":" + input.value.slice(2);
    }
}

function convertWindToMs(kmh) {
    return Math.round(parseFloat(kmh) / 3.6);
}

function updateDescription() {
    const source = document.getElementById("source").value;
    const message = document.getElementById("message").value;
    const onSceneElements = document.querySelectorAll(".on-scene:checked");
    const onSceneList = Array.from(onSceneElements).map(el => el.value);
    let outputText = "";

    if (source === "SI WCPR") outputText += `SKKM PSP w Katowicach przyjęło formatkę SI WCPR o treści: „${message}”.\n\n`;
    else if (source === "Numer miejski") outputText += `SKKM PSP w Katowicach przyjęło zgłoszenie na numer miejski: „${message}”.\n\n`;
    else if (source === "Monitoring") outputText += `SKKM PSP w Katowicach przyjęło formatkę monitoringu o treści: „${message}”.\n\n`;

    outputText += "Sytuacja zastana/rozpoznanie:\n";
    if (onSceneList.length > 0) {
        outputText += `- ${onSceneList.join(", ")} na miejscu,\n\n`;
    } else {
        outputText += "- ,\n\n";
    }

    outputText += `Działania straży pożarnej polegały na:\n- zabezpieczeniu miejsca zdarzenia,\n\n`;

    const co = document.getElementById("coCheckbox").checked;
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

    outputText += `Organizacja łączności: korzystano z kanału – B025, B049.\n\n`;

    const rank = document.getElementById("rank").value;
    const officer = document.getElementById("officer").value;
    const from = document.getElementById("fromHour").value;
    const to = document.getElementById("toHour").value;
    outputText += `Poziom kierowania działaniem ratowniczym – interwencyjny: ${rank} ${officer} od godz. ${from} do godz. ${to}.\n`;

    const kdrRights = document.getElementById("kdrRightsCheckbox").checked;
    outputText += `\nKDR ${kdrRights ? '' : 'nie '}korzystał z praw określonych w Rozporządzeniu Rady Ministrów z dnia 4 lipca 1992 r. w sprawie zakresu i trybu korzystania z praw kierującego działaniem ratowniczym${kdrRights ? ':' : '.'}`;

    if (kdrRights) {
        const rights = [];
        if (document.getElementById("kdrEvac").checked) rights.push("ewakuacji ludzi z rejonu objętego działaniem ratowniczym w przypadku zagrożenia życia i zdrowia");
        if (document.getElementById("kdrBanStay").checked) rights.push("zakazu przebywania w rejonie objętym działaniem ratowniczym osób postronnych oraz utrudniających prowadzenie działania ratowniczego");
        if (document.getElementById("kdrEvacProp").checked) rights.push("ewakuacji mienia");
        if (document.getElementById("kdrDemol").checked) rights.push("prac wyburzeniowych oraz rozbiórkowych");
        if (document.getElementById("kdrCommBlock").checked) rights.push("wstrzymania komunikacji w ruchu lądowym");
        if (document.getElementById("kdrAcceptUse").checked) rights.push("przyjęcia w użytkowanie, na czas niezbędny do działania ratowniczego, pojazdów, środków technicznych i innych przedmiotów, a także ujęć wody, środków gaśniczych oraz nieruchomości przydatnych w działaniu ratowniczym, z wyjątkiem przypadków określonych w art. 24 ustawy z dnia 24 sierpnia 1991 r. o ochronie przeciwpożarowej (Dz. U. Nr 81, poz 351)");
        if (document.getElementById("kdrAbandonRules").checked) rights.push("odstąpienia od zasad uznanych za bezpieczne");
        if (rights.length > 0) {
            const formattedRights = rights.map((item, index) => {
                const isLast = index === rights.length - 1;
                return `- ${item}${isLast ? '.' : ','}`;
            }).join("\n");
            outputText += `\n${formattedRights}`;
        }
    }
    const hydrantType = document.getElementById("hydrantType")?.value || "";
    const hydrantState = document.getElementById("hydrantState")?.value || "";
    const hydrantMarking = document.getElementById("hydrantMarking")?.value || "";
    const hydrantStreet = document.getElementById("hydrantStreet")?.value || "";
    const hydrantLowTemp = document.getElementById("hydrantLowTemp")?.checked || false;

    if (hydrantType && hydrantMarking && hydrantStreet) {
        outputText += `\n\nHydrant: ${hydrantType}`;

        if (!hydrantLowTemp && hydrantState) {
            outputText += `, ${hydrantState}`;
        }

        outputText += `, ${hydrantMarking} - ul. ${hydrantStreet}`;
        outputText += hydrantLowTemp ? " - nie sprawdzono ze względu na ujemną temperaturę." : ".";
    }

    document.getElementById("output").value = outputText;

    const weather = document.getElementById("weatherCondition")?.value || "";
    const temp = document.getElementById("temperature")?.value || "";
    const windSpeed = document.getElementById("windSpeed")?.value || "";
    const windDir = document.getElementById("windDir")?.value || "";
    const pressureEnabled = document.getElementById("pressureToggle")?.checked || false;
    const pressureVal = document.getElementById("pressureVal")?.value || "";

    if (weather && temp && windSpeed && windDir) {
        outputText += `\n\nTemp. ${temp}°C, ${weather}, wiatr ${windSpeed} km/h ${windDir}`;
        if (pressureEnabled && pressureVal) outputText += `, ${pressureVal} hPa`;
        outputText += ".\n";
    }

    document.getElementById("output").value = outputText;
}

function updateHandoverStatus() {
    const value = document.getElementById("status").value;
    const output = document.getElementById("output");
    let handoverText = "";

    if (value === "1") handoverText = "Miejsce zdarzenia wraz z zaleceniem ___________ przekazano.";
    else if (value === "2") handoverText = "Miejsca zdarzenia nie przekazano ze względu na fakt, iż służbą wiodącą była Policja, o czym poinformowano SKKM.";
    else if (value === "3") handoverText = "Miejsca zdarzenia nie przekazano ze względu na brak podjętych działań ratowniczych, o czym poinformowano SKKM.";
    else if (value === "4") handoverText = "Miejsca zdarzenia nie przekazano ze względu na brak właściciela obiektu, o czym poinformowano SKKM.";
    else if (value === "5") handoverText = "Miejsca zdarzenia nie przekazano ze względu na charakter zdarzenia i brak szkód, o czym poinformowano SKKM.";
    else if (value === "6") handoverText = "Miejsca zdarzenia nie przekazano ze względu na brak właściciela obiektu na miejscu zdarzenia, o czym poinformowano SKKM.";

    const currentLines = output.value.trim().split("\n");
    const withoutOldHandover = currentLines.filter(line =>
        !line.includes("Miejsce zdarzenia") && !line.includes("Miejsca zdarzenia")
    );

    if (handoverText) {
        output.value = withoutOldHandover.join("\n") + "\n" + handoverText;
    } else {
        output.value = withoutOldHandover.join("\n");
    }
}

function saveOutput() {
    const output = document.getElementById("output").value;
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "opis.txt";
    link.click();
}

function copyDescriptionOnly() {
    const output = document.getElementById("output").value;
    const lines = output.trim().split("\n");
    const tempIndex = lines.findIndex(line => line.trim().startsWith("Temp."));
    const relevantLines = tempIndex !== -1 ? lines.slice(0, tempIndex) : lines;
    navigator.clipboard.writeText(relevantLines.join("\n").trim());
}

function copySelectedServices() {
    const checkboxes = document.querySelectorAll(".copy-eligible:checked");

    const selected = Array.from(checkboxes)
        .map(cb => cb.value.trim().replace(/,$/, ''));

    if (selected.length > 0) {
        navigator.clipboard.writeText(selected.join(", "))
            .catch(err => alert("Błąd kopiowania: " + err));
    } else {
        alert("Nic nie zaznaczono do skopiowania.");
    }
}

function copyWeather() {
    const output = document.getElementById("output").value.trim();
    const lines = output.split("\n").filter(line => line.trim().startsWith("Temp."));
    const lastLine = lines.length > 0 ? lines[lines.length - 1] : "";
    if (lastLine) navigator.clipboard.writeText(lastLine);
}

function copyHandover() {
    const output = document.getElementById("output").value.trim();
    const lines = output.split("\n");
    const handoverLine = lines.find(line => line.includes("Miejsce zdarzenia") || line.includes("Miejsca zdarzenia"));
    if (handoverLine) navigator.clipboard.writeText(handoverLine);
}

function updateWindSpeedMS() {
    const kmh = document.getElementById("windSpeed").value;
    const ms = kmh ? Math.round(parseFloat(kmh) / 3.6) : 0;
    document.getElementById("windSpeedMS").textContent = `(~${ms} m/s)`;
}