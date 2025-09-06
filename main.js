// Obtener parámetros de la URL
const params = new URLSearchParams(window.location.search);
const nombreParam = params.get("nombre");

// Si existe el parámetro, reemplazar el texto en #nombre
if (nombreParam) {
  const nombreElement = document.getElementById("nombre");

  nombreElement.textContent = nombreParam.replace("_", " ");
}

document.addEventListener("DOMContentLoaded", () => {
  // Fecha del evento (ajústala a la que necesites)
  const fechaEvento = new Date("2025-10-25T16:00:00").getTime();
  const contador = document.getElementById("contador");

  function actualizarContador() {
    const ahora = new Date().getTime();
    const diferencia = fechaEvento - ahora;

    if (diferencia <= 0) {
      contador.innerHTML = "<p>¡El evento ha comenzado! 🎉</p>";
      clearInterval(intervalo);
      return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor(
      (diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    contador.innerHTML = `
        <div class="contbox">${dias}<span>días</span></div>
        <div class="contbox">${horas}<span>horas</span></div>
        <div class="contbox">${minutos}<span>minutos</span></div>
        <div class="contbox">${segundos}<span>segundos</span></div>
      `;
  }

  // Actualiza cada segundo
  const intervalo = setInterval(actualizarContador, 1000);
  actualizarContador(); // primera ejecución
});
