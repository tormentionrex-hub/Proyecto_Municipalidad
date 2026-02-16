import {
    getReportes,
    deleteReportes,
    patchReportes
} from '../services/services.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard Admin de la Municipalidad de Escazú cargado');

    // --- Lógica del Dashboard Original ---

    // Botón de cierre de sesión
    const botonCerrarSesion = document.getElementById('botonCerrarSesion');
    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                window.location.href = './login.html';
            }
        });
    }

    // Cambio de Pestañas (Tabs de Dashboard)
    const botonesPestana = document.querySelectorAll('.botonPestana');
    botonesPestana.forEach(btn => {
        btn.addEventListener('click', () => {
            botonesPestana.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            const nombrePestana = btn.getAttribute('data-tab');
            console.log(`Cambiando a la pestaña: ${nombrePestana}`);
        });
    });

    // Selector de periodo
    const selectorPeriodo = document.getElementById('selectorPeriodo');
    if (selectorPeriodo) {
        selectorPeriodo.addEventListener('change', (e) => {
            const dias = e.target.value;
            console.log(`Actualizando datos para los últimos ${dias} días`);
            alert(`Actualizando tablero para los últimos ${dias} días...`);
        });
    }

    // --- Lógica de Gestión de Reportes (Nueva) ---

    const navDashboard = document.getElementById('navDashboard');
    const navReportes = document.getElementById('navReportes');
    const vistaDashboard = document.getElementById('vistaDashboard');
    const vistaReportes = document.getElementById('vistaReportes');
    const cuerpoTabla = document.getElementById('cuerpoTablaReportes');
    const btnRecargar = document.getElementById('btnRecargarReportes');
    const buscadorReportes = document.getElementById('buscadorReportes');

    // Navegación Sidebar
    if (navDashboard && navReportes && vistaDashboard && vistaReportes) {
        navDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            vistaDashboard.classList.remove('oculto');
            vistaReportes.classList.add('oculto');

            navDashboard.classList.add('activo');
            navReportes.classList.remove('activo');
        });

        navReportes.addEventListener('click', (e) => {
            e.preventDefault();
            vistaDashboard.classList.add('oculto');
            vistaReportes.classList.remove('oculto');

            navDashboard.classList.remove('activo');
            navReportes.classList.add('activo');

            cargarReportes(); // Cargar datos al entrar
        });
    }

    if (btnRecargar) {
        btnRecargar.addEventListener('click', cargarReportes);
    }

    // Buscador en tiempo real (filtrado simple)
    if (buscadorReportes) {
        buscadorReportes.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            const filas = cuerpoTabla.querySelectorAll('tr');
            let contador = 0;

            filas.forEach(fila => {
                const texto = fila.innerText.toLowerCase();
                if (texto.includes(termino)) {
                    fila.style.display = '';
                    contador++;
                } else {
                    fila.style.display = 'none';
                }
            });
            document.getElementById('contadorReportes').textContent = `${contador} reportes encontrados`;
        });
    }

    async function cargarReportes() {
        if (!cuerpoTabla) return;

        cuerpoTabla.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando reportes...</td></tr>';

        try {
            const reportes = await getReportes();
            renderizarReportes(reportes);
        } catch (error) {
            console.error("Error cargando reportes:", error);
            cuerpoTabla.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error al cargar reportes.</td></tr>';
        }
    }

    function renderizarReportes(reportes) {
        cuerpoTabla.innerHTML = '';
        const contadorElem = document.getElementById('contadorReportes');
        if (contadorElem) contadorElem.textContent = `${reportes.length} reportes encontrados`;

        if (reportes.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay reportes registrados.</td></tr>';
            return;
        }

        reportes.forEach(reporte => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="celdaReporte">
                        <div class="iconoTipoReporte ${getClaseTipo(reporte.tipo)}">
                            <i class="${getIconoTipo(reporte.tipo)}"></i>
                        </div>
                        <div class="infoReporte">
                            <h4>${reporte.titulo || 'Reporte Comunal'}</h4>
                            <span class="badgeEstado ${getClaseEstado(reporte.estado)}">${reporte.estado || 'Pendiente'}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="celdaContacto">
                        <div><strong>${reporte.usuario || 'Anónimo'}</strong></div>
                        <div style="font-size: 0.85rem; color: #888;">${reporte.contacto || 'Sin contacto'}</div>
                    </div>
                </td>
                <td>
                     <div class="celdaUbicacion">
                         <i class="fas fa-map-marker-alt"></i> ${reporte.ubicacion || 'Sin ubicación específica'}
                     </div>
                </td>
                <td>
                     <div class="celdaFecha">
                         <i class="far fa-calendar-alt"></i> ${reporte.fecha || '01/01/2026'}
                     </div>
                </td>
                <td>
                    <div class="celdaAcciones">
                        <button class="btnAccion btnEditar" data-id="${reporte.id}" title="Cambiar Estado"><i class="fas fa-edit"></i></button>
                        <button class="btnAccion btnEliminar" data-id="${reporte.id}" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            cuerpoTabla.appendChild(tr);
        });
    }

    // Event Delegation para Botones de la tabla
    if (cuerpoTabla) {
        cuerpoTabla.addEventListener('click', async (e) => {
            const btnEliminar = e.target.closest('.btnEliminar');
            const btnEditar = e.target.closest('.btnEditar');

            if (btnEliminar) {
                const id = btnEliminar.dataset.id;
                if (confirm('¿Estás seguro de eliminar este reporte de forma permanente?')) {
                    try {
                        await deleteReportes(id);
                        alert('Reporte eliminado correctamente');
                        cargarReportes(); // Recargar tabla
                    } catch (error) {
                        alert('Error al eliminar el reporte');
                    }
                }
            }

            if (btnEditar) {
                const id = btnEditar.dataset.id;
                // Simple sistema de cambio de estado
                const actual = e.target.closest('tr').querySelector('.badgeEstado').innerText;
                const nuevoEstado = prompt(`Estado actual: ${actual}.\nEscribe el nuevo estado (Pendiente, En Proceso, Resuelto):`, actual);

                if (nuevoEstado && nuevoEstado !== actual) {
                    try {
                        await patchReportes({ estado: nuevoEstado }, id);
                        // alert('Estado actualizado'); No es necesario alertar si se ve el cambio
                        cargarReportes();
                    } catch (error) {
                        alert('Error al actualizar el estado');
                    }
                }
            }
        });
    }

    // Helpers de Estilo
    function getClaseTipo(tipo) {
        if (!tipo) return 'tipo-otro';
        const t = tipo.toLowerCase();
        if (t.includes('seguridad') || t.includes('robo')) return 'tipo-seguridad';
        if (t.includes('infraestructura') || t.includes('calle') || t.includes('bache')) return 'tipo-infraestructura';
        if (t.includes('ambiente') || t.includes('basura') || t.includes('arbol')) return 'tipo-ambiental';
        return 'tipo-otro';
    }

    function getIconoTipo(tipo) {
        if (!tipo) return 'fas fa-exclamation-circle';
        const t = tipo.toLowerCase();
        if (t.includes('seguridad')) return 'fas fa-shield-alt';
        if (t.includes('infraestructura')) return 'fas fa-road';
        if (t.includes('ambiente')) return 'fas fa-tree';
        return 'fas fa-exclamation-circle';
    }

    function getClaseEstado(estado) {
        if (!estado) return 'estado-pendiente';
        const e = estado.toLowerCase();
        if (e.includes('proceso')) return 'estado-en-proceso';
        if (e.includes('resuelto') || e.includes('finalizado')) return 'estado-resuelto';
        return 'estado-pendiente';
    }

});
