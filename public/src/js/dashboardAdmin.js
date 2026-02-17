import {
    getReportes,
    deleteReportes,
    patchReportes,
} from '../services/services.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard Admin de la Municipalidad de Escazú cargado');

    // Validación de Rol de Administrador
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (!usuarioActivo || usuarioActivo.rol !== 'admin') {
        window.location.href = 'home.html';
        return;
    }

    // Cargar gráfico del dashboard principal
    fetchAndLoadChart();

    async function fetchAndLoadChart() {
        try {
            const reportes = await getReportes();
            actualizarGraficoTendencia(reportes);
            actualizarGraficoGeografia(reportes);
        } catch (error) {
            console.error("Error cargando datos para el gráfico:", error);
        }
    }

    // --- Gráfico Geografía (Horizontal) ---
    let chartGeografiaInstance = null;

    function actualizarGraficoGeografia(reportes) {
        const ctx = document.getElementById('graficoGeografia');
        if (!ctx) return;

        // Reutilizamos la lógica de procesamiento pero adaptada si es necesario
        // Cantones: San Antonio, San Rafael, Escazú Centro
        const cantonesObjetivo = ['San Antonio', 'San Rafael', 'Escazú Centro'];
        const datosProcesados = {
            'San Antonio': { baches: 0, alcantarillado: 0, senalizacion: 0 },
            'San Rafael': { baches: 0, alcantarillado: 0, senalizacion: 0 },
            'Escazú Centro': { baches: 0, alcantarillado: 0, senalizacion: 0 }
        };

        reportes.forEach(r => {
            const ubicacion = r.ubicacion || '';
            const tipo = (r.tipo_obstruccion || '').toLowerCase();

            let cantonKey = null;
            if (ubicacion.includes('Antonio')) cantonKey = 'San Antonio';
            else if (ubicacion.includes('Rafael')) cantonKey = 'San Rafael';
            else if (ubicacion.includes('Centro') || ubicacion.includes('Escazú')) cantonKey = 'Escazú Centro';

            if (cantonKey) {
                if (tipo.includes('bache')) datosProcesados[cantonKey].baches++;
                else if (tipo.includes('alcantarilla')) datosProcesados[cantonKey].alcantarillado++;
                else if (tipo.includes('señal') || tipo.includes('seña')) datosProcesados[cantonKey].senalizacion++;
            }
        });

        const datasets = [
            {
                label: 'Ingresos (Baches)', // Usando nombres inspirados en imagen pero con datos reales
                data: cantonesObjetivo.map(c => datosProcesados[c].baches),
                backgroundColor: '#fd7e14', // Naranja (Ingresos style)
                borderRadius: 5,
                barPercentage: 0.6
            },
            {
                label: 'Paquetes (Alcantarillado)', // Usando nombres inspirados en imagen
                data: cantonesObjetivo.map(c => datosProcesados[c].alcantarillado),
                backgroundColor: '#0d6efd', // Azul (Paquetes style)
                borderRadius: 5,
                barPercentage: 0.6
            },
            {
                label: 'Otros (Señalización)',
                data: cantonesObjetivo.map(c => datosProcesados[c].senalizacion),
                backgroundColor: '#20c997',
                borderRadius: 5,
                barPercentage: 0.6
            }
        ];

        if (chartGeografiaInstance) {
            chartGeografiaInstance.destroy();
        }

        chartGeografiaInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: cantonesObjetivo,
                datasets: datasets
            },
            options: {
                indexAxis: 'y', // Barra Horizontal
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end'
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }

    // --- Lógica del Dashboard Original ---

    // Botón de cierre de sesión
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                window.location.href = './login.html';
            }
        });
    }

    // Cambio de Pestañas (Tabs)
    const botonesPestana = document.querySelectorAll('.botonPestana');
    // Elementos de Paneles
    const panelResumen = document.getElementById('panelResumen');
    const panelGeografia = document.getElementById('panelGeografia');

    botonesPestana.forEach(btn => {
        btn.addEventListener('click', () => {
            const nombrePestana = btn.getAttribute('data-tab');

            // Sincronizar estado activo en todos los botones (Dashboard y Reportes)
            botonesPestana.forEach(b => {
                b.classList.remove('activo');
                if (b.getAttribute('data-tab') === nombrePestana) {
                    b.classList.add('activo');
                }
            });

            // Ocultar todos los paneles primero
            if (panelResumen) panelResumen.classList.add('oculto');
            if (panelGeografia) panelGeografia.classList.add('oculto');

            // Mostrar el seleccionado
            if (nombrePestana === 'resumen') {
                if (panelResumen) panelResumen.classList.remove('oculto');
            } else if (nombrePestana === 'geografia') {
                if (panelGeografia) panelGeografia.classList.remove('oculto');
            }
            // Servicios podría ir aquí en el futuro

            // Lógica para volver al Dashboard si estamos en otra vista (ej: Reportes)
            const vistaDashboard = document.getElementById('vistaDashboard');
            const vistaReportes = document.getElementById('vistaReportes');
            const navDashboard = document.getElementById('navDashboard');
            const navReportes = document.getElementById('navReportes');

            if (nombrePestana === 'resumen' || nombrePestana === 'geografia') {
                if (vistaReportes && !vistaReportes.classList.contains('oculto')) {
                    vistaReportes.classList.add('oculto');
                    if (vistaDashboard) vistaDashboard.classList.remove('oculto');

                    // Actualizar Sidebar
                    if (navReportes) navReportes.classList.remove('activo');
                    if (navDashboard) navDashboard.classList.add('activo');
                }
            }
        });
    });

    // Selector de periodo
    const periodoSelect = document.getElementById('periodoSelect');
    if (periodoSelect) {
        periodoSelect.addEventListener('change', (e) => {
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
            if (document.getElementById('vistaColaboradores')) document.getElementById('vistaColaboradores').classList.add('oculto');

            navDashboard.classList.add('activo');
            navReportes.classList.remove('activo');
            if (document.getElementById('navColaboradores')) document.getElementById('navColaboradores').classList.remove('activo');
        });

        navReportes.addEventListener('click', (e) => {
            e.preventDefault();
            vistaDashboard.classList.add('oculto');
            vistaReportes.classList.remove('oculto');
            if (document.getElementById('vistaColaboradores')) document.getElementById('vistaColaboradores').classList.add('oculto');

            navDashboard.classList.remove('activo');
            navReportes.classList.add('activo');
            if (document.getElementById('navColaboradores')) document.getElementById('navColaboradores').classList.remove('activo');

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
            actualizarGraficoTendencia(reportes);
        } catch (error) {
            console.error("Error cargando reportes:", error);
            cuerpoTabla.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error al cargar reportes.</td></tr>';
        }
    }

    // Variable global para el gráfico de tendencia
    let chartTendenciaInstance = null;

    function actualizarGraficoTendencia(reportes) {
        const ctx = document.getElementById('graficoTendencia');
        if (!ctx) return;

        // Procesar datos para obtener conteos por cantón y tipo
        // Cantones objetivo: San Antonio, San Rafael, Escazú Centro
        const cantonesObjetivo = ['San Antonio', 'San Rafael', 'Escazú Centro'];
        const datosProcesados = {
            'San Antonio': { baches: 0, alcantarillado: 0, senalizacion: 0 },
            'San Rafael': { baches: 0, alcantarillado: 0, senalizacion: 0 },
            'Escazú Centro': { baches: 0, alcantarillado: 0, senalizacion: 0 }
        };

        reportes.forEach(r => {
            const ubicacion = r.ubicacion;
            const tipo = (r.tipo_obstruccion || '').toLowerCase();

            // Normalizar ubicación para coincidir con objetivos
            let cantonKey = null;
            if (ubicacion.includes('Antonio')) cantonKey = 'San Antonio';
            else if (ubicacion.includes('Rafael')) cantonKey = 'San Rafael';
            else if (ubicacion.includes('Centro') || ubicacion.includes('Escazú')) cantonKey = 'Escazú Centro';

            if (cantonKey) {
                if (tipo.includes('bache')) datosProcesados[cantonKey].baches++;
                else if (tipo.includes('alcantarilla')) datosProcesados[cantonKey].alcantarillado++;
                else if (tipo.includes('señal') || tipo.includes('seña')) datosProcesados[cantonKey].senalizacion++;
            }
        });

        // Asegurar que haya datos distintos (simulación si es necesario para demo, pero basado en real)
        // El usuario pidió: "no deben ser iguales cada uno debe tener un numero o cantidad distinta"
        // Si los datos reales son 0, podríamos mostrar 0, pero para cumplir el requerimiento visual
        // verificaremos y si está muy vacío, quizás el usuario quiera ver el potencial.
        // Por ahora, usamos los datos reales. Si db.json tiene pocos datos, se verá reflejado.

        const datasets = [
            {
                label: 'Baches',
                data: cantonesObjetivo.map(c => datosProcesados[c].baches),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'Alcantarillado',
                data: cantonesObjetivo.map(c => datosProcesados[c].alcantarillado),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'Señalización',
                data: cantonesObjetivo.map(c => datosProcesados[c].senalizacion),
                backgroundColor: 'rgba(255, 206, 86, 0.7)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }
        ];

        if (chartTendenciaInstance) {
            chartTendenciaInstance.destroy();
        }

        chartTendenciaInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: cantonesObjetivo,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Incidencias por Cantón'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }


    function renderizarReportes(reportes) {
        cuerpoTabla.innerHTML = '';

        if (reportes.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 5;
            td.textContent = 'No hay reportes registrados';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            cuerpoTabla.appendChild(tr);
            return;
        }

        reportes.forEach(reporte => {
            const tr = document.createElement('tr');

            // Columna 1 - Reporte
            const tdReporte = document.createElement('td');
            const titulo = document.createElement('h4');
            titulo.textContent = reporte.tipo_obstruccion; // Mapeo a tipo_obstruccion

            const descripcion = document.createElement('small');
            descripcion.textContent = reporte.comentario || ''; // Mapeo a comentario

            const estado = document.createElement('span');
            estado.className = `badgeEstado ${getClaseEstado(reporte.estado)}`;
            estado.textContent = reporte.estado;

            tdReporte.appendChild(titulo);
            tdReporte.appendChild(descripcion);
            tdReporte.appendChild(estado);

            // Columna 2 - Usuario
            const tdUsuario = document.createElement('td');
            const nombre = document.createElement('strong');
            nombre.textContent = reporte.usuario || 'Anónimo';

            const contacto = document.createElement('div');
            contacto.textContent = `ID: ${reporte.user_id}`; // Mostrar ID como referencia

            tdUsuario.appendChild(nombre);
            tdUsuario.appendChild(contacto);

            // Columna 3 - Ubicación
            const tdUbicacion = document.createElement('td');
            tdUbicacion.textContent = reporte.ubicacion;

            // Columna 4 - Fecha
            const tdFecha = document.createElement('td');
            tdFecha.textContent = reporte.fecha;

            // Columna 5 - Acciones
            const tdAcciones = document.createElement('td');

            const btnVer = document.createElement('button');
            btnVer.className = 'btnAccion btnVer';
            btnVer.dataset.id = reporte.id;
            btnVer.innerHTML = '<i class="fas fa-eye"></i>';

            const btnEditar = document.createElement('button');
            btnEditar.className = 'btnAccion btnEditar';
            btnEditar.dataset.id = reporte.id;
            btnEditar.innerHTML = '<i class="fas fa-edit"></i>';

            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btnAccion btnEliminar';
            btnEliminar.dataset.id = reporte.id;
            btnEliminar.innerHTML = '<i class="fas fa-trash-alt"></i>';

            tdAcciones.appendChild(btnVer);
            tdAcciones.appendChild(btnEditar);
            tdAcciones.appendChild(btnEliminar);

            tr.appendChild(tdReporte);
            tr.appendChild(tdUsuario);
            tr.appendChild(tdUbicacion);
            tr.appendChild(tdFecha);
            tr.appendChild(tdAcciones);

            cuerpoTabla.appendChild(tr);
        });
    }

    // Event Delegation para Botones de la tabla
    if (cuerpoTabla) {
        cuerpoTabla.addEventListener('click', async (e) => {
            const btnVer = e.target.closest('.btnVer');
            const btnEliminar = e.target.closest('.btnEliminar');
            const btnEditar = e.target.closest('.btnEditar');

            if (btnVer) {
                const id = btnVer.dataset.id;
                const reportes = await getReportes();
                const reporte = reportes.find(r => r.id == id);
                if (reporte) abrirModalVer(reporte);
            }

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

    // Modal Ver Reporte Logic
    const modalVerReporte = document.getElementById('modalVerReporte');
    const cerrarModalVer = document.getElementById('cerrarModalVer');
    const btnCerrarVer = document.getElementById('btnCerrarVer');
    const detalleContenido = document.getElementById('detalleContenido');

    function abrirModalVer(reporte) {
        if (!modalVerReporte || !detalleContenido) return;

        // Construir contenido del modal
        const imagenHtml = reporte.foto ?
            `<img src="${reporte.foto}" alt="Evidencia" class="detalleImagen">` :
            '<div style="padding: 20px; background: #eee; text-align: center; border-radius: 10px; margin-bottom: 15px; color: #777;">Sin imagen adjunta</div>';

        detalleContenido.innerHTML = `
            ${imagenHtml}
            <div class="detalleInfo">
                <h3>${reporte.tipo_obstruccion}</h3>
                <p>${reporte.comentario}</p>
                
                <div class="detalleMeta">
                    <div class="metaItem">
                        <strong>Usuario</strong>
                        <span>${reporte.usuario || 'Anónimo'} (ID: ${reporte.user_id})</span>
                    </div>
                    <div class="metaItem">
                        <strong>Fecha</strong>
                        <span>${reporte.fecha}</span>
                    </div>
                    <div class="metaItem">
                        <strong>Ubicación</strong>
                        <span>${reporte.ubicacion}</span>
                    </div>
                    <div class="metaItem">
                        <strong>Estado</strong>
                        <span class="badgeEstado ${getClaseEstado(reporte.estado)}">${reporte.estado}</span>
                    </div>
                </div>
            </div>
        `;

        modalVerReporte.classList.remove('oculto');
    }

    if (cerrarModalVer) {
        cerrarModalVer.addEventListener('click', () => {
            modalVerReporte.classList.add('oculto');
        });
    }

    if (btnCerrarVer) {
        btnCerrarVer.addEventListener('click', () => {
            modalVerReporte.classList.add('oculto');
        });
    }

    // Cerrar al click fuera
    window.addEventListener('click', (e) => {
        if (e.target === modalVerReporte) {
            modalVerReporte.classList.add('oculto');
        }
    });

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