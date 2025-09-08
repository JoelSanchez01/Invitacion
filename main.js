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

// ====== POLEN FLOTANTE (anime.js) ======
(function initPollen() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const layer = document.querySelector(".pollen-layer");
  if (!layer) return;

  const W = window.innerWidth;
  const H = window.innerHeight;

  function makeDot() {
    const el = document.createElement("div");
    el.className = "pollen";
    // tamaño aleatorio
    const r = Math.random();
    if (r < 0.33) el.classList.add("pollen--sm");
    else if (r > 0.75) el.classList.add("pollen--lg");

    // posición inicial
    const x = Math.random() * W;
    const y = H + Math.random() * 40;
    el.style.transform = `translate(${x}px, ${y}px)`;
    layer.appendChild(el);

    animateDot(el);
    return el;
  }

  function animateDot(el) {
    const driftX = Math.random() * 80 - 40;
    const rise = H + 120;
    const dur = 8000 + Math.random() * 6000;
    const delay = Math.random() * 2000;
    const fadeIn = 600 + Math.random() * 600;

    el.style.opacity = 0;

    anime
      .timeline({
        autoplay: true,
        complete: () => {
          // Reinicia en otro punto (ciclo infinito)
          const x = Math.random() * window.innerWidth;
          const y = window.innerHeight + Math.random() * 40;
          anime.set(el, { translateX: x, translateY: y, opacity: 0 });
          animateDot(el);
        },
      })
      .add({
        targets: el,
        opacity: [0, 0.85],
        duration: fadeIn,
        easing: "easeOutQuad",
        delay,
      })
      .add(
        {
          targets: el,
          translateX: `+=${driftX}`,
          translateY: `-=${rise}`,
          duration: dur,
          easing: "easeInOutSine",
        },
        `-=${Math.min(fadeIn, 500)}`
      )
      .add(
        {
          targets: el,
          opacity: [0.85, 0],
          duration: 700,
          easing: "easeInQuad",
        },
        `-=${600}`
      );
  }

  // --- 1) Burst inicial fuerte ---
  for (let i = 0; i < 70; i++) makeDot(); // 50 de golpe

  // --- 2) Ambiente constante (cada cierto tiempo uno nuevo) ---
  setInterval(() => {
    makeDot();
  }, 1000); // cada 3 segundos aparece uno nuevo

  // --- Opcional: limpiar/recrear al resize ---
  let resizeTO;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => {
      // aquí podrías resetear el polen si quieres
    }, 150);
  });
})();

// ====== Aparición del título "Ana Victoria" (h1.namebb) ======
(function animateNamebb() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const title = document.querySelector(".namebb");
  if (!title) return;

  // Envolver cada carácter en <span class="char">
  const original = title.textContent;
  title.textContent = "";
  const frag = document.createDocumentFragment();
  [...original].forEach((ch) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch;
    frag.appendChild(span);
  });
  title.appendChild(frag);

  if (reduce) return; // respeta reduce-motion

  // Estado inicial
  anime.set(".namebb .char", { opacity: 0, translateY: 12 });

  // Timeline: abre un poco el tracking y entra letra por letra
  const tl = anime.timeline({ autoplay: true });
  tl.add({
    targets: ".namebb",
    letterSpacing: ["0.5px", "2px"],
    scale: [0.98, 1],
    duration: 800,
    easing: "easeOutCubic",
  }).add(
    {
      targets: ".namebb .char",
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 2000,
      delay: anime.stagger(35),
      easing: "easeOutQuad",
    },
    "-=400"
  );
})();

// Texto curvo (el <text> dentro del svg .sv)
(function animateCurveText() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const curveText = document.querySelector(".sv text");
  if (!curveText) return;
  anime.set(curveText, { opacity: 0, translateY: -8, letterSpacing: "2px" });
  anime({
    targets: curveText,
    opacity: 1,
    translateY: 0,
    letterSpacing: "6px",
    duration: 2000,
    delay: 150,
    easing: "easeOutQuad",
  });
})();

// Carreola (suave “float”), y "nuestra pequeña" + ramo en fade-in
(function animateOthers() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const carreola = document.querySelector(".imgcarreola");
  const subt = document.querySelector(".nuestrapeque");
  const ramo = document.querySelector(".ramo");

  if (carreola) {
    anime({
      targets: carreola,
      translateY: [0, -6],
      duration: 2200,
      easing: "easeInOutSine",
      direction: "alternate",
      loop: true,
    });
  }

  [subt, ramo].forEach((el, i) => {
    if (!el) return;
    anime.set(el, { opacity: 0, translateY: 10 });
    anime({
      targets: el,
      opacity: 1,
      translateY: 0,
      duration: 2000,
      delay: 300 + i * 120,
      easing: "easeOutQuad",
    });
  });
})();

(function animateGiftSectionNoClasses() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const regalos = document.querySelector(".regalos");
  if (!regalos) return;

  const texto = regalos.querySelector("p");
  const boton = regalos.querySelector("a[href]");
  const sobre = regalos.querySelector("img[src*='sobre']");
  const cenefa = document.querySelector(".bottom .bottomFlores");

  const revealOne = (el, opts = {}) => {
    if (!el) return;
    anime.set(el, { opacity: 0, translateY: 12 });
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          anime({
            targets: el,
            opacity: 1,
            translateY: 0,
            duration: 800,
            easing: "easeOutQuad",
            ...opts,
          });
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
  };

  revealOne(texto);
  revealOne(boton, {
    scale: [0.95, 1],
    duration: 900,
    easing: "spring(1,80,10,0)",
  });

  if (sobre) {
    anime.set(sobre, { opacity: 0, scale: 0.92, translateY: 12 });
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          anime({
            targets: sobre,
            opacity: 1,
            scale: 1,
            translateY: 0,
            duration: 800,
            easing: "easeOutCubic",
            complete: () => {
              anime({
                targets: sobre,
                translateY: [0, -6],
                duration: 2400,
                easing: "easeInOutSine",
                direction: "alternate",
                loop: true,
              });
            },
          });
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(sobre);
  }

  if (cenefa) {
    anime({
      targets: cenefa,
      translateY: [0, 4],
      rotate: [-0.5, 0.5],
      duration: 2600,
      easing: "easeInOutSine",
      direction: "alternate",
      loop: true,
    });
  }
})();
