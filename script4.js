window.pdfPath = "pdf/zasady.pdf";
window.pdfContainer = document.getElementById("pdfContainer");
fetch(window.pdfPath, { method: "HEAD" })
  .then(response => {
    if (response.ok) {
      window.pdfContainer.innerHTML = `
        <embed 
          src="${window.pdfPath}" 
          type="application/pdf" 
          style="width: 100%; height: 100%; border: none;"
        />
      `;
    } else {
      window.pdfContainer.innerHTML = `<p>Nie można załadować PDF: ${response.statusText}</p>`;
    }
  })
  .catch(err => {
    window.pdfContainer.innerHTML = `<p>Błąd przy ładowaniu PDF: ${err.message}</p>`;
  });
window.pdfContainer = document.getElementById("pdfContainer");
window.pdfContainer.style.minHeight = "90vh";
window.pdfContainer.style.height = "90vh";
window.pdfContainer.style.width = "100%";