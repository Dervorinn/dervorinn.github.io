// zakładam, że flatpickr jest już załadowany globalnie

function initializeTab4() {
  flatpickr("#dispatchDatetime", {
    enableTime: true,
    enableSeconds: true,
    time_24hr: true,
    dateFormat: "d-m-Y H:i:S",
    defaultDate: new Date(),
    onChange: generateDispatch
  });

  document.getElementById("dispatchVehicle").addEventListener("change", generateDispatch);
  document.getElementById("dispatchReportNumber").addEventListener("input", () => {
    formatReportNumber();
    generateDispatch();
  });

  // generujemy początkowo
  generateDispatch();
}

function formatReportNumber() {
  const input = document.getElementById("dispatchReportNumber");
  let val = input.value.toUpperCase();

  val = val.replace(/[^A-Z0-9]/g, "");

  if (val.length > 1) {
    val = val.slice(0,1) + "-" + val.slice(1,6);
  }

  val = val.slice(0,6);

  input.value = val;
}

function generateDispatch() {
  const datetime = document.getElementById("dispatchDatetime").value;
  const vehicle = document.getElementById("dispatchVehicle").value;
  const reportNumberEnd = document.getElementById("dispatchReportNumber").value.trim();
  const output = document.getElementById("dispatchOutput");

  if (!datetime || !vehicle) {
    output.value = "";
    return;
  }

  const fixedPrefix = "120100";
  const reportText = reportNumberEnd ? ` nr meldunku ${fixedPrefix}${reportNumberEnd}.` : "";

  output.value = `-${datetime}: ${vehicle}${reportText}`;
}

function copyDispatch() {
  const output = document.getElementById("dispatchOutput");
  navigator.clipboard.writeText(output.value).then(() => {
    alert("Skopiowano do schowka!");
  });
}
