(async function iniciarLoader() {
  console.log('🚀 loader.js ejecutándose...');

  try {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!usuario) {
      console.error('❌ No se encontró usuario en localStorage.');
      alert('Sesión no iniciada. Redirigiendo al login...');
      window.location.href = '../index.html';
      return;
    }

    const secretaria = usuario.secretaria;
    const nombre = usuario.nombre;

    await esperarElemento('#info-nombre');
    await esperarElemento('#info-secretaria');
    await esperarElemento('#titulo-secretaria');

    console.log('🎯 Escribiendo datos en spans...');
    console.log('nombre:', nombre);
    console.log('secretaria:', secretaria);

    const spanNombre = document.getElementById('info-nombre');
    const spanSecretaria = document.getElementById('info-secretaria');
    const tituloSecretaria = document.getElementById('titulo-secretaria');

    if (spanNombre) spanNombre.innerText = nombre;
    if (spanSecretaria) spanSecretaria.innerText = secretaria;
    if (tituloSecretaria) tituloSecretaria.innerText = secretaria;

    console.log(`✅ Usuario cargado: ${nombre} - Secretaría: ${secretaria}`);

    const response = await fetch('../config/config_secretarias.json');
    const texto = await response.text();
    console.log('🧩 Respuesta recibida:', texto);

    const config = JSON.parse(texto);
    const modulosSecretaria = config[secretaria]?.modulos || [];

    

    await cargarModulo('general'); // Siempre cargar primero el módulo general

// 👉 Cargar "obras" solo si está en la lista
if (modulosSecretaria.includes('obras')) {
  await cargarModulo('obras');
}

// 👉 Insertar selector de módulos luego de "general" y "obras"
const contenedor = document.getElementById('contenedor-modulos');
contenedor.insertAdjacentHTML('beforeend', `
  <div class="mb-4" id="selector-de-modulos">
    <label for="moduloSelector" class="form-label fw-bold text-secondary">📂 Seleccioná un tipo de trámite:</label>
    <select id="moduloSelector" class="form-select">
      <option value="">-- Elegí un módulo --</option>
    </select>
  </div>
`);



// 👉 Filtrar módulos que no son 'general' ni 'obras', normalizando todo a minúsculas
const modulosDinamicos = modulosSecretaria
  .map(m => m.toLowerCase())
  .filter(m => m !== 'general' && m !== 'obras');

console.log('🧪 Módulos dinámicos para el selector:', modulosDinamicos);


// 👉 Esperar un frame para asegurarse de que #moduloSelector ya esté en el DOM
await new Promise(resolve => setTimeout(resolve, 0));
const select = document.getElementById('moduloSelector');

for (const modulo of modulosDinamicos) {
  const opt = document.createElement('option');
  opt.value = modulo;
  opt.textContent = capitalizarPrimeraLetra(modulo);
  select.appendChild(opt);
}


// 👉 Evento para cargar módulo al seleccionar
select.addEventListener('change', async (e) => {
  const moduloSeleccionado = e.target.value;
  if (moduloSeleccionado) {
    e.target.disabled = true; // Opcional: bloquea el selector tras selección
    try {
      await cargarModulo(moduloSeleccionado);
    } catch (errorModulo) {
      console.error(`⚠️ Error cargando módulo "${moduloSeleccionado}":`, errorModulo);
    }
  }
});


    console.log('✅ Todos los módulos cargados exitosamente.');

    // 🚀 Ahora cargar el formulario.js, pero solo si todo salió bien
    const scriptFormulario = document.createElement('script');
    scriptFormulario.src = '../js/formulario.js';
    scriptFormulario.type = 'module'; // <- 🔥 ESTO ES CLAVE
  document.body.appendChild(scriptFormulario);


    scriptFormulario.onload = () => {
      console.log('✅ formulario.js cargado y ejecutado.');
    };

  } catch (error) {
    console.error('❌ Error durante la carga inicial:', error);
    const contenedor = document.getElementById('contenedor-modulos');
    if (contenedor) {
      contenedor.innerHTML = `<p class="text-danger">Error al cargar el formulario. Intente recargar la página.</p>`;
    }
  }
})();




// 🚀 Funciones auxiliares

function esperarElemento(selector) {
  return new Promise(resolve => {
    const esperar = () => {
      if (document.querySelector(selector)) {
        resolve();
      } else {
        requestAnimationFrame(esperar);
      }
    };
    esperar();
  });
}

async function cargarModulo(nombreModulo) {
  try {
    console.log(`⏳ Intentando cargar HTML de módulo: ${nombreModulo}`);
    const response = await fetch(`/modulos/${nombreModulo}/${nombreModulo}.html`);
    
    if (!response.ok) {
      throw new Error(`No se pudo cargar el HTML del módulo "${nombreModulo}". Estado: ${response.status}`);
    }

    const html = await response.text();
    document.getElementById('contenedor-modulos').insertAdjacentHTML('beforeend', html);

    await new Promise(resolve => setTimeout(resolve, 0)); // Esperar 1 frame para asegurar que el DOM procese

    const script = document.createElement('script');
    script.src = `/modulos/${nombreModulo}/${nombreModulo}.js`;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log(`✅ Módulo ${nombreModulo} cargado.`);
      const nombreFuncion = `inicializarModulo${capitalizarPrimeraLetra(nombreModulo)}`;
      if (typeof window[nombreFuncion] === 'function') {
        console.log(`🚀 Inicializando ${nombreFuncion}() automáticamente...`);
        window[nombreFuncion]();
      } else {
        console.warn(`⚠️ No se encontró función ${nombreFuncion}() para inicializar ${nombreModulo}.`);
      }
    };

  } catch (error) {
    console.error(`❌ Error cargando módulo ${nombreModulo}:`, error);
    throw error; // Para que en iniciarLoader() capture también el error del módulo individual
  }
}

function capitalizarPrimeraLetra(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

