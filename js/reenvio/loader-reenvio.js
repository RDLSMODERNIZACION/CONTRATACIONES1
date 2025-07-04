(async function iniciarLoaderReenvio() {
  console.log("🚀 loader-reenvio.js ejecutándose...");

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (!id) throw new Error("ID de trámite no proporcionado");

    const hojaURL =
      "https://script.google.com/macros/s/AKfycbyxGFKK_epg_OMC_DlIHpiZdLrMh8CY0f_sbJ9M7oyW_ySwfx_a7XivMumymIYBLKsbIg/exec";

    const response = await fetch(`${hojaURL}?t=${Date.now()}`);
    const pedidos = await response.json();

    const pedido = pedidos.find((p) => p.IDTRAMITE === id);
    if (!pedido) {
      document.getElementById("contenedor-reenvio").innerHTML =
        `<div class="alert alert-danger">❌ No se encontró el pedido con ID ${id}</div>`;
      return;
    }

    const campoId = document.querySelector('#id-tramite');
    if (campoId) campoId.value = pedido.IDTRAMITE || '';

    const campoObservacion = document.querySelector('#observacion');
    if (campoObservacion) campoObservacion.value = pedido["MOTIVO OBSERVACION"] || '';

    const campoDetalle = document.querySelector('#detalle');
    if (campoDetalle) campoDetalle.value = pedido["DETALLE"] || '';

    console.log("📝 Pedido encontrado:", pedido);
    console.log("🧩 MODULO bruto:", pedido.MODULO);

    const modulosRaw = pedido.MODULO || "";
    const modulos = modulosRaw
      .split(",")
      .map(m => m.trim().replace(/^["']|["']$/g, '').toLowerCase())
      .filter(Boolean);

    console.log("🧩 Módulos detectados:", modulos);

    const campoModulo = document.querySelector('input[name="modulo"]');
    if (campoModulo) campoModulo.value = modulos.join(', ');

    const campoSecretaria = document.querySelector('input[name="secretaria"]');
    if (campoSecretaria && pedido.Secretaria) campoSecretaria.value = pedido.Secretaria.trim();

    // Cargar dinámicamente cada módulo
    for (const modulo of modulos) {
      try {
        const htmlResponse = await fetch(`/modulos/${modulo}/${modulo}.html`);
        if (!htmlResponse.ok) throw new Error(`No se pudo cargar HTML de "${modulo}"`);
        const html = await htmlResponse.text();
        document.getElementById("contenedor-reenvio").insertAdjacentHTML("beforeend", html);

        const script = document.createElement("script");
        script.src = `/modulos/${modulo}/${modulo}.js`;
        document.body.appendChild(script);

        await new Promise(resolve => {
          script.onload = () => {
            console.log(`✅ Módulo ${modulo} cargado`);

            const nombreFuncion = `inicializarModulo${capitalizarPrimeraLetra(modulo)}`;
            if (typeof window[nombreFuncion] === 'function') {
              window[nombreFuncion]();
              console.log(`🚀 ${nombreFuncion}() ejecutado`);
            } else {
              console.warn(`⚠️ No se encontró ${nombreFuncion}() para inicializar ${modulo}`);
            }

            resolve();
          };
        });

      } catch (modError) {
        console.error(`❌ Error al cargar módulo "${modulo}":`, modError);
      }
    }

    console.log("✅ Todos los módulos cargados y listos.");
    window.todosLosModulosListos = true;

  } catch (error) {
    console.error("❌ Error en loader-reenvio:", error);
    const contenedor = document.getElementById("contenedor-reenvio");
    if (contenedor) {
      contenedor.innerHTML = `<div class="alert alert-danger">Error al cargar el pedido: ${error.message}</div>`;
    }
  }
})();

function capitalizarPrimeraLetra(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
