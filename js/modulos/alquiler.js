export function obtenerDatosAlquiler() {
    const modulo = document.querySelector('[data-modulo="alquiler"]');
    const datos = {};
  
    datos.rubro = modulo.querySelector('input[name="tipoAlquiler"]:checked')?.value || '';
  
    datos.detalleUso =
      modulo.querySelector('#usoEdificioAlquiler')?.value ||
      modulo.querySelector('#usoMaquinariaAlquiler')?.value ||
      modulo.querySelector('#usoOtrosAlquiler')?.value || '';
  
    datos.objeto =
      modulo.querySelector('#ubicacionEdificioAlquiler')?.value ||
      modulo.querySelector('#tipoMaquinariaAlquiler')?.value ||
      modulo.querySelector('#detalleOtrosAlquiler')?.value || '';
  
    datos.requiereCombustible = document.getElementById('combustibleAlquiler')?.checked || false;
    datos.requiereChofer = document.getElementById('choferAlquiler')?.checked || false;
  
    // ✅ Cronograma simplificado
    datos.cronogramaDesde = document.getElementById('cronogramaDesde')?.value || '';
    datos.cronogramaHasta = document.getElementById('cronogramaHasta')?.value || '';
    datos.cronogramaHoras = document.getElementById('cronogramaHoras')?.value || '0';
  
    return datos;
  }
  