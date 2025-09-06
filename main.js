// Obtener parámetros de la URL
const params = new URLSearchParams(window.location.search);
const nombreParam = params.get("nombre");

// Si existe el parámetro, reemplazar el texto en #nombre
if (nombreParam) {
  const nombreElement = document.getElementById("nombre");

  nombreElement.textContent = nombreParam.replace("_", " ");
}
