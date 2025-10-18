async function cargarVistaServicios() {
  const serviciosContainer = document.getElementById('services');
  
  if (!serviciosContainer) {
    console.error('No se encontró el contenedor de servicios');
    return;
  }

  try {
    const response = await fetch('../Dashboard/FormServicios.html');
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content = doc.querySelector('.register-container');
    
    if (content) {
      serviciosContainer.innerHTML = content.outerHTML;
      
      setTimeout(() => {
        inicializarEventosServicios();
        cargarServicios();
        cargarCategoriasEnFiltro();
      }, 100);
    } else {
      throw new Error('No se encontró el contenido de servicios');
    }
  } catch (error) {
    console.error('Error al cargar vista de servicios:', error);
    serviciosContainer.innerHTML = '<p class="error-message">Error al cargar servicios. Por favor, recarga la página.</p>';
  }
}

// Cargar categorías en el filtro
async function cargarCategoriasEnFiltro() {
  const selectFiltro = document.getElementById("filtroCategoria");
  if (!selectFiltro) return;

  try {
    const res = await fetch(`${API_URL_SERVICIOS}/categorias`);
    
    if (res.ok) {
      const categorias = await res.json();
      selectFiltro.innerHTML = '<option value="">Todas las categorías</option>';
      
      if (Array.isArray(categorias)) {
        categorias.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.categoria;
          option.textContent = `${cat.categoria} (${cat.servicios_activos} activos)`;
          selectFiltro.appendChild(option);
        });
      }
    }
  } catch (err) {
    console.error("Error al cargar categorías en filtro:", err);
  }
}

// Función para mostrar estadísticas
function mostrarEstadisticas(estadisticas) {
  const contenedor = document.getElementById("estadisticasServicios");
  if (!contenedor) return;

  const { generales, por_categoria } = estadisticas;
  contenedor.style.display = 'block';

  // Crear las tarjetas de estadísticas generales
  const tarjetasHTML = crearTarjetasEstadisticas(generales);
  const tablaHTML = crearTablaCategoria(por_categoria);

  contenedor.innerHTML = `
    <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: black; margin: 0;">
          <i class="fas fa-chart-line"></i> Estadísticas Generales
        </h3>
        <button class="btn-delete" onclick="ocultarEstadisticas()" style="padding: 6px 12px;">
          <i class="fas fa-times"></i>
        </button>
      </div>
      ${tarjetasHTML}
      ${tablaHTML}
    </div>
  `;
}

// Crear tarjetas de estadísticas (función auxiliar)
function crearTarjetasEstadisticas(generales) {
  const tarjetas = [
    { valor: generales.total_servicios, texto: 'Total Servicios', gradient: '#34495e' },
    { valor: generales.servicios_activos, texto: 'Servicios Activos', gradient: '#34495e' },
    { valor: generales.servicios_inactivos, texto: 'Servicios Inactivos', gradient: '#34495e' },
    { valor: generales.total_categorias, texto: 'Categorías', gradient: '#34495e' },
    { valor: `Q${parseFloat(generales.precio_promedio).toFixed(2)}`, texto: 'Precio Promedio', gradient: '#34495e' },
    { valor: `${Math.round(generales.tiempo_promedio_minutos)} min`, texto: 'Tiempo Promedio', gradient: '#34495e' }
  ];

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
      ${tarjetas.map(tarjeta => `
        <div style="background: ${tarjeta.gradient}; padding: 20px; border-radius: 10px; color: white; text-align: center;">
          <div style="font-size: ${typeof tarjeta.valor === 'string' && tarjeta.valor.includes('Q') ? '1.5rem' : '2rem'}; font-weight: bold; margin-bottom: 5px;">
            ${tarjeta.valor}
          </div>
          <div style="font-size: 0.9rem; opacity: 0.9;">${tarjeta.texto}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// Crear tabla de categorías (función auxiliar)
function crearTablaCategoria(por_categoria) {
  return `
    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
      <h4 style="color: black; margin-bottom: 15px;">
        <i class="fas fa-list-alt"></i> Estadísticas por Categoría
      </h4>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #34495e; color: white;">
              <th style="padding: 12px; text-align: left; border-radius: 8px 0 0 0;">Categoría</th>
              <th style="padding: 12px; text-align: center;">Total</th>
              <th style="padding: 12px; text-align: center;">Activos</th>
              <th style="padding: 12px; text-align: center; border-radius: 0 8px 0 0;">Precio Promedio</th>
            </tr>
          </thead>
          <tbody>
            ${por_categoria.map((cat, index) => {
              const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
              return `
                <tr style="background: ${bgColor}; border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 12px; font-weight: 500; color: black;">
                    <i class="fas fa-tag" style="color: #e67e22; margin-right: 8px;"></i>
                    ${cat.categoria}
                  </td>
                  <td style="padding: 12px; text-align: center; color: black;">
                    <strong>${cat.total}</strong>
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <span style="background: #d4edda; color: black; padding: 4px 12px; border-radius: 12px; font-weight: 600;">
                      ${cat.activos}
                    </span>
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <span style="background: #d4edda; color: black; padding: 4px 12px; border-radius: 12px; font-weight: 600;">
                    Q${parseFloat(cat.precio_promedio_categoria).toFixed(2)}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function ocultarEstadisticas() {
  const contenedor = document.getElementById("estadisticasServicios");
  if (contenedor) {
    contenedor.style.display = 'none';
    contenedor.innerHTML = '';
  }
}