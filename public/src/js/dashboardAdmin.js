import {
    getReportes,
    deleteReportes,
    patchReportes,
    getUsuarios,
    patchUsuarios,
    deleteUsuarios,
    getPlanillas,
    postPlanillas,
    patchPlanillas,
    deletePlanillas,
    getUsuariosPlanillas,
    postUsuariosPlanillas,
    patchUsuariosPlanillas,
    deleteUsuariosPlanillas,
    getHistorialPagos,
    postHistorialPago,
    deleteHistorialPago,
    getSolicitudesFinanciamiento,
    patchSolicitudesFinanciamiento,
    deleteSolicitudesFinanciamiento,
    getServicios,
    postServicios,
    patchServicios,
    deleteServicios,
    getProyectos,
    postProyectos,
    patchProyectos,
    deleteProyectos
} from '../services/services.js';

// Configuración de EmailJS
const EMAILJS_PUBLIC_KEY = "qUlvQrT1jvUYVC0jD";
const EMAILJS_SERVICE_ID = "service_5p3x2vj";
const EMAILJS_TEMPLATE_ID = "template_vo1l64o";

// Inicializar EmailJS
(function () {
    if (typeof emailjs !== 'undefined') {
        emailjs.init({
            publicKey: EMAILJS_PUBLIC_KEY,
        });
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard Admin de la Municipalidad de Escazú cargado');

    // Validación de Rol de Administrador
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    let currentPlanillaContext = null; // Variable global para contexto de planilla
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

    // Gráfico Geografía (Horizontal)
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
                label: 'inversion (Baches)', // Usando nombres inspirados en imagen pero con datos reales
                data: cantonesObjetivo.map(c => datosProcesados[c].baches),
                backgroundColor: '#fd7e14', // Naranja (Inversion style)
                borderRadius: 5,
                barPercentage: 0.6
            },
            {
                label: 'inversion (Alcantarillado)', // Usando nombres inspirados en imagen
                data: cantonesObjetivo.map(c => datosProcesados[c].alcantarillado),
                backgroundColor: '#0d6efd', // Azul (Inversion style)
                borderRadius: 5,
                barPercentage: 0.6
            },
            {
                label: 'inversion (Señalización)',
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
    const btnLogout = document.getElementById('botonCerrarSesion');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: 'Tu sesión actual se cerrará',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('usuarioActivo');
                    Swal.fire({
                        title: 'Sesión cerrada',
                        text: 'Has cerrado sesión correctamente',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = '../pages/login.html';
                    });
                }
            });
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
            Swal.fire({
                icon: 'info',
                title: 'Actualizando tablero',
                text: `Cargando datos para los últimos ${dias} días...`,
                timer: 1500,
                showConfirmButton: false
            });
        });
    }

    //  Lógica de Gestión de Reportes

    const navDashboard = document.getElementById('navDashboard');
    const navReportes = document.getElementById('navReportes');
    const navTramites = document.getElementById('navTramites'); // Nuevo
    const navUsuarios = document.getElementById('navUsuarios');

    const vistaTramites = document.getElementById('vistaTramites'); // Nueva
    const vistaUsuarios = document.getElementById('vistaUsuarios');
    const vistaPlanillas = document.getElementById('vistaPlanillas'); // Nueva
    const vistaDetallePlanilla = document.getElementById('vistaDetallePlanilla'); // Nueva
    const vistaInvitarUsuario = document.getElementById('vistaInvitarUsuario');

    const cuerpoTabla = document.getElementById('cuerpoTablaReportes');
    const btnRecargar = document.getElementById('btnRecargarReportes');

    const buscadorReportes = document.getElementById('buscadorReportes');
    const filtroTipoReporte = document.getElementById('filtroTipoReporte');
    const btnVistaListaReportes = document.getElementById('btnVistaListaReportes');
    const btnVistaCuadriculaReportes = document.getElementById('btnVistaCuadriculaReportes');

    // Función auxiliar para ocultar todas las vistas
    // Función auxiliar para ocultar todas las vistas
    function ocultarTodasLasVistas() {
        const vistas = [
            document.getElementById('vistaDashboard'),
            document.getElementById('vistaReportes'),
            document.getElementById('vistaTramites'),
            document.getElementById('vistaUsuarios'),
            document.getElementById('vistaPlanillas'),
            document.getElementById('vistaDetallePlanilla'),
            document.getElementById('vistaInvitarUsuario'),
            document.getElementById('vistaSolicitudes'),
            document.getElementById('vistaServicios')
        ];

        vistas.forEach(v => {
            if (v) v.classList.add('oculto');
        });

        const navs = [
            document.getElementById('navDashboard'),
            document.getElementById('navReportes'),
            document.getElementById('navTramites'),
            document.getElementById('navUsuarios'),
            document.getElementById('navPlanillas'),
            document.getElementById('navSolicitudes'),
            document.getElementById('navServicios')
        ];

        navs.forEach(n => {
            if (n) n.classList.remove('activo');
        });
    }

    // Navegación Sidebar
    if (navDashboard) {
        navDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarTodasLasVistas();
            vistaDashboard.classList.remove('oculto');
            navDashboard.classList.add('activo');
        });
    }

    if (navReportes) {
        navReportes.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarTodasLasVistas();
            vistaReportes.classList.remove('oculto');
            navReportes.classList.add('activo');
            cargarReportes();
        });
    }

    if (navTramites) {
        navTramites.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarTodasLasVistas();
            vistaTramites.classList.remove('oculto');
            navTramites.classList.add('activo');
        });
    }

    if (navUsuarios) {
        navUsuarios.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarTodasLasVistas();
            vistaUsuarios.classList.remove('oculto');
            navUsuarios.classList.add('activo');
            cargarUsuarios();
        });
    }

    if (navPlanillas) {
        navPlanillas.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarTodasLasVistas();
            vistaPlanillas.classList.remove('oculto');
            navPlanillas.classList.add('activo');
            cargarPlanillas();
        });
    }

    // Lógica de Pestañas Internas de Trámites
    const tabRevision = document.getElementById('tabRevision');
    const tabHistorial = document.getElementById('tabHistorial');

    if (tabRevision && tabHistorial) {
        tabRevision.addEventListener('click', () => {
            tabRevision.classList.add('activo');
            tabHistorial.classList.remove('activo');
            // Aquí iría la lógica para filtrar por estado pendiente si tuviéramos datos
        });

        tabHistorial.addEventListener('click', () => {
            tabHistorial.classList.add('activo');
            tabRevision.classList.remove('activo');
            // Aquí iría la lógica para filtrar por historial
        });
    }

    if (btnRecargar) {
        btnRecargar.addEventListener('click', cargarReportes);
    }




    const btnVolverUsuarios = document.getElementById('btnVolverUsuarios');
    const btnEnviarInvitacion = document.getElementById('btnEnviarInvitacion');
    const cuerpoTablaUsuarios = document.getElementById('cuerpoTablaUsuarios');
    const buscadorUsuarios = document.getElementById('buscadorUsuarios');
    const filtrosRol = document.getElementById('filtroRolUsuarios');

    // Botón Invitar Usuario (en la vista de usuarios)
    const btnInvitar = document.querySelector('#vistaUsuarios .botonInvitar');
    if (btnInvitar) {
        btnInvitar.addEventListener('click', () => {
            vistaUsuarios.classList.add('oculto');
            vistaInvitarUsuario.classList.remove('oculto');
        });
    }

    // Botón Volver de Invitación
    if (btnVolverUsuarios) {
        btnVolverUsuarios.addEventListener('click', () => {
            vistaInvitarUsuario.classList.add('oculto');
            vistaUsuarios.classList.remove('oculto');
        });
    }

    // Botón Enviar Invitación (EmailJS)
    if (btnEnviarInvitacion) {
        btnEnviarInvitacion.addEventListener('click', () => {
            const email = document.getElementById('invitacionEmail').value.trim();
            const rol = document.getElementById('invitacionRol').value.trim();
            const nombre = document.getElementById('invitacionNombre').value.trim();
            const mensajePersonalizado = document.getElementById('invitacionMensaje').value.trim();

            if (!email || !rol || !nombre || !mensajePersonalizado) {
                Swal.fire('Error', 'Todos los campos son obligatorios y no pueden contener solo espacios.', 'error');
                return;
            }

            const invitationLink = `${window.location.origin}/pages/registro.html?rol=${rol}&email=${email}&nombre=${encodeURIComponent(nombre)}`;

            const mensajeFinal = mensajePersonalizado ? mensajePersonalizado :
                `Hola ${nombre || 'Usuario'}, has sido invitado a unirte a la plataforma de la Municipalidad de Escazú con el rol de ${rol}. Por favor completa tu registro en el siguiente enlace.`;

            const templateParams = {
                user_email: email,
                to_email: email,
                email: email,
                link: invitationLink,
                message: mensajeFinal,
                reply_to: "no-reply@escazu.go.cr"
            };

            Swal.fire({
                title: 'Enviando invitación...',
                text: 'Por favor espere...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            });

            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                .then(() => {
                    Swal.fire({
                        title: '¡Enviado!',
                        text: `Invitación enviada correctamente a ${email}`,
                        icon: 'success',
                        timer: 3000,
                        showConfirmButton: false
                    });

                    document.getElementById('invitacionEmail').value = '';
                    document.getElementById('invitacionNombre').value = '';
                    document.getElementById('invitacionRol').value = '';
                    document.getElementById('invitacionMensaje').value = '';

                    vistaInvitarUsuario.classList.add('oculto');
                    vistaUsuarios.classList.remove('oculto');
                })
                .catch((error) => {
                    console.error('Error EmailJS:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un problema al enviar la invitación. Inténtalo de nuevo.',
                        icon: 'error'
                    });
                });
        });
    }

    // -------------------------------------------------------------------------
    // LÓGICA DE SOLICITUDES DE FINANCIAMIENTO
    // -------------------------------------------------------------------------

    // Elementos de la Vista Solicitudes
    const navSolicitudes = document.getElementById('navSolicitudes');
    const vistaSolicitudes = document.getElementById('vistaSolicitudes');
    const tabSolicitudesPendientes = document.getElementById('tabSolicitudesPendientes');
    const tabSolicitudesTodas = document.getElementById('tabSolicitudesTodas');
    const cuerpoTablaSolicitudes = document.getElementById('cuerpoTablaSolicitudes');
    const buscadorSolicitudes = document.getElementById('buscadorSolicitudes');
    const contadorSolicitudes = document.getElementById('contadorSolicitudes');

    // Modals
    const modalGestionarSolicitud = document.getElementById('modalGestionarSolicitud');
    const modalEditarSolicitud = document.getElementById('modalEditarSolicitud');

    if (navSolicitudes) {
        navSolicitudes.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarTodasLasVistas();
            vistaSolicitudes.classList.remove('oculto');
            navSolicitudes.classList.add('activo');
            cargarSolicitudesAdmin();
        });
    }

    // Tabs Internos
    let filtroEstadoSolicitud = 'pendiente'; // 'pendiente' o 'todos'

    if (tabSolicitudesPendientes && tabSolicitudesTodas) {
        tabSolicitudesPendientes.addEventListener('click', () => {
            tabSolicitudesPendientes.classList.add('activo');
            tabSolicitudesTodas.classList.remove('activo');
            filtroEstadoSolicitud = 'pendiente';
            renderizarSolicitudes();
        });

        tabSolicitudesTodas.addEventListener('click', () => {
            tabSolicitudesTodas.classList.add('activo');
            tabSolicitudesPendientes.classList.remove('activo');
            filtroEstadoSolicitud = 'todos';
            renderizarSolicitudes();
        });
    }

    if (buscadorSolicitudes) {
        buscadorSolicitudes.addEventListener('input', renderizarSolicitudes);
    }

    async function cargarSolicitudesAdmin() {
        if (!cuerpoTablaSolicitudes) return;
        cuerpoTablaSolicitudes.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando solicitudes...</td></tr>';

        try {
            const solicitudes = await getSolicitudesFinanciamiento();
            window.allSolicitudes = solicitudes || [];
            renderizarSolicitudes();
        } catch (error) {
            console.error("Error cargando solicitudes", error);
            cuerpoTablaSolicitudes.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error al cargar solicitudes.</td></tr>';
        }
    }

    function renderizarSolicitudes() {
        if (!window.allSolicitudes || !cuerpoTablaSolicitudes) return;

        const termino = buscadorSolicitudes ? buscadorSolicitudes.value.toLowerCase() : '';

        let solicitudesFiltradas = window.allSolicitudes.filter(s => {
            const nombre = (s.nombre_proyecto || '').toLowerCase();
            const ubicacion = (s.ubicacion || '').toLowerCase();
            const coincideTexto = nombre.includes(termino) || ubicacion.includes(termino);

            if (filtroEstadoSolicitud === 'pendiente') {
                return (s.estado === 'pendiente') && coincideTexto;
            } else {
                return coincideTexto;
            }
        });

        if (solicitudesFiltradas.length === 0) {
            cuerpoTablaSolicitudes.innerHTML = '<tr><td colspan="7" style="text-align:center;">No se encontraron solicitudes</td></tr>';
            if (contadorSolicitudes) contadorSolicitudes.textContent = '0 solicitudes';
            return;
        }

        if (contadorSolicitudes) contadorSolicitudes.textContent = `${solicitudesFiltradas.length} solicitudes`;

        cuerpoTablaSolicitudes.innerHTML = '';
        solicitudesFiltradas.forEach(s => {
            const tr = document.createElement('tr');

            // Columna Proyecto
            const tdProyecto = document.createElement('td');
            tdProyecto.innerHTML = `<strong>${s.nombre_proyecto}</strong>`;

            // Columna Ubicación
            const tdUbicacion = document.createElement('td');
            tdUbicacion.textContent = s.ubicacion || 'N/A';

            // Columna Monto Solicitado
            const tdMontoSol = document.createElement('td');
            tdMontoSol.textContent = `₡${Number(s.monto_solicitado).toLocaleString()}`;

            // Columna Monto Aprobado
            const tdMontoApr = document.createElement('td');
            // Check if monto_aprobado is valid number, else show -
            const montoAprobado = s.monto_aprobado ? `₡${Number(s.monto_aprobado).toLocaleString()}` : '-';
            tdMontoApr.textContent = montoAprobado;

            // Columna Estado
            const tdEstado = document.createElement('td');
            let claseEstado = '';
            if (s.estado === 'pendiente') claseEstado = 'rol-usuario'; // usar estilo gris
            else if (s.estado === 'aprobado') claseEstado = 'rol-empleado'; // estilo verde/azul
            else if (s.estado === 'rechazado') claseEstado = 'rol-admin'; // rojo

            // Ajustamos clases manualmente si no existen
            let color = '#6c757d';
            if (s.estado === 'aprobado') color = '#28a745';
            if (s.estado === 'rechazado') color = '#dc3545';

            tdEstado.innerHTML = `<span style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8em;">${s.estado}</span>`;

            // Columna Entidad
            const tdEntidad = document.createElement('td');
            tdEntidad.textContent = s.entidad_financiera || '-';

            // Columna Acciones
            const tdAcciones = document.createElement('td');
            tdAcciones.className = 'acciones';

            if (s.estado === 'pendiente') {
                const btnGestionar = document.createElement('button');
                btnGestionar.className = 'btnAccion';
                btnGestionar.style.backgroundColor = '#6f42c1';
                btnGestionar.style.color = 'white';
                btnGestionar.title = 'Gestionar Solicitud';
                btnGestionar.innerHTML = '<i class="fas fa-tasks"></i>';
                btnGestionar.onclick = () => abrirModalGestionar(s);
                tdAcciones.appendChild(btnGestionar);
            }

            // Botones comunes para TODOS (Editar, Eliminar)
            if (filtroEstadoSolicitud === 'todos') {
                const btnEditar = document.createElement('button');
                btnEditar.className = 'btnAccion btnEditar';
                btnEditar.title = 'Editar';
                btnEditar.innerHTML = '<i class="fas fa-edit"></i>';
                btnEditar.onclick = () => abrirModalEditar(s);

                const btnEliminar = document.createElement('button');
                btnEliminar.className = 'btnAccion btnEliminar';
                btnEliminar.title = 'Eliminar';
                btnEliminar.innerHTML = '<i class="fas fa-trash-alt"></i>';
                btnEliminar.onclick = () => confirmarEliminarSolicitud(s.id);

                tdAcciones.appendChild(btnEditar);
                tdAcciones.appendChild(btnEliminar);
            }

            tr.appendChild(tdProyecto);
            tr.appendChild(tdUbicacion);
            tr.appendChild(tdMontoSol);
            tr.appendChild(tdMontoApr);
            tr.appendChild(tdEstado);
            tr.appendChild(tdEntidad);
            tr.appendChild(tdAcciones);

            cuerpoTablaSolicitudes.appendChild(tr);
        });
    }

    // Funciones del Modal Gestionar (Pendientes)
    window.abrirModalGestionar = function (solicitud) {
        if (modalGestionarSolicitud) {
            modalGestionarSolicitud.classList.remove('oculto');

            document.getElementById('idSolicitudGestionar').value = solicitud.id;
            // Prellenar monto aprobado con el solicitado por defecto
            document.getElementById('montoAprobadoGestion').value = solicitud.monto_solicitado;
            document.getElementById('entidadFinancieraGestion').value = '';

            const infoDiv = document.getElementById('infoSolicitudGestionar');
            const descripcion = solicitud.descripcion || 'Sin descripción';
            const ubicacion = solicitud.ubicacion || 'No especificada';

            infoDiv.innerHTML = `
                <p><strong>Proyecto:</strong> ${solicitud.nombre_proyecto}</p>
                <p><strong>Descripción:</strong> ${descripcion}</p>
                <p><strong>Solicitante/Ubicación:</strong> ${ubicacion}</p>
                <p><strong>Monto Solicitado:</strong> ₡${Number(solicitud.monto_solicitado).toLocaleString()}</p>
            `;
        }
    };

    // Cerrar modales
    const cerrarModalGestionar = document.getElementById('cerrarModalGestionar');
    if (cerrarModalGestionar) {
        cerrarModalGestionar.addEventListener('click', () => {
            modalGestionarSolicitud.classList.add('oculto');
        });
    }

    const cerrarModalEditarSolicitud = document.getElementById('cerrarModalEditarSolicitud');
    if (cerrarModalEditarSolicitud) {
        cerrarModalEditarSolicitud.addEventListener('click', () => {
            modalEditarSolicitud.classList.add('oculto');
        });
    }

    // Aprobar Solicitud
    const formGestionarSolicitud = document.getElementById('formGestionarSolicitud');
    if (formGestionarSolicitud) {
        formGestionarSolicitud.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('idSolicitudGestionar').value;
            const montoAprobado = document.getElementById('montoAprobadoGestion').value.trim();
            const entidad = document.getElementById('entidadFinancieraGestion').value.trim();

            if (!montoAprobado || !entidad) {
                Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
                return;
            }

            try {
                await patchSolicitudesFinanciamiento({
                    estado: 'aprobado',
                    monto_aprobado: Number(montoAprobado),
                    entidad_financiera: entidad,
                    fecha_aprobación: new Date().toLocaleDateString('es-CR')
                }, id);

                Swal.fire('Aprobada', 'La solicitud ha sido aprobada', 'success');
                modalGestionarSolicitud.classList.add('oculto');
                cargarSolicitudesAdmin();
            } catch (error) {
                console.error("Error al aprobar:", error);
                Swal.fire('Error', `No se pudo aprobar la solicitud: ${error.message}`, 'error');
            }
        });
    }

    // Rechazar Solicitud
    const btnRechazarSolicitud = document.getElementById('btnRechazarSolicitud');
    if (btnRechazarSolicitud) {
        btnRechazarSolicitud.addEventListener('click', async () => {
            const id = document.getElementById('idSolicitudGestionar').value;

            Swal.fire({
                title: '¿Rechazar solicitud?',
                text: "Esta acción no se puede deshacer.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Sí, rechazar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await patchSolicitudesFinanciamiento({
                            estado: 'rechazado',
                            entidad_financiera: null, // Asegurar que limpio
                            fecha_aprobación: new Date().toLocaleDateString('es-CR')
                        }, id);

                        Swal.fire('Rechazada', 'La solicitud ha sido rechazada', 'success');
                        modalGestionarSolicitud.classList.add('oculto');
                        cargarSolicitudesAdmin();
                    } catch (error) {
                        console.error("Error al rechazar:", error);
                        Swal.fire('Error', `No se pudo rechazar la solicitud: ${error.message}`, 'error');
                    }
                }
            });
        });
    }

    // Editar Solicitud (Admin - Todos)
    window.abrirModalEditar = function (solicitud) {
        if (modalEditarSolicitud) {
            modalEditarSolicitud.classList.remove('oculto');
            document.getElementById('idSolicitudEditar').value = solicitud.id;
            document.getElementById('nombreProyectoEditar').value = solicitud.nombre_proyecto;
            document.getElementById('estadoSolicitudEditar').value = solicitud.estado;
            document.getElementById('montoAprobadoEditar').value = solicitud.monto_aprobado || '';
            document.getElementById('entidadFinancieraEditar').value = solicitud.entidad_financiera || '';
        }
    };

    const formEditarSolicitud = document.getElementById('formEditarSolicitud');
    if (formEditarSolicitud) {
        formEditarSolicitud.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('idSolicitudEditar').value;
            const estado = document.getElementById('estadoSolicitudEditar').value.trim();
            const monto = document.getElementById('montoAprobadoEditar').value.trim();
            const entidad = document.getElementById('entidadFinancieraEditar').value.trim();

            if (!estado || !monto || !entidad) {
                Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
                return;
            }

            const updateData = {
                estado: estado,
                monto_aprobado: Number(monto),
                entidad_financiera: entidad
            };

            try {
                await patchSolicitudesFinanciamiento(updateData, id);
                Swal.fire('Actualizado', 'La solicitud ha sido actualizada', 'success');
                modalEditarSolicitud.classList.add('oculto');
                cargarSolicitudesAdmin();
            } catch (error) {
                console.error("Error al actualizar:", error);
                Swal.fire('Error', `No se pudo actualizar: ${error.message}`, 'error');
            }
        });
    }

    window.confirmarEliminarSolicitud = function (id) {
        Swal.fire({
            title: '¿Eliminar solicitud?',
            text: "Se eliminará permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Sí, eliminar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteSolicitudesFinanciamiento(id);
                    Swal.fire('Eliminado', 'Solicitud eliminada', 'success');
                    cargarSolicitudesAdmin();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'No se pudo eliminar', 'error');
                }
            }
        });
    };



    // Buscador de Usuarios
    if (buscadorUsuarios) {
        buscadorUsuarios.addEventListener('input', filtrarUsuarios);
    }

    const btnVistaLista = document.getElementById('btnVistaLista');
    const btnVistaCuadricula = document.getElementById('btnVistaCuadricula');
    const contenedorTablaUsuarios = document.querySelector('.tablaUsuarios').parentElement; // El contenedor .contenedorTabla

    // Filtro por Rol
    if (filtrosRol) {
        filtrosRol.addEventListener('change', filtrarUsuarios);
    }

    // Toggle Vista Lista/Cuadrícula
    if (btnVistaLista && btnVistaCuadricula) {
        btnVistaLista.addEventListener('click', () => {
            btnVistaLista.classList.add('activo');
            btnVistaCuadricula.classList.remove('activo');
            cuerpoTablaUsuarios.classList.remove('vista-cuadricula');
            // Asegurar aspecto de tabla
            document.querySelector('.tablaUsuarios').classList.remove('modo-cuadricula');
        });

        btnVistaCuadricula.addEventListener('click', () => {
            btnVistaCuadricula.classList.add('activo');
            btnVistaLista.classList.remove('activo');
            cuerpoTablaUsuarios.classList.add('vista-cuadricula');
            // Cambiar aspecto a grid
            document.querySelector('.tablaUsuarios').classList.add('modo-cuadricula');
        });
    }

    async function cargarUsuarios() {
        if (!cuerpoTablaUsuarios) return;

        cuerpoTablaUsuarios.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando usuarios...</td></tr>';

        try {
            const usuarios = await getUsuarios();
            window.allUsuarios = usuarios; // Guardar referencia global para filtros
            renderizarUsuarios(usuarios);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            cuerpoTablaUsuarios.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error al cargar usuarios.</td></tr>';
        }
    }

    function filtrarUsuarios() {
        const termino = buscadorUsuarios ? buscadorUsuarios.value.toLowerCase() : '';
        const rolFiltro = filtrosRol ? filtrosRol.value.toLowerCase() : '';

        if (!window.allUsuarios) return;

        const usuariosFiltrados = window.allUsuarios.filter(u => {
            const coincideTexto = (u.nombre || '').toLowerCase().includes(termino) ||
                (u.correo || '').toLowerCase().includes(termino);
            const coincideRol = rolFiltro === '' || (u.rol || '').toLowerCase() === rolFiltro;
            return coincideTexto && coincideRol;
        });

        renderizarUsuarios(usuariosFiltrados);
    }

    function renderizarUsuarios(usuarios) {
        if (!cuerpoTablaUsuarios) return;
        cuerpoTablaUsuarios.innerHTML = '';

        if (usuarios.length === 0) {
            cuerpoTablaUsuarios.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se encontraron usuarios</td></tr>';
            actualizarContadorUsuarios(0);
            return;
        }

        actualizarContadorUsuarios(usuarios.length);

        usuarios.forEach(u => {
            // Creamos fila (tr) que actuará como card en modo cuadrícula
            const tr = document.createElement('tr');
            tr.className = 'fila-usuario'; // Clase para control CSS

            // ... (Resto igual, la magia la hará el CSS)
            // Solo aseguramos la estructura correcta

            const tdUsuario = document.createElement('td');
            const placeholder = u.nombre ? u.nombre.charAt(0).toUpperCase() : '?';
            const avatarHtml = u.foto ?
                `<img src="${u.foto}" alt="${u.nombre}" class="avatarImg">` :
                `<div class="avatarPlaceholder">${placeholder}</div>`;

            tdUsuario.innerHTML = `
                <div class="usuarioInfo">
                    ${avatarHtml}
                    <div class="infoColaborador">
                        <h4>${u.nombre || 'Sin Nombre'}</h4>
                        <span>${u.correo}</span>
                    </div>
                </div>
            `;

            const tdContacto = document.createElement('td');
            tdContacto.innerHTML = `
                <div class="contactoInfo">
                    <div><i class="fas fa-phone"></i> ${u.telefono || 'N/A'}</div>
                </div>
            `;
            // En modo Grid, ocultamos o cambiamos el layout de contacto/rol

            const tdRol = document.createElement('td');
            // Mapeo roles para badges
            const claseRol = `rol-${(u.rol || 'ciudadano').toLowerCase()}`;
            tdRol.innerHTML = `<span class="badgeRol ${claseRol}">${u.rol || 'Ciudadano'}</span>`;

            const tdEstado = document.createElement('td');
            // Simulación estado
            tdEstado.innerHTML = `<span class="estado-activo"><i class="fas fa-circle bolitaVerde"></i> Activo</span>`;

            const tdAcciones = document.createElement('td');
            tdAcciones.className = 'acciones';

            // Botones
            const btnVer = document.createElement('button');
            btnVer.className = 'btnAccion btnVer';
            btnVer.title = 'Ver detalles';
            btnVer.innerHTML = '<i class="fas fa-eye"></i>';
            btnVer.onclick = () => abrirModalUsuario(u);

            const btnEditar = document.createElement('button');
            btnEditar.className = 'btnAccion btnEditar';
            btnEditar.title = 'Editar usuario';
            btnEditar.innerHTML = '<i class="fas fa-edit"></i>';
            btnEditar.onclick = () => editarUsuario(u);

            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btnAccion btnEliminar';
            btnEliminar.title = 'Eliminar usuario';
            btnEliminar.innerHTML = '<i class="fas fa-trash-alt"></i>';
            btnEliminar.onclick = () => confirmarEliminacionUsuario(u.id);

            tdAcciones.appendChild(btnVer);
            tdAcciones.appendChild(btnEditar);
            tdAcciones.appendChild(btnEliminar);

            tr.appendChild(tdUsuario);
            tr.appendChild(tdContacto);
            tr.appendChild(tdRol);
            tr.appendChild(tdEstado);
            tr.appendChild(tdAcciones);

            cuerpoTablaUsuarios.appendChild(tr);
        });

        actualizarContadorUsuarios(usuarios.length);
    }

    function actualizarContadorUsuarios(cantidad) {
        const contador = document.getElementById('contadorUsuarios');
        if (contador) {
            contador.textContent = `${cantidad} usuario${cantidad !== 1 ? 's' : ''}`;
        }
    }

    // Filtros y Buscador de Reportes Unificados
    function filtrarReportes() {
        if (!window.allReportes || !cuerpoTabla) return;

        const termino = buscadorReportes ? buscadorReportes.value.toLowerCase() : '';
        const tipoFiltro = filtroTipoReporte ? filtroTipoReporte.value.toLowerCase() : '';

        const reportesFiltrados = window.allReportes.filter(r => {
            const ubicacion = (r.ubicacion || '').toLowerCase();
            const tipo = (r.tipo_obstruccion || '').toLowerCase();
            const usuario = (r.usuario || '').toLowerCase();
            const comentario = (r.comentario || '').toLowerCase();

            const coincideTexto = ubicacion.includes(termino) ||
                tipo.includes(termino) ||
                usuario.includes(termino) ||
                comentario.includes(termino);

            const coincideTipo = tipoFiltro === '' || tipo.includes(tipoFiltro);

            return coincideTexto && coincideTipo;
        });

        renderizarReportes(reportesFiltrados);
    }

    if (buscadorReportes) buscadorReportes.addEventListener('input', filtrarReportes);
    if (filtroTipoReporte) filtroTipoReporte.addEventListener('change', filtrarReportes);

    // Toggle Vista Lista/Cuadrícula Reportes
    if (btnVistaListaReportes && btnVistaCuadriculaReportes) {
        btnVistaListaReportes.addEventListener('click', () => {
            btnVistaListaReportes.classList.add('activo');
            btnVistaCuadriculaReportes.classList.remove('activo');
            cuerpoTabla.classList.remove('vista-cuadricula');
            document.querySelector('.tablaReportes').classList.remove('modo-cuadricula');
        });

        btnVistaCuadriculaReportes.addEventListener('click', () => {
            btnVistaCuadriculaReportes.classList.add('activo');
            btnVistaListaReportes.classList.remove('activo');
            cuerpoTabla.classList.add('vista-cuadricula');
            document.querySelector('.tablaReportes').classList.add('modo-cuadricula');
        });
    }

    async function cargarReportes() {
        if (!cuerpoTabla) return;

        cuerpoTabla.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando reportes...</td></tr>';

        try {
            const reportes = await getReportes();
            window.allReportes = reportes;
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
        if (!cuerpoTabla) return;
        cuerpoTabla.innerHTML = '';

        if (reportes.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se encontraron reportes</td></tr>';
            actualizarContadorReportes(0);
            return;
        }

        actualizarContadorReportes(reportes.length);

        reportes.forEach(reporte => {
            const tr = document.createElement('tr');
            tr.className = 'fila-reporte';


            // Estructura similar a Usuarios para soportar Grid y Lista
            // Columna 1 - Imagen y Tipo (para Grid: Imagen arriba)
            const tdReporte = document.createElement('td');

            // Imagen para Grid (oculta en Lista mediante CSS si se quiere, o pequeña)
            const imagenHtml = reporte.foto ?
                `<img src="${reporte.foto}" alt="Reporte" class="imgReporteGrid">` :
                `<div class="placeholderReporteGrid"><i class="fas fa-image"></i></div>`;

            // En modo lista, la imagen no suele ir, pero en Grid sí.
            // Creamos un contenedor flexible.
            const divInfoReporte = document.createElement('div');
            divInfoReporte.className = 'infoReporteGrid'; // Clase para estilos grid

            divInfoReporte.innerHTML = `
                ${imagenHtml}
                <div class="textoReporte">
                    <h4>${reporte.tipo_obstruccion}</h4>
                    <small>${reporte.comentario || 'Sin detalles'}</small>
                </div>
            `;
            tdReporte.appendChild(divInfoReporte);


            // Columna 2 - Contacto / Usuario
            const tdUsuario = document.createElement('td');
            tdUsuario.innerHTML = `
                <div class="usuarioReporte">
                    <strong>${reporte.usuario || 'Anónimo'}</strong>
                </div>
            `;

            // Columna 3 - Ubicación
            const tdUbicacion = document.createElement('td');
            tdUbicacion.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${reporte.ubicacion}`;

            // Columna 4 - Fecha y Estado (Estado mejor aquí para grid)
            const tdFecha = document.createElement('td');
            const claseEstado = getClaseEstado(reporte.estado);
            tdFecha.innerHTML = `
                <div class="metaReporte">
                    <span class="badgeEstado ${claseEstado}">${reporte.estado}</span>
                    <span><i class="far fa-calendar-alt"></i> ${reporte.fecha}</span>
                </div>
            `;

            // Columna 5 - Acciones
            const tdAcciones = document.createElement('td');
            tdAcciones.className = 'acciones';

            // Botones con clases y datasets correctos
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

    function actualizarContadorReportes(cantidad) {
        const contador = document.getElementById('contadorReportes');
        if (contador) {
            contador.textContent = `${cantidad} reportes encontrados`;
        }
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
                Swal.fire({
                    title: '¿Eliminar reporte?',
                    text: "Esta acción no se puede deshacer.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await deleteReportes(id);
                            Swal.fire(
                                'Eliminado',
                                'El reporte ha sido eliminado.',
                                'success'
                            );
                            cargarReportes(); // Recargar tabla
                        } catch (error) {
                            Swal.fire('Error', 'No se pudo eliminar el reporte', 'error');
                        }
                    }
                });
            }

            if (btnEditar) {
                const id = btnEditar.dataset.id;
                const actual = e.target.closest('tr').querySelector('.badgeEstado').innerText;

                const { value: nuevoEstado } = await Swal.fire({
                    title: 'Actualizar Estado',
                    input: 'select',
                    inputOptions: {
                        'Pendiente': 'Pendiente',
                        'En Proceso': 'En Proceso',
                        'Resuelto': 'Resuelto'
                    },
                    inputPlaceholder: 'Selecciona un estado',
                    inputValue: actual,
                    showCancelButton: true,
                    confirmButtonText: 'Guardar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#3e206f'
                });

                if (nuevoEstado && nuevoEstado !== actual) {
                    try {
                        await patchReportes({ estado: nuevoEstado }, id);
                        Swal.fire({
                            icon: 'success',
                            title: 'Actualizado',
                            text: 'El estado ha sido actualizado correctamente',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        cargarReportes();
                    } catch (error) {
                        Swal.fire('Error', 'Error al actualizar el estado', 'error');
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
        if (e.target === modalVerUsuario) {
            modalVerUsuario.classList.add('oculto');
        }
    });

    // Modal Ver Usuario Logic
    const modalVerUsuario = document.getElementById('modalVerUsuario');
    const cerrarModalVerUsuario = document.getElementById('cerrarModalVerUsuario');
    const btnCerrarVerUsuario = document.getElementById('btnCerrarVerUsuario');
    const detalleUsuarioContenido = document.getElementById('detalleUsuarioContenido');

    function abrirModalUsuario(usuario) {
        if (!modalVerUsuario || !detalleUsuarioContenido) return;

        // Construir contenido del modal
        const inicial = (usuario.nombre || 'U').charAt(0).toUpperCase();
        const avatarHtml = (usuario.foto && usuario.foto.length > 20) ?
            `<img src="${usuario.foto}" alt="${usuario.nombre}" class="imagenPerfilGrande">` :
            `<div class="avatarPlaceholderGrande">${inicial}</div>`;

        const rolClase = `rol-${(usuario.rol || 'usuario').toLowerCase()}`;
        const rolTexto = usuario.rol || 'Usuario';

        detalleUsuarioContenido.innerHTML = `
            ${avatarHtml}
            <div class="infoPerfilUsuario">
                <div class="nombreGrande">${usuario.nombre || 'Sin Nombre'}</div>
                <div class="badgeRolGrande ${rolClase}">${rolTexto}</div>
                <div class="estadoActividad">
                    <span class="bolitaVerde"></span> Activo
                </div>
                
                <div class="detallesContacto">
                    <div class="tituloSeccionModal">Información de Contacto</div>
                    <div class="itemContacto">
                        <div class="iconoContacto"><i class="fas fa-envelope"></i></div>
                        <span>${usuario.correo || 'No disponible'}</span>
                    </div>
                     <div class="itemContacto">
                        <div class="iconoContacto"><i class="fas fa-phone"></i></div>
                        <span>${usuario.telefono || 'No disponible'}</span>
                    </div>

                </div>
            </div>
        `;

        modalVerUsuario.classList.remove('oculto');
    }

    if (cerrarModalVerUsuario) {
        cerrarModalVerUsuario.addEventListener('click', () => modalVerUsuario.classList.add('oculto'));
    }
    if (btnCerrarVerUsuario) {
        btnCerrarVerUsuario.addEventListener('click', () => modalVerUsuario.classList.add('oculto'));
    }

    // --- Funcionalidad Editar Usuario ---
    async function editarUsuario(usuario) {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Usuario',
            width: '600px',
            html: `
                <div style="display: grid; grid-template-columns: 100px 1fr; gap: 20px; align-items: center; text-align: left; padding: 20px 0;">
                    <label style="font-weight: 600; color: #555; font-size: 0.95rem;">Nombre:</label>
                    <input id="swal-nombre" class="swal2-input" style="width: 100%; margin: 0; height: 45px; font-size: 0.95rem;" placeholder="Ingrese el nombre" value="${usuario.nombre || ''}">
                    
                    <label style="font-weight: 600; color: #555; font-size: 0.95rem;">Correo:</label>
                    <input id="swal-correo" class="swal2-input" style="width: 100%; margin: 0; height: 45px; font-size: 0.95rem;" placeholder="Ingrese el correo" value="${usuario.correo || ''}">
                    
                    <label style="font-weight: 600; color: #555; font-size: 0.95rem;">Teléfono:</label>
                    <input id="swal-telefono" class="swal2-input" style="width: 100%; margin: 0; height: 45px; font-size: 0.95rem;" placeholder="Ingrese el teléfono" value="${usuario.telefono || ''}">
                    
                    <label style="font-weight: 600; color: #555; font-size: 0.95rem;">Rol:</label>
                    <select id="swal-rol" class="swal2-input" style="width: 100%; margin: 0; height: 45px; font-size: 0.95rem;">
                        <option value="usuario" ${usuario.rol === 'usuario' ? 'selected' : ''}>Usuario</option>
                        <option value="ciudadano" ${usuario.rol === 'ciudadano' ? 'selected' : ''}>Ciudadano</option>
                        <option value="empleado" ${usuario.rol === 'empleado' ? 'selected' : ''}>Empleado</option>
                        <option value="admin" ${usuario.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar Cambios',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3e206f',
            cancelButtonColor: '#6c757d',
            preConfirm: () => {
                const nombre = document.getElementById('swal-nombre').value.trim();
                const correo = document.getElementById('swal-correo').value.trim();
                const telefono = document.getElementById('swal-telefono').value.trim();
                const rol = document.getElementById('swal-rol').value.trim();

                if (!nombre || !correo || !telefono) {
                    Swal.showValidationMessage('Todos los campos son obligatorios');
                }

                return {
                    nombre: nombre,
                    correo: correo,
                    telefono: telefono,
                    rol: rol
                }
            }
        });

        if (formValues) {
            try {
                // Validación básica
                if (!formValues.nombre || !formValues.correo) {
                    throw new Error('Nombre y correo son obligatorios');
                }

                await patchUsuarios(formValues, usuario.id);
                Swal.fire('¡Actualizado!', 'El usuario ha sido modificado exitosamente.', 'success');
                await cargarUsuarios(); // Recargar tabla

                // Refrescar vista detalle planilla si está activa
                const vistaDet = document.getElementById('vistaDetallePlanilla');
                if (vistaDet && !vistaDet.classList.contains('oculto')) {
                    const idP = vistaDet.dataset.id;
                    if (idP && window.allPlanillas) {
                        const currentP = window.allPlanillas.find(p => p.id == idP);
                        if (currentP) mostrarDetallePlanilla(currentP);
                    }
                }
            } catch (error) {
                console.error("Error al editar usuario:", error);
                Swal.fire('Error', error.message || 'No se pudo actualizar el usuario.', 'error');
            }
        }
    }

    // --- Funcionalidad Eliminar Usuario ---
    async function confirmarEliminacionUsuario(id) {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer. El usuario será eliminado permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deleteUsuarios(id);
                Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
                cargarUsuarios(); // Recargar tabla
            } catch (error) {
                console.error("Error al eliminar usuario:", error);
                Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
            }
        }
    }

    // --- Lógica de Gestión de Planillas (Nueva) ---

    const cuerpoTablaPlanillas = document.getElementById('cuerpoTablaPlanillas');
    const buscadorPlanillas = document.getElementById('buscadorPlanillas');
    const filtroDeptoPlanillas = document.getElementById('filtroDeptoPlanillas');
    const btnNuevaPlanilla = document.getElementById('btnNuevaPlanilla');
    const modalPlanilla = document.getElementById('modalPlanilla');
    const cerrarModalPlanilla = document.getElementById('cerrarModalPlanilla');
    const formularioPlanilla = document.getElementById('formularioPlanilla');

    async function cargarPlanillas() {
        if (!cuerpoTablaPlanillas) return;

        cuerpoTablaPlanillas.innerHTML = '<tr><td colspan="9" style="text-align:center;">Cargando planillas...</td></tr>';

        try {
            const [planillas, relaciones, usuarios] = await Promise.all([
                getPlanillas(),
                getUsuariosPlanillas(),
                getUsuarios()
            ]);

            window.allPlanillas = planillas;
            window.allUsuariosPlanillas = relaciones;
            window.allUsuarios = usuarios;

            renderizarPlanillas(planillas);
        } catch (error) {
            console.error("Error cargando planillas:", error);
            cuerpoTablaPlanillas.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">Error al cargar planillas.</td></tr>';
        }
    }

    function renderizarPlanillas(planillas) {
        if (!cuerpoTablaPlanillas) return;
        cuerpoTablaPlanillas.innerHTML = '';

        const contador = document.getElementById('contadorPlanillas');
        if (contador) contador.textContent = `${planillas.length} planilla${planillas.length !== 1 ? 's' : ''} encontrada${planillas.length !== 1 ? 's' : ''}`;

        if (planillas.length === 0) {
            cuerpoTablaPlanillas.innerHTML = '<tr><td colspan="9" style="text-align:center;">No se encontraron planillas</td></tr>';
            return;
        }

        planillas.forEach(p => {
            const tr = document.createElement('tr');

            // Calculamos salario neto con la nueva estructura
            const pagoExtra = Number(p.cant_horas_extra || 0) * Number(p.pago_hora_extra || 0);
            const neto = Number(p.salario_base || 0) + pagoExtra - Number(p.rebajos || 0);

            // Buscar relación y nombre de usuario
            const relacion = window.allUsuariosPlanillas ? window.allUsuariosPlanillas.find(r => r.planilla_id == p.id) : null;
            let nombreUsuario = "No asignado";
            if (relacion && window.allUsuarios) {
                const user = window.allUsuarios.find(u => u.id == relacion.usuario_id);
                if (user) nombreUsuario = user.nombre;
            }

            tr.innerHTML = `
                <td><strong>${p.puesto}</strong></td>
                <td>${p.departamento}</td>
                <td>₡${Number(p.salario_base).toLocaleString()}</td>
                <td>${p.cant_horas_extra || 0}</td>
                <td>₡${Number(p.pago_hora_extra || 0).toLocaleString()}</td>
                <td>₡${Number(p.rebajos || 0).toLocaleString()}</td>
                <td><span style="font-weight: bold; color: var(--verdeFuerte);">₡${neto.toLocaleString()}</span></td>
                <td class="acciones">
                    <button class="btnAccion btnDetalle" title="Ver Usuarios Relacionados" style="color: var(--moradoPrincipal);"><i class="fas fa-eye"></i></button>
                    <button class="btnAccion btnEditar" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btnAccion btnEliminar" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;

            // Eventos de botones
            const btnDetalle = tr.querySelector('.btnDetalle');
            btnDetalle.onclick = () => mostrarDetallePlanilla(p);

            // Eventos de botones
            const btnEditar = tr.querySelector('.btnEditar');
            btnEditar.onclick = () => abrirModalPlanilla(p);

            const btnEliminar = tr.querySelector('.btnEliminar');
            btnEliminar.onclick = () => confirmarEliminacionPlanilla(p.id);

            cuerpoTablaPlanillas.appendChild(tr);
        });
    }

    function filtrarPlanillas() {
        if (!window.allPlanillas) return;

        const termino = buscadorPlanillas ? buscadorPlanillas.value.toLowerCase() : '';
        const depto = filtroDeptoPlanillas ? filtroDeptoPlanillas.value.toLowerCase() : '';

        const filtradas = window.allPlanillas.filter(p => {
            const coincideTexto = p.puesto.toLowerCase().includes(termino) ||
                p.departamento.toLowerCase().includes(termino);
            const coincideDepto = depto === '' || p.departamento.toLowerCase() === depto;
            return coincideTexto && coincideDepto;
        });

        renderizarPlanillas(filtradas);
    }

    if (buscadorPlanillas) buscadorPlanillas.addEventListener('input', filtrarPlanillas);
    if (filtroDeptoPlanillas) filtroDeptoPlanillas.addEventListener('change', filtrarPlanillas);

    function abrirModalPlanilla(planilla = null) {
        if (!modalPlanilla) return;

        const titulo = document.getElementById('tituloModalPlanilla');
        const form = document.getElementById('formularioPlanilla'); // Keep original form variable name

        if (planilla) {
            titulo.innerText = 'Editar Registro de Planilla';
            form.dataset.id = planilla.id;
            document.getElementById('planillaPuesto').value = planilla.puesto;
            document.getElementById('planillaDepartamento').value = planilla.departamento; // Keep original ID
            document.getElementById('planillaSalarioBase').value = planilla.salario_base; // Keep original ID
            document.getElementById('planillaCantHorasExtra').value = planilla.cant_horas_extra || 0;
            document.getElementById('planillaPagoHoraExtra').value = planilla.pago_hora_extra || 0;
            document.getElementById('planillaRebajos').value = planilla.rebajos || 0;
        } else {
            titulo.innerText = 'Nueva Registro de Planilla';
            form.reset();
            delete form.dataset.id;
        }

        modalPlanilla.classList.remove('oculto');
    }

    if (btnNuevaPlanilla) {
        btnNuevaPlanilla.onclick = () => abrirModalPlanilla();
    }

    if (cerrarModalPlanilla) {
        cerrarModalPlanilla.onclick = () => modalPlanilla.classList.add('oculto');
    }

    if (formularioPlanilla) {
        formularioPlanilla.onsubmit = async (e) => {
            e.preventDefault();

            const id = formularioPlanilla.dataset.id;

            const puesto = document.getElementById('planillaPuesto').value.trim();
            const departamento = document.getElementById('planillaDepartamento').value.trim();
            const salarioBase = document.getElementById('planillaSalarioBase').value.trim();
            const cantHoras = document.getElementById('planillaCantHorasExtra').value.trim();
            const pagoHora = document.getElementById('planillaPagoHoraExtra').value.trim();
            const rebajos = document.getElementById('planillaRebajos').value.trim();

            if (!puesto || !departamento || !salarioBase || !cantHoras || !pagoHora || !rebajos) {
                Swal.fire('Error', 'Todos los campos son obligatorios. Ingrese 0 si es necesario.', 'error');
                return;
            }

            const dataPlanilla = {
                puesto: puesto,
                departamento: departamento,
                salario_base: Number(salarioBase),
                cant_horas_extra: Number(cantHoras),
                pago_hora_extra: Number(pagoHora),
                rebajos: Number(rebajos)
            };
            // Salario neto para guardar consistency
            dataPlanilla.salario_neto = dataPlanilla.salario_base + (dataPlanilla.cant_horas_extra * dataPlanilla.pago_hora_extra) - dataPlanilla.rebajos;

            try {
                if (id) {
                    await patchPlanillas(dataPlanilla, id);
                    Swal.fire('¡Éxito!', 'Planilla actualizada correctamente', 'success');
                } else {
                    await postPlanillas(dataPlanilla);
                    Swal.fire('¡Éxito!', 'Planilla creada correctamente', 'success');
                }
                modalPlanilla.classList.add('oculto');
                cargarPlanillas();
            } catch (error) {
                console.error("Error al guardar planilla:", error);
                Swal.fire('Error', 'No se pudo guardar la planilla', 'error');
            }
        };
    }

    async function confirmarEliminacionPlanilla(id) {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deletePlanillas(id);

                // Eliminar relación en tabla intermedia if exists
                const relacion = window.allUsuariosPlanillas ? window.allUsuariosPlanillas.find(r => r.planilla_id == id) : null;
                if (relacion) {
                    await deleteUsuariosPlanillas(relacion.id);
                }

                Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
                cargarPlanillas();
            } catch (error) {
                console.error("Error al eliminar planilla:", error);
                Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
            }
        }
    }

    // Cerrar al click fuera
    window.addEventListener('click', (e) => {
        if (e.target === modalVerReporte) {
            modalVerReporte.classList.add('oculto');
        }
        if (e.target === modalVerUsuario) {
            modalVerUsuario.classList.add('oculto');
        }
        if (e.target === modalPlanilla) {
            modalPlanilla.classList.add('oculto');
        }
    });

    async function confirmarPago(planilla) {
        // Encontrar usuario asociado
        const relacion = window.allUsuariosPlanillas ? window.allUsuariosPlanillas.find(r => r.planilla_id == planilla.id) : null;
        let nombreUsuario = "Empleado";
        let usuarioId = null;

        if (relacion) {
            usuarioId = relacion.usuario_id;
            const user = window.allUsuarios ? window.allUsuarios.find(u => u.id == usuarioId) : null;
            if (user) nombreUsuario = user.nombre;
        }

        const neto = Number(planilla.salario_base || 0) + (Number(planilla.cant_horas_extra || 0) * Number(planilla.pago_hora_extra || 0)) - Number(planilla.rebajos || 0);

        const result = await Swal.fire({
            title: '¿Confirmar Pago?',
            html: `
                <div style="text-align: left; padding: 10px;">
                    <p><strong>Empleado:</strong> ${nombreUsuario}</p>
                    <p><strong>Puesto:</strong> ${planilla.puesto}</p>
                    <p><strong>Monto:</strong> <span style="color: var(--verdeFuerte); font-weight: bold;">₡${neto.toLocaleString()}</span></p>
                    <p>Se registrará este pago en el historial correspondiente.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, registrar pago',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const nuevoPago = {
                    id: Date.now().toString(),
                    planilla_id: planilla.id,
                    fecha_pago: new Date().toISOString().split('T')[0],
                    monto_pagado: neto,
                    estado: "Pagado",
                    usuario_id: usuarioId
                };

                await postHistorialPago(nuevoPago);

                Swal.fire({
                    icon: 'success',
                    title: 'Pago Registrado',
                    text: `Se ha registrado el pago para ${nombreUsuario} correctamente.`,
                    timer: 2000,
                    showConfirmButton: false
                });

                // Si estamos en la vista de detalle, recargar el historial
                if (!vistaDetallePlanilla.classList.contains('oculto')) {
                    cargarHistorialPagos(planilla.id);
                }
            } catch (error) {
                console.error("Error al registrar pago:", error);
                Swal.fire('Error', 'No se pudo registrar el pago.', 'error');
            }
        }
    }

    async function abrirModalPagoInteractivo(user, planilla) {
        const salarioBase = Number(planilla.salario_base || 0);
        const pagoHoraExtra = Number(planilla.pago_hora_extra || 0);
        const rebajos = Number(planilla.rebajos || 0);

        const { value: formValues } = await Swal.fire({
            title: `Generar Pago: ${user.nombre}`,
            html: `
                <div style="text-align: left; padding: 20px; font-family: 'Poppins', sans-serif;">
                    <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <p style="margin: 5px 0;"><strong>Puesto:</strong> ${planilla.puesto}</p>
                        <p style="margin: 5px 0;"><strong>Departamento:</strong> ${planilla.departamento}</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: #666;">Salario Base</label>
                            <input type="text" value="₡${salarioBase.toLocaleString()}" class="swal2-input" style="width: 100%; margin: 5px 0;" disabled>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: #666;">Pago p/ Hora Extra</label>
                            <input type="text" value="₡${pagoHoraExtra.toLocaleString()}" class="swal2-input" style="width: 100%; margin: 5px 0;" disabled>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: #666;">Horas Extra Trabajadas</label>
                            <input type="number" id="swalExtraHours" class="swal2-input" style="width: 100%; margin: 5px 0;" value="0" min="0">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: #666;">Rebajos Aplicados</label>
                            <input type="text" value="₡${rebajos.toLocaleString()}" class="swal2-input" style="width: 100%; margin: 5px 0;" disabled>
                        </div>
                    </div>

                    <div style="margin-top: 30px; background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                        <h4 style="margin: 0; color: #666; font-size: 0.9rem;">TOTAL A PAGAR</h4>
                        <h2 id="swalTotalPago" style="margin: 5px 0; color: var(--verdeFuerte);">₡${(salarioBase - rebajos).toLocaleString()}</h2>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-check"></i> Procesar Pago',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: 'var(--verdeFuerte)',
            didOpen: () => {
                const inputExtra = document.getElementById('swalExtraHours');
                const displayTotal = document.getElementById('swalTotalPago');

                inputExtra.addEventListener('input', () => {
                    const horas = Number(inputExtra.value) || 0;
                    const total = salarioBase + (horas * pagoHoraExtra) - rebajos;
                    displayTotal.textContent = `₡${total.toLocaleString()}`;
                });
            },
            preConfirm: () => {
                const horas = Number(document.getElementById('swalExtraHours').value) || 0;
                return {
                    horasExtra: horas,
                    montoTotal: salarioBase + (horas * pagoHoraExtra) - rebajos
                };
            }
        });

        if (formValues) {
            try {
                const nuevoPago = {
                    id: Date.now().toString(),
                    planilla_id: planilla.id,
                    fecha_pago: new Date().toISOString().split('T')[0],
                    monto_pagado: formValues.montoTotal,
                    estado: "Pagado",
                    usuario_id: user.id,
                    horas_extra_calculadas: formValues.horasExtra
                };

                await postHistorialPago(nuevoPago);

                Swal.fire({
                    icon: 'success',
                    title: '¡Pago Exitoso!',
                    text: `Se ha registrado el pago para ${user.nombre} por un total de ₡${formValues.montoTotal.toLocaleString()}`,
                    timer: 3000,
                    showConfirmButton: false
                });

                // Recargar historial en la vista de detalle
                cargarHistorialPagos(planilla.id);

            } catch (error) {
                console.error("Error al procesar pago interactivo:", error);
                Swal.fire('Error', 'Ocurrió un error al registrar el pago.', 'error');
            }
        }
    }

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
    function mostrarDetallePlanilla(planilla) {
        if (!vistaDetallePlanilla) return;

        ocultarTodasLasVistas();
        vistaDetallePlanilla.classList.remove('oculto');
        navPlanillas.classList.add('activo');
        vistaDetallePlanilla.dataset.id = planilla.id;

        // Llenar encabezado
        if (planilla) currentPlanillaContext = planilla; // Actualizar contexto
        document.getElementById('detPuesto').textContent = planilla.puesto;
        document.getElementById('detDepto').textContent = planilla.departamento;
        const neto = Number(planilla.salario_base || 0) + (Number(planilla.cant_horas_extra || 0) * Number(planilla.pago_hora_extra || 0)) - Number(planilla.rebajos || 0);
        document.getElementById('detNeto').textContent = `₡${neto.toLocaleString()}`;

        // Cargar historial de pagos
        cargarHistorialPagos(planilla.id);

        const cuerpo = document.getElementById('cuerpoTablaDetallePlanilla');
        if (!cuerpo) return;
        cuerpo.innerHTML = '';

        // Buscar relaciones
        const relaciones = window.allUsuariosPlanillas ? window.allUsuariosPlanillas.filter(r => r.planilla_id == planilla.id) : [];

        if (relaciones.length === 0) {
            cuerpo.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay usuarios asociados a esta planilla.</td></tr>';
            return;
        }

        relaciones.forEach(rel => {
            const user = window.allUsuarios ? window.allUsuarios.find(u => u.id == rel.usuario_id) : null;
            if (user) {
                const tr = document.createElement('tr');
                tr.className = 'fila-usuario';

                // Usuario (Avatar + Nombre + Correo)
                const tdUsuario = document.createElement('td');
                const placeholder = user.nombre ? user.nombre.charAt(0).toUpperCase() : '?';
                const avatarHtml = user.foto ?
                    `<img src="${user.foto}" alt="${user.nombre}" class="avatarImg">` :
                    `<div class="avatarPlaceholder">${placeholder}</div>`;

                tdUsuario.innerHTML = `
                    <div class="usuarioInfo">
                        ${avatarHtml}
                        <div class="infoColaborador">
                            <h4>${user.nombre || 'Sin Nombre'}</h4>
                            <span>${user.correo}</span>
                        </div>
                    </div>
                `;

                // Contacto (Teléfono)
                const tdContacto = document.createElement('td');
                tdContacto.innerHTML = `
                    <div class="contactoInfo">
                        <div><i class="fas fa-phone"></i> ${user.telefono || 'N/A'}</div>
                    </div>
                `;

                // Rol
                const tdRol = document.createElement('td');
                if ((user.rol || '').toLowerCase() === 'admin') {
                    tdRol.innerHTML = `
                        <span class="badgeRol rol-admin">Admin</span>
                        <span class="badgeRol rol-empleado" style="margin-top: 5px; display: inline-block;">Empleado</span>
                    `;
                } else {
                    const claseRol = `rol-${(user.rol || 'ciudadano').toLowerCase()}`;
                    tdRol.innerHTML = `<span class="badgeRol ${claseRol}">${user.rol || 'Ciudadano'}</span>`;
                }

                // Estado (Simulado)
                const tdEstado = document.createElement('td');
                tdEstado.innerHTML = `<span class="estado-activo"><i class="fas fa-circle bolitaVerde"></i> Activo</span>`;

                // Acciones (Reusando funciones existentes)
                const tdAcciones = document.createElement('td');
                tdAcciones.className = 'acciones';

                const btnVer = document.createElement('button');
                btnVer.className = 'btnAccion btnVer';
                btnVer.title = 'Ver detalles';
                btnVer.innerHTML = '<i class="fas fa-eye"></i>';
                btnVer.onclick = () => abrirModalUsuario(user);

                const btnEditar = document.createElement('button');
                btnEditar.className = 'btnAccion btnEditar';
                btnEditar.title = 'Editar usuario';
                btnEditar.innerHTML = '<i class="fas fa-edit"></i>';
                btnEditar.onclick = () => editarUsuario(user);

                const btnPagar = document.createElement('button');
                btnPagar.className = 'btnAccion btnPagar';
                btnPagar.title = 'Realizar Pago';
                btnPagar.style.color = 'var(--verdeFuerte)';
                btnPagar.innerHTML = '<i class="fas fa-dollar-sign"></i>';
                btnPagar.onclick = () => abrirModalPagoInteractivo(user, planilla);

                const btnEliminar = document.createElement('button');
                btnEliminar.className = 'btnAccion btnEliminar';
                btnEliminar.title = 'Eliminar / Desasignar';
                btnEliminar.innerHTML = '<i class="fas fa-trash-alt"></i>';
                btnEliminar.onclick = () => confirmarDesasignarEmpleado(user.id, planilla.id);

                tdAcciones.appendChild(btnVer);
                tdAcciones.appendChild(btnEditar);
                tdAcciones.appendChild(btnPagar);
                tdAcciones.appendChild(btnEliminar);

                tr.appendChild(tdUsuario);
                tr.appendChild(tdContacto);
                tr.appendChild(tdRol);
                tr.appendChild(tdEstado);
                tr.appendChild(tdAcciones);

                cuerpo.appendChild(tr);
            }
        });


    }

    // Función para Desasignar o Eliminar Empleado
    async function confirmarDesasignarEmpleado(usuarioId, planillaId) {
        const result = await Swal.fire({
            title: '¿Qué desea hacer?',
            text: "Puede sacar al empleado de la planilla (volviéndolo ciudadano) o eliminar su cuenta permanentemente.",
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'Sacar de Planilla',
            denyButtonText: 'Eliminar Cuenta',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ffc107', // Amarillo warning
            denyButtonColor: '#d33' // Rojo peligro
        });

        if (result.isConfirmed) {
            // Opción 1: Sacar de Planilla (Revertir a Ciudadano)
            try {
                // 1. Eliminar relación
                const relaciones = window.allUsuariosPlanillas || await getUsuariosPlanillas();
                const relacion = relaciones.find(r => r.usuario_id == usuarioId && r.planilla_id == planillaId);

                if (relacion) {
                    await deleteUsuariosPlanillas(relacion.id);
                }

                // 2. Actualizar Rol a 'ciudadano'
                await patchUsuarios({ rol: 'ciudadano' }, usuarioId);

                Swal.fire('Desasignado', 'El usuario ha sido retirado de la planilla y su rol es ahora Ciudadano.', 'success');

                // Refrescar
                if (window.allPlanillas) {
                    const planilla = window.allPlanillas.find(p => p.id == planillaId);
                    if (planilla) {
                        window.allUsuarios = await getUsuarios();
                        window.allUsuariosPlanillas = await getUsuariosPlanillas();
                        mostrarDetallePlanilla(planilla);
                    }
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo desasignar al empleado.', 'error');
            }

        } else if (result.isDenied) {
            // Opción 2: Eliminar Cuenta Permanentemente
            const confirmDelete = await Swal.fire({
                title: '¿Eliminar cuenta definitivamente?',
                text: "Esta acción NO se puede deshacer. Se borrará todo el registro del usuario.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar todo'
            });

            if (confirmDelete.isConfirmed) {
                try {
                    await deleteUsuarios(usuarioId);

                    // Limpiar relación si existe (json-server no hace cascade delete por defecto)
                    const relaciones = window.allUsuariosPlanillas || await getUsuariosPlanillas();
                    const relacion = relaciones.find(r => r.usuario_id == usuarioId && r.planilla_id == planillaId);
                    if (relacion) {
                        await deleteUsuariosPlanillas(relacion.id);
                    }

                    Swal.fire('Eliminado', 'La cuenta del usuario ha sido eliminada permanentemente.', 'success');

                    // Refrescar
                    if (window.allPlanillas) {
                        const planilla = window.allPlanillas.find(p => p.id == planillaId);
                        if (planilla) {
                            window.allUsuarios = await getUsuarios();
                            window.allUsuariosPlanillas = await getUsuariosPlanillas();
                            mostrarDetallePlanilla(planilla);
                        }
                    }
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'No se pudo eliminar la cuenta.', 'error');
                }
            }
        }
    }

    async function cargarHistorialPagos(planillaId) {
        const cuerpoHistorial = document.getElementById('cuerpoTablaHistorialPagos');
        if (!cuerpoHistorial) return;

        cuerpoHistorial.innerHTML = '<tr><td colspan="3" style="text-align:center;">Cargando historial...</td></tr>';

        try {
            const historial = await getHistorialPagos();
            const filteredHistorial = historial ? historial.filter(h => h.planilla_id == planillaId) : [];

            cuerpoHistorial.innerHTML = '';

            if (filteredHistorial.length === 0) {
                cuerpoHistorial.innerHTML = '<tr><td colspan="3" style="text-align:center;">No hay registros de pago para esta planilla.</td></tr>';
                return;
            }

            // Ordenar por fecha descendente
            filteredHistorial.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));

            filteredHistorial.forEach(h => {
                const tr = document.createElement('tr');

                // Buscar nombre de usuario
                const user = window.allUsuarios ? window.allUsuarios.find(u => u.id == h.usuario_id) : null;
                const nombreUser = user ? user.nombre : (h.usuario_id || 'Desconocido');

                tr.innerHTML = `
                    <td>${h.fecha_pago}</td>
                    <td><strong>${nombreUser}</strong></td>
                    <td><strong style="color: var(--verdeFuerte);">₡${Number(h.monto_pagado).toLocaleString()}</strong></td>
                    <td><span class="badgeEstado estado-resuelto">${h.estado}</span></td>
                    <td class="acciones">
                        <button class="btnAccion btnEliminar" title="Eliminar Registro" style="color: #dc3545;"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;

                const btnEliminar = tr.querySelector('.btnEliminar');
                btnEliminar.onclick = () => confirmarEliminacionPago(h.id, planillaId);

                cuerpoHistorial.appendChild(tr);
            });
        } catch (error) {
            console.error("Error al cargar historial de pagos:", error);
            cuerpoHistorial.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error al cargar el historial.</td></tr>';
        }
    }

    async function confirmarEliminacionPago(pagoId, planillaId) {
        const result = await Swal.fire({
            title: '¿Eliminar registro de pago?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deleteHistorialPago(pagoId);
                Swal.fire('Eliminado', 'El registro de pago ha sido eliminado.', 'success');
                cargarHistorialPagos(planillaId);
            } catch (error) {
                console.error("Error al eliminar pago:", error);
                Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
            }
        }
    }

    async function abrirModalAsignarEmpleado(planilla) {
        if (!window.allUsuarios) return;

        const yaAsignados = window.allUsuariosPlanillas ?
            window.allUsuariosPlanillas.filter(r => r.planilla_id == planilla.id).map(r => r.usuario_id) : [];

        const disponibles = window.allUsuarios.filter(u => u.rol === 'empleado' && !yaAsignados.includes(u.id));

        if (disponibles.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No hay empleados disponibles',
                text: 'Todos los empleados registrados ya están asociados a esta planilla.'
            });
            return;
        }

        const inputOptions = {};
        disponibles.forEach(u => {
            inputOptions[u.id] = u.nombre;
        });

        const { value: usuarioId } = await Swal.fire({
            title: 'Asignar Empleado',
            input: 'select',
            inputOptions: inputOptions,
            inputPlaceholder: 'Seleccione un empleado...',
            showCancelButton: true,
            confirmButtonText: 'Asignar',
            cancelButtonText: 'Cancelar'
        });

        if (usuarioId) {
            try {
                await postUsuariosPlanillas({
                    usuario_id: usuarioId,
                    planilla_id: planilla.id
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Empleado asignado',
                    text: 'Se ha vinculado el empleado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });

                await cargarPlanillas();
                const planillaActualizada = window.allPlanillas.find(p => p.id == planilla.id);
                mostrarDetallePlanilla(planillaActualizada || planilla);
            } catch (error) {
                console.error("Error al asignar:", error);
                Swal.fire('Error', 'No se pudo asignar el empleado.', 'error');
            }
        }
    }

    const btnVolverPlanillas = document.getElementById('btnVolverPlanillas');
    if (btnVolverPlanillas) {
        btnVolverPlanillas.onclick = () => {
            ocultarTodasLasVistas();
            vistaPlanillas.classList.remove('oculto');
            // Assuming navPlanillas is available in scope or by ID
            const navPlanillas = document.getElementById('navPlanillas');
            if (navPlanillas) {
                document.querySelectorAll('.navegacionBarraLateral li').forEach(li => li.classList.remove('activo'));
                navPlanillas.classList.add('activo');
            }
        };
    }

    // --------------------------------------------------------------------------------
    // GESTIÓN DE PROYECTOS VIALES
    // --------------------------------------------------------------------------------

    // navTramites y vistaTramites ya están definidos previamente

    // CSS de Gestion de Proyectos Viales se encuentra en dashboardAdmin.css

    const btnNuevoProyecto = document.getElementById('btnNuevoProyecto');
    const buscadorProyectos = document.getElementById('buscadorProyectos');
    const cuerpoTablaProyectos = document.getElementById('cuerpoTablaProyectos');
    const modalProyecto = document.getElementById('modalProyecto');
    const cerrarModalProyecto = document.getElementById('cerrarModalProyecto');
    const formProyecto = document.getElementById('formProyecto');

    let todosLosProyectos = [];

    if (navTramites) {
        navTramites.addEventListener('click', async (e) => {
            e.preventDefault();
            ocultarTodasLasVistas();
            vistaTramites.classList.remove('oculto');

            // Activar Nav
            document.querySelectorAll('.navegacionBarraLateral li').forEach(li => li.classList.remove('activo'));
            navTramites.classList.add('activo');

            await cargarProyectos();
        });
    }

    async function cargarProyectos() {
        try {
            const proyectos = await getProyectos();
            todosLosProyectos = proyectos || [];
            renderizarProyectos(todosLosProyectos);
            if (document.getElementById('contadorProyectos')) {
                document.getElementById('contadorProyectos').textContent = `${todosLosProyectos.length} proyectos`;
            }
        } catch (error) {
            console.error("Error al cargar proyectos:", error);
        }
    }

    function renderizarProyectos(lista) {
        if (!cuerpoTablaProyectos) return;
        cuerpoTablaProyectos.innerHTML = '';

        lista.forEach(proyecto => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td><strong>${proyecto.nombre || 'Sin nombre'}</strong></td>
                <td><small>${proyecto.descripcion || ''}</small></td>
                <td>₡${(proyecto.presupuesto || 0).toLocaleString()}</td>
                <td>${proyecto.fecha_inicio || '-'}</td>
                <td><span class="badge-proyecto ${obtenerClaseEstado(proyecto.estado)}">${proyecto.estado}</span></td>
                <td class="acciones">
                    <button class="btnAccion btnEditar btn-editar-proyecto" data-id="${proyecto.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btnAccion btnEliminar btn-eliminar-proyecto" data-id="${proyecto.id}" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            cuerpoTablaProyectos.appendChild(tr);
        });

        // Listeners
        document.querySelectorAll('.btn-editar-proyecto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                abrirModalProyecto(id);
            });
        });

        document.querySelectorAll('.btn-eliminar-proyecto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                confirmarEliminarProyecto(id);
            });
        });
    }

    function obtenerClaseEstado(estado) {
        if (!estado) return '';
        const e = estado.toLowerCase();
        if (e.includes('ejecuc')) return 'proyecto-activo';
        if (e.includes('final')) return 'proyecto-aprobado';
        if (e.includes('susp')) return 'proyecto-rechazado';
        return 'proyecto-pendiente';
    }

    // Modal
    if (btnNuevoProyecto) {
        btnNuevoProyecto.addEventListener('click', () => {
            abrirModalProyecto();
        });
    }

    if (cerrarModalProyecto) {
        cerrarModalProyecto.addEventListener('click', () => {
            modalProyecto.classList.add('oculto');
        });
    }

    function abrirModalProyecto(id = null) {
        if (formProyecto) formProyecto.reset();
        const inputId = document.getElementById('idProyectoEditar');
        if (inputId) inputId.value = '';

        // Restringir fecha (No permitir fechas pasadas)
        const fechaInput = document.getElementById('fechaInicioProyectoInput');
        if (fechaInput) {
            const today = new Date().toISOString().split('T')[0];
            fechaInput.setAttribute('min', today);
        }

        const titulo = document.getElementById('tituloModalProyecto');

        if (id) {
            if (titulo) titulo.textContent = 'Editar Proyecto Vial';
            const proyecto = todosLosProyectos.find(p => p.id == id);
            if (proyecto) {
                if (inputId) inputId.value = proyecto.id;
                document.getElementById('nombreProyectoInput').value = proyecto.nombre;
                document.getElementById('descripcionProyectoInput').value = proyecto.descripcion;
                document.getElementById('presupuestoProyectoInput').value = proyecto.presupuesto;
                document.getElementById('fechaInicioProyectoInput').value = proyecto.fecha_inicio;
                document.getElementById('estadoProyectoInput').value = proyecto.estado;
            }
        } else {
            if (titulo) titulo.textContent = 'Nuevo Proyecto Vial';
            const estadoInput = document.getElementById('estadoProyectoInput');
            if (estadoInput) estadoInput.value = 'Planificación';
        }

        modalProyecto.classList.remove('oculto');
    }

    // Submit
    if (formProyecto) {
        formProyecto.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('idProyectoEditar').value;
            const nombre = document.getElementById('nombreProyectoInput').value.trim();
            const descripcion = document.getElementById('descripcionProyectoInput').value.trim();
            const presupuesto = document.getElementById('presupuestoProyectoInput').value.trim();
            const fecha = document.getElementById('fechaInicioProyectoInput').value.trim();
            const estado = document.getElementById('estadoProyectoInput').value.trim();

            if (!nombre || !descripcion || !presupuesto || !fecha || !estado) {
                Swal.fire('Error', 'Todos los campos son obligatorios y no pueden estar vacíos.', 'error');
                return;
            }

            const datos = {
                nombre,
                descripcion,
                presupuesto: Number(presupuesto),
                fecha_inicio: fecha,
                estado
            };

            try {
                if (id) {
                    await patchProyectos(datos, id);
                    Swal.fire('Actualizado', 'Proyecto actualizado correctamente.', 'success');
                } else {
                    await postProyectos(datos);
                    Swal.fire('Creado', 'Proyecto creado correctamente.', 'success');
                }
                modalProyecto.classList.add('oculto');
                cargarProyectos();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo guardar el proyecto.', 'error');
            }
        });
    }

    // Eliminar
    async function confirmarEliminarProyecto(id) {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará este proyecto permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deleteProyectos(id);
                Swal.fire('Eliminado', 'El proyecto ha sido eliminado.', 'success');
                cargarProyectos();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo eliminar el proyecto.', 'error');
            }
        }
    }

    // Buscador
    if (buscadorProyectos) {
        buscadorProyectos.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            const filtrados = todosLosProyectos.filter(p =>
                (p.nombre || '').toLowerCase().includes(termino) ||
                (p.descripcion || '').toLowerCase().includes(termino)
            );
            renderizarProyectos(filtrados);
        });
    }



    // Listener Global para Asignar Empleado (fuera de función render)
    const btnAsignarGlobal = document.getElementById('btnAsignarEmpleadoDetalle');
    if (btnAsignarGlobal) {
        btnAsignarGlobal.addEventListener('click', () => {
            if (currentPlanillaContext) {
                abrirModalAsignarEmpleado(currentPlanillaContext);
            } else {
                console.error("No hay contexto de planilla seleccionado");
                Swal.fire('Error', 'No se ha seleccionado una planilla.', 'error');
            }
        });
    }

    // --- Lógica Asignar Empleado a Planilla ---
    const modalAsignarEmpleado = document.getElementById('modalAsignarEmpleado');
    const cerrarModalAsignarEmpleado = document.getElementById('cerrarModalAsignarEmpleado');
    const formAsignarEmpleado = document.getElementById('formAsignarEmpleado');
    const selectUsuarioAsignar = document.getElementById('selectUsuarioAsignar');

    // Definir como función para que sea 'hoisted' y accesible desde arriba
    // Definir como función para que sea 'hoisted' y accesible desde arriba
    async function abrirModalAsignarEmpleado(planilla) {
        // Buscar elementos dinámicamente para asegurar que existan
        const modal = document.getElementById('modalAsignarEmpleado');
        const select = document.getElementById('selectUsuarioAsignar');
        const inputId = document.getElementById('idPlanillaAsignar');

        if (!modal) {
            console.error("Modal Asignar Empleado no encontrado en el DOM");
            Swal.fire('Error', 'No se encontró la interfaz de asignación.', 'error');
            return;
        }

        if (inputId) inputId.value = planilla.id;
        modal.classList.remove('oculto');

        // Mostrar carga
        if (select) {
            select.innerHTML = '<option value="">Cargando usuarios...</option>';

            try {
                // Refrescar datos antes de mostrar
                await cargarUsuarios();
                const usuarios = window.allUsuarios || [];

                const relaciones = await getUsuariosPlanillas();
                window.allUsuariosPlanillas = relaciones;

                // Filtrar ya asignados a esta planilla
                const asignados = relaciones.filter(r => r.planilla_id == planilla.id).map(r => r.usuario_id);

                // Disponibles
                const disponibles = usuarios.filter(u => !asignados.includes(u.id));

                select.innerHTML = '<option value="">-- Seleccione un usuario --</option>';

                if (disponibles.length === 0) {
                    const opt = document.createElement('option');
                    opt.textContent = "No hay usuarios disponibles";
                    select.appendChild(opt);
                }

                disponibles.forEach(u => {
                    const option = document.createElement('option');
                    option.value = u.id;
                    option.textContent = `${u.nombre || 'Sin Nombre'} (${u.correo}) - ${u.rol}`;
                    select.appendChild(option);
                });

            } catch (error) {
                console.error("Error al cargar usuarios para asignar:", error);
                select.innerHTML = '<option value="">Error al cargar</option>';
            }
        }
    }

    // Exponer al scope si es necesario (para onclicks inline, aunque aquí se usa addEventListener en JS)
    window.abrirModalAsignarEmpleado = abrirModalAsignarEmpleado;

    if (cerrarModalAsignarEmpleado) {
        cerrarModalAsignarEmpleado.addEventListener('click', () => {
            modalAsignarEmpleado.classList.add('oculto');
        });
    }

    // Cerrar al click fuera
    window.addEventListener('click', (e) => {
        if (e.target === modalAsignarEmpleado) {
            modalAsignarEmpleado.classList.add('oculto');
        }
    });

    if (formAsignarEmpleado) {
        formAsignarEmpleado.addEventListener('submit', async (e) => {
            e.preventDefault();

            const planillaId = document.getElementById('idPlanillaAsignar').value;
            const usuarioId = selectUsuarioAsignar.value;

            if (!usuarioId) {
                Swal.fire('Error', 'Debe seleccionar un usuario válido.', 'error');
                return;
            }

            try {
                // Verificar usuario actual para no sobreescribir rol admin
                if (!window.allUsuarios) window.allUsuarios = await getUsuarios();
                const userObj = window.allUsuarios.find(u => u.id == usuarioId);

                // 1. Actualizar Rol a Empleado (SOLO SI NO ES ADMINISTRADOR)
                if (userObj && (userObj.rol || '').toLowerCase() !== 'admin') {
                    await patchUsuarios({ rol: 'empleado' }, usuarioId);
                }

                // 2. Crear Relación
                const nuevaRelacion = {
                    id: Date.now().toString(),
                    usuario_id: usuarioId,
                    planilla_id: planillaId,
                    fecha_asignacion: new Date().toISOString().split('T')[0]
                };

                await postUsuariosPlanillas(nuevaRelacion);

                Swal.fire('¡Asignado!', 'Usuario asignado correctamente.', 'success');
                modalAsignarEmpleado.classList.add('oculto');

                // 3. Refrescar Vista Detalle
                // Recargar TODO para asegurar consistencia
                await cargarPlanillas(); // Refrescar lista de planillas para asegurar objeto fresco
                window.allUsuarios = await getUsuarios();
                window.allUsuariosPlanillas = await getUsuariosPlanillas();

                if (window.allPlanillas) {
                    // Usar find con comparacion laxa por si string/numero
                    const planilla = window.allPlanillas.find(p => p.id == planillaId);
                    if (planilla) {
                        mostrarDetallePlanilla(planilla);
                    } else {
                        console.error("Planilla no encontrada tras refresh:", planillaId);
                        cargarPlanillas(); // Fallback a lista general
                    }
                }

            } catch (error) {
                console.error("Error asignando empleado:", error);
                Swal.fire('Error', 'No se pudo procesar la asignación.', 'error');
            }
        });
    }
    // -------------------------------------------------------------
    // GESTIÓN DE SERVICIOS PÚBLICOS
    // -------------------------------------------------------------

    const navServicios = document.getElementById('navServicios');
    const vistaServicios = document.getElementById('vistaServicios');
    const cuerpoTablaServicios = document.getElementById('cuerpoTablaServicios');
    const buscadorServicios = document.getElementById('buscadorServicios');
    const contadorServicios = document.getElementById('contadorServicios');
    const btnNuevoServicio = document.getElementById('btnNuevoServicio');
    const modalServicio = document.getElementById('modalServicio');
    const cerrarModalServicio = document.getElementById('cerrarModalServicio');
    const formServicio = document.getElementById('formServicio');
    const idServicioEditar = document.getElementById('idServicioEditar');
    const servicioTipo = document.getElementById('servicioTipo');
    const servicioDescripcion = document.getElementById('servicioDescripcion');
    const servicioResponsable = document.getElementById('servicioResponsable');
    const servicioEstado = document.getElementById('servicioEstado');

    // Sidebar
    if (navServicios) {
        navServicios.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarTodasLasVistas();
            vistaServicios.classList.remove('oculto');
            navServicios.classList.add('activo');
            cargarServicios();
        });
    }

    // Modal Listeners
    if (btnNuevoServicio) {
        btnNuevoServicio.addEventListener('click', () => {
            modalServicio.classList.remove('oculto');
            formServicio.reset();
            idServicioEditar.value = '';
            const titulo = document.getElementById('tituloModalServicio');
            if (titulo) titulo.textContent = 'Nuevo Servicio';
        });
    }

    if (cerrarModalServicio) {
        cerrarModalServicio.addEventListener('click', () => modalServicio.classList.add('oculto'));
    }

    // Load Services
    async function cargarServicios() {
        if (!cuerpoTablaServicios) return;

        const termino = buscadorServicios ? buscadorServicios.value.toLowerCase() : '';

        try {
            const servicios = await getServicios();
            // User requested: Buscar por tipo o descripción
            const filtrados = (servicios || []).filter(s =>
                (s.tipo_servicio || '').toLowerCase().includes(termino) ||
                (s.descripcion || '').toLowerCase().includes(termino)
            );

            // Actualizar contador
            const contadorStatus = document.getElementById('contadorServicios');
            if (contadorStatus) {
                contadorStatus.textContent = `${filtrados.length} servicio${filtrados.length !== 1 ? 's' : ''} encontrado${filtrados.length !== 1 ? 's' : ''}`;
            }

            cuerpoTablaServicios.innerHTML = '';

            filtrados.forEach(servicio => {
                const tr = document.createElement('tr');

                // Estilos para el estado (badges)
                let estadoStyle = '';
                if (servicio.estado === 'Activo') {
                    estadoStyle = 'background:#e8f5e9; color:#388e3c;';
                } else if (servicio.estado === 'Inactivo') {
                    estadoStyle = 'background:#ffebee; color:#d32f2f;';
                } else {
                    estadoStyle = 'background:#fff3cd; color:#856404;';
                }

                // Usamos la clase badgeEstado definida en el CSS
                const estadoHtml = `<span class="badgeEstado" style="${estadoStyle}">${servicio.estado || 'Activo'}</span>`;

                tr.innerHTML = `
                    <td><strong>${servicio.tipo_servicio || '-'}</strong></td>
                    <td style="max-width: 350px; font-size: 0.9rem; color: #555;">${servicio.descripcion || '-'}</td>
                    <td>${servicio.responsable || '-'}</td>
                    <td>${estadoHtml}</td>
                    <td class="acciones">
                        <button class="btnAccion btnEditar" title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="btnAccion btnEliminar" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;

                // Agregar listeners a los botones
                const btnEditar = tr.querySelector('.btnEditar');
                btnEditar.addEventListener('click', () => editarServicioLocal(servicio));

                const btnBorrar = tr.querySelector('.btnEliminar');
                btnBorrar.addEventListener('click', () => eliminarServicioLocal(servicio.id));

                cuerpoTablaServicios.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading services:', error);
            cuerpoTablaServicios.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Error cargando datos.</td></tr>';
        }
    }

    // Edit Logic
    function editarServicioLocal(servicio) {
        if (servicio) {
            idServicioEditar.value = servicio.id;
            servicioTipo.value = servicio.tipo_servicio;
            servicioDescripcion.value = servicio.descripcion;
            servicioResponsable.value = servicio.responsable;
            servicioEstado.value = servicio.estado;

            const titulo = document.getElementById('tituloModalServicio');
            if (titulo) titulo.textContent = 'Editar Servicio';

            modalServicio.classList.remove('oculto');
        }
    }

    // Delete Logic
    function eliminarServicioLocal(id) {
        Swal.fire({
            title: '¿Eliminar Servicio?',
            text: "No podrás revertir esto.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteServicios(id);
                    Swal.fire('Eliminado', 'El servicio ha sido eliminado.', 'success');
                    cargarServicios(); // Refresh
                } catch (error) {
                    Swal.fire('Error', 'No se pudo eliminar.', 'error');
                }
            }
        });
    }

    // Search Listener
    if (buscadorServicios) {
        buscadorServicios.addEventListener('input', cargarServicios);
    }

    // Form Submit
    if (formServicio) {
        formServicio.addEventListener('submit', async (e) => {
            e.preventDefault();

            const tipo = servicioTipo.value.trim();
            const desc = servicioDescripcion.value.trim();
            const resp = servicioResponsable.value.trim();
            const estado = servicioEstado.value.trim();

            if (!tipo || !desc || !resp || !estado) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos Incompletos',
                    text: 'Por favor, complete todos los campos obligatorios. No pueden quedar espacios en blanco.',
                    confirmButtonColor: '#3e206f'
                });
                return;
            }

            const nuevoServicio = {
                tipo_servicio: tipo,
                descripcion: desc,
                responsable: resp,
                estado: estado
            };

            const id = idServicioEditar.value;

            try {
                if (id) {
                    await patchServicios(nuevoServicio, id);
                    Swal.fire({ title: 'Actualizado', text: 'Servicio actualizado correctamente', icon: 'success', timer: 1500, showConfirmButton: false });
                } else {
                    await postServicios(nuevoServicio);
                    Swal.fire({ title: 'Creado', text: 'Servicio creado correctamente', icon: 'success', timer: 1500, showConfirmButton: false });
                }
                modalServicio.classList.add('oculto');
                formServicio.reset();
                cargarServicios();
            } catch (error) {
                Swal.fire('Error', 'No se pudo guardar el servicio', 'error');
            }
        });
    }

}
);