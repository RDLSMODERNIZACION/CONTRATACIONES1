async function inicializarModuloGeneral() {
  console.log("🚀 Inicializando módulo General...");

  await esperarElemento("#fecha");
  await esperarElemento("#periodo");

  if (typeof flatpickr === "undefined") {
    console.log("⏳ Esperando a flatpickr...");
    await esperarFlatpickr();
  }

  const inputFecha = document.getElementById("fecha");
  const inputPeriodo = document.getElementById("periodo");
  const contenedorPresupuestos = document.getElementById("subida-presupuestos");
  const presupuesto1 = document.getElementById("presupuesto1");
  const presupuesto2 = document.getElementById("presupuesto2");

  if (inputFecha) {
    
    flatpickr(inputFecha, {
      dateFormat: "d/m/Y",
      locale: "es",
      defaultDate: "today",
      onChange: function(selectedDates) {
        const hoy = new Date();
        const seleccionada = selectedDates[0];
        const esHoy = seleccionada.toDateString() === hoy.toDateString();

        contenedorPresupuestos.classList.toggle("d-none", esHoy);
        presupuesto1.required = !esHoy;
        presupuesto2.required = !esHoy;
      }
    });
  }

  
// Verificar al iniciar si la fecha ya cargada es distinta a hoy
const hoy = new Date();
const seleccionada = flatpickr.parseDate(inputFecha.value, "d/m/Y");
if (seleccionada) {
  const esHoy = seleccionada.toDateString() === hoy.toDateString();
  contenedorPresupuestos.classList.toggle("d-none", esHoy);
  presupuesto1.required = !esHoy;
  presupuesto2.required = !esHoy;
}



  if (inputPeriodo) {
    flatpickr(inputPeriodo, {
      mode: "range",
      dateFormat: "d/m/Y",
      locale: "es"
    });
  }

  console.log("✅ Flatpickr inicializado correctamente en #fecha y #periodo");
}

function esperarElemento(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) return resolve();
    const observer = new MutationObserver((mutations, obs) => {
      if (document.querySelector(selector)) {
        resolve();
        obs.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

function esperarFlatpickr() {
  return new Promise(resolve => {
    if (typeof flatpickr !== "undefined") return resolve();
    const interval = setInterval(() => {
      if (typeof flatpickr !== "undefined") {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}
