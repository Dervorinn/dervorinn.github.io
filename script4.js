function getLocalDatetimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function initializeTab4() {
  const local = getLocalDatetimeString();
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

  generateDispatchText(); // inicjalne wygenerowanie
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
  const timeInput = document.getElementById("dispatchTime")?.value;
  const vehicle = document.getElementById("dispatchVehicle")?.value;
  const reportPrefix = document.getElementById("meldunekPrefix")?.value.trim();
  const reportSuffix = document.getElementById("meldunekSuffix")?.value.trim();
  const output = document.getElementById("dispatchOutput");

  if (!timeInput || !vehicle || !output) {
    if (output) output.value = "";
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
  if (!output) return;

  navigator.clipboard.writeText(output.value).then(() => {
    alert("Skopiowano do schowka!");
  });
}
