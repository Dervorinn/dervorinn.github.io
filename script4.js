function initializeTab4() {
  const now = new Date();
  const local = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  const dispatchTimeInput = document.getElementById("dispatchTime");

  if (dispatchTimeInput) {
    dispatchTimeInput.value = local;
  }

  // Nasłuchiwacze
  document.getElementById("dispatchTime")?.addEventListener("input", generateDispatchText);
  document.getElementById("dispatchVehicle")?.addEventListener("change", generateDispatchText);
  document.getElementById("meldunekPrefix")?.addEventListener("input", generateDispatchText);
  document.getElementById("meldunekSuffix")?.addEventListener("input", () => {
    formatReportSuffix();
    generateDispatchText();
  });
  generateDispatchText();
}

function init() {
      // Ustawienie daty i godziny na teraz
      const now = new Date();
      const local = now.toISOString().slice(0, 16); // "yyyy-MM-ddTHH:mm"
      document.getElementById("dispatchTime").value = local;

      // Listener-y
      document.getElementById("dispatchTime").addEventListener("input", generateDispatchText);
      document.getElementById("dispatchVehicle").addEventListener("change", generateDispatchText);
      document.getElementById("meldunekPrefix").addEventListener("input", generateDispatchText);
      document.getElementById("meldunekSuffix").addEventListener("input", generateDispatchText);

      generateDispatchText(); // inicjalne wygenerowanie
    }

    function formatReportSuffix() {
      const input = document.getElementById("meldunekSuffix");
      let val = input.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

      if (val.length > 1) {
        val = val.slice(0,1) + "-" + val.slice(1,5);
      }

      input.value = val.slice(0,6);
    }

    function generateDispatchText() {
      const timeInput = document.getElementById("dispatchTime").value;
      const vehicle = document.getElementById("dispatchVehicle").value;
      const reportPrefix = document.getElementById("meldunekPrefix").value.trim();
      const reportSuffix = document.getElementById("meldunekSuffix").value.trim();
      const output = document.getElementById("dispatchOutput");

      if (!timeInput || !vehicle) {
        output.value = "";
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

      output.value = `-${formatted}: ${vehicle}${reportText}`;
    }

function copyDispatch() {
      const output = document.getElementById("dispatchOutput");
      navigator.clipboard.writeText(output.value).then(() => {
        alert("Skopiowano do schowka!");
      });
    }