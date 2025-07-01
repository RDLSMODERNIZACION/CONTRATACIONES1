document.addEventListener('DOMContentLoaded', async () => {
  await esperarEstadoPedido(); // Espera que se cargue el estado del DOM

  const estadoElem = document.getElementById("estado-pedido");
  const estado = estadoElem?.innerText.trim().toLowerCase();

  console.log("🕵️ Estado del pedido (normalizado):", estado);

  if (estado === "observado") {
    const contenedor = document.getElementById("boton-reenviar-container");
    if (contenedor) {
      contenedor.style.display = "block";
      console.log("✅ Botón 'Reenviar pedido' mostrado.");
    }
  } else {
    console.log("ℹ️ El estado no es 'observado', no se muestra botón de reenvío.");
  }

  const boton = document.getElementById("btn-reenviar");
  if (boton) {
    boton.addEventListener("click", () => {
      const confirmacion = confirm("Este pedido fue observado. ¿Deseás reenviarlo con modificaciones?");
      if (!confirmacion) return;

      if (!idPedidoGlobal) {
        alert("❌ No se pudo identificar el ID del trámite.");
        return;
      }

      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (!usuario || !usuario.secretaria) {
        alert("❌ No se pudo obtener la secretaría del usuario.");
        return;
      }

      // Normaliza el nombre de la secretaría para formar el nombre del archivo
      const secretaria = usuario.secretaria.toLowerCase().replace(/\s+/g, '');

      localStorage.setItem("modoReenvio", "true");
      localStorage.setItem("idReenvio", idPedidoGlobal);

      // Redirección al formulario correspondiente
      window.location.href = `../../vistas/pedidos/${secretaria}.html?modulo=formulario&id=${idPedidoGlobal}&modo=editar`;
    });
  }
});

function esperarEstadoPedido() {
  return new Promise(resolve => {
    const revisar = () => {
      const estadoElem = document.getElementById("estado-pedido");
      const texto = estadoElem?.innerText.trim();
      if (texto) {
        resolve();
      } else {
        requestAnimationFrame(revisar);
      }
    };
    revisar();
  });
}
