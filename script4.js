function init() {
      const secondsSelect = document.getElementById("secondsSelect");
      for (let i = 0; i < 60; i++) {
        const val = i.toString().padStart(2, '0');
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val;
        secondsSelect.appendChild(opt);
      }

      document.getElementById("dispatchTime").addEventListener("input", generateDispatchText);
      document.getElementById("secondsSelect").addEventListener("change", generateDispatchText);
      document.getElementById("dispatchVehicle").addEventListener("change", generateDispatchText);
      generateDispatchText(); // inicjalne wygenerowanie
    }

    function formatReportNumber() {
      const input = document.getElementById("dispatchReportNumber");
      let val = input.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

      if (val.length > 1) {
        val = val.slice(0,1) + "-" + val.slice(1,5);
      }
      input.value = val.slice(0,6);
    }

    function generateDispatchText() {
      const timeInput = document.getElementById("dispatchTime").value;
      const vehicle = document.getElementById("dispatchVehicle").value;
      const seconds = document.getElementById("secondsSelect").value;
      const reportNumberEnd = document.getElementById("dispatchReportNumber").value.trim();
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
        ("0" + dateObj.getMinutes()).slice(-2) + ":" +
        seconds;

      const fixedPrefix = "120100";
      const reportText = reportNumberEnd ? ` nr meldunku ${fixedPrefix}${reportNumberEnd}.` : "";

      output.value = `-${formatted}: ${vehicle}${reportText}`;
    }

    function copyDispatch() {
      const output = document.getElementById("dispatchOutput");
      navigator.clipboard.writeText(output.value).then(() => {
        alert("Skopiowano do schowka!");
      });
    }