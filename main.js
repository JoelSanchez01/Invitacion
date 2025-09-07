// ===============================
// 1) Parámetro "nombre" desde la URL
// ===============================
const params = new URLSearchParams(window.location.search);
const nombreParam = params.get("nombre");

if (nombreParam) {
  const nombreElement = document.getElementById("nombre");
  if (nombreElement) {
    // Reemplaza TODOS los guiones bajos por espacio: ?nombre=Ana_Victoria -> "Ana Victoria"
    nombreElement.textContent = nombreParam.replace(/_/g, " ");
  }
}

// ===============================
// 2) Lógica que requiere el DOM listo
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------
  // 2.1) CONTADOR REGRESIVO
  // ---------------------------------
  // Ajusta la fecha/hora a la de tu evento (zona local del navegador)
  const fechaEvento = new Date("2025-10-25T16:00:00").getTime();
  const contador = document.getElementById("contador");

  function actualizarContador() {
    if (!contador) return;

    const ahora = Date.now();
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

  const intervalo = setInterval(actualizarContador, 1000);
  actualizarContador(); // primera ejecución inmediata

  // ---------------------------------
  // 2.2) CARRUSEL SWIPE (sin botones) con anime.js
  // Estructura esperada en HTML:
  // <div class="carrusel">
  //   <div class="carrusel__contenedor">
  //     <div class="carrusel__item"><img src="..."></div>
  //     ...
  //   </div>
  // </div>
  // ---------------------------------
  const carrusel = document.querySelector(".carrusel");
  if (carrusel) {
    const contenedor = carrusel.querySelector(".carrusel__contenedor");
    const items = carrusel.querySelectorAll(".carrusel__item");
    if (contenedor && items.length > 0) {
      let indice = 0;

      // Estado del gesto
      let startX = 0;
      let currentX = 0;
      let deltaX = 0;
      let isDragging = false;
      let startTranslateX = 0;

      const width = () => carrusel.getBoundingClientRect().width;

      const slideTo = (i, dur = 400) => {
        // Limitar a los extremos
        if (i < 0) i = 0;
        if (i > items.length - 1) i = items.length - 1;
        indice = i;

        anime({
          targets: contenedor,
          translateX: -indice * width(),
          duration: dur,
          easing: "easeInOutQuad",
        });
      };

      // Posicionar en el inicio
      anime.set(contenedor, { translateX: 0 });

      // Helpers de gesto
      const onDragStart = (clientX) => {
        isDragging = true;
        carrusel.classList.add("grabbing");
        startX = clientX;

        // Leer translateX actual del contenedor
        const matrix = getComputedStyle(contenedor).transform;
        const tx = matrix !== "none" ? parseFloat(matrix.split(",")[4]) : 0;
        startTranslateX = isNaN(tx) ? 0 : tx;

        // Cancelar animación en curso
        anime.remove(contenedor);
      };

      const onDragMove = (clientX) => {
        if (!isDragging) return;
        currentX = clientX;
        deltaX = currentX - startX;

        // Movimiento con resistencia en bordes
        let nextX = startTranslateX + deltaX;
        const maxLeft = 0;
        const maxRight = -(items.length - 1) * width();

        if (nextX > maxLeft) {
          nextX = maxLeft + (nextX - maxLeft) * 0.35;
        }
        if (nextX < maxRight) {
          nextX = maxRight + (nextX - maxRight) * 0.35;
        }

        anime.set(contenedor, { translateX: nextX });
      };

      const onDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        carrusel.classList.remove("grabbing");

        const threshold = width() * 0.15; // 15% del ancho para decidir cambio
        if (deltaX > threshold) {
          // arrastre hacia derecha -> slide anterior
          slideTo(indice - 1);
        } else if (deltaX < -threshold) {
          // arrastre hacia izquierda -> siguiente slide
          slideTo(indice + 1);
        } else {
          // volver al actual
          slideTo(indice);
        }

        deltaX = 0;
      };

      // Eventos pointer (cubre mouse + touch)
      carrusel.addEventListener("pointerdown", (e) => {
        // solo botón principal si es mouse
        if (e.pointerType === "mouse" && e.button !== 0) return;
        carrusel.setPointerCapture(e.pointerId);
        onDragStart(e.clientX);
      });

      carrusel.addEventListener("pointermove", (e) => onDragMove(e.clientX));
      carrusel.addEventListener("pointerup", onDragEnd);
      carrusel.addEventListener("pointercancel", onDragEnd);
      carrusel.addEventListener("pointerleave", () => {
        if (isDragging) onDragEnd();
      });

      // Reajustar al cambiar de tamaño de pantalla
      window.addEventListener("resize", () => slideTo(indice, 0));

      // Autoplay (opcional): avanza solo si no está siendo tocado
      let autoplayId = setInterval(() => slideTo(indice + 1), 4000);
      carrusel.addEventListener("pointerdown", () => {
        if (autoplayId) {
          clearInterval(autoplayId);
          autoplayId = null;
        }
      });
      carrusel.addEventListener("pointerup", () => {
        if (!autoplayId)
          autoplayId = setInterval(() => slideTo(indice + 1), 4000);
      });
    }
  }
});
