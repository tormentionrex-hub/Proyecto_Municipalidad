import {
    getReportes,
    deleteReportes,
    patchReportes,
    getUsuarios,
    patchUsuarios,
    deleteUsuarios
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
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: "¿Estás seguro de que deseas salir?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = './login.html';
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

    // --- Lógica de Gestión de Reportes (Nueva) ---

    const navDashboard = document.getElementById('navDashboard');
    const navReportes = document.getElementById('navReportes');
    const navTramites = document.getElementById('navTramites'); // Nuevo
    const navUsuarios = document.getElementById('navUsuarios');

    const vistaDashboard = document.getElementById('vistaDashboard');
    const vistaReportes = document.getElementById('vistaReportes');
    const vistaTramites = document.getElementById('vistaTramites'); // Nueva
    const vistaUsuarios = document.getElementById('vistaUsuarios');
    const vistaInvitarUsuario = document.getElementById('vistaInvitarUsuario');

    const cuerpoTabla = document.getElementById('cuerpoTablaReportes');
    const btnRecargar = document.getElementById('btnRecargarReportes');

    const buscadorReportes = document.getElementById('buscadorReportes');
    const filtroTipoReporte = document.getElementById('filtroTipoReporte');
    const btnVistaListaReportes = document.getElementById('btnVistaListaReportes');
    const btnVistaCuadriculaReportes = document.getElementById('btnVistaCuadriculaReportes');

    // Función auxiliar para ocultar todas las vistas
    function ocultarTodasLasVistas() {
        [vistaDashboard, vistaReportes, vistaTramites, vistaUsuarios, vistaInvitarUsuario].forEach(v => {
            if (v) v.classList.add('oculto');
        });
        [navDashboard, navReportes, navTramites, navUsuarios].forEach(n => {
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
    const btnInvitar = document.querySelector('.botonInvitar');
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
            const email = document.getElementById('invitacionEmail').value;
            const rol = document.getElementById('invitacionRol').value;
            const nombre = document.getElementById('invitacionNombre').value;
            const mensajePersonalizado = document.getElementById('invitacionMensaje').value;

            if (!email || !rol) {
                Swal.fire('Error', 'Por favor complete el email y el rol.', 'error');
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

    // Event Delegation para Botones de la tabla USUARIOS
    if (cuerpoTablaUsuarios) {
        cuerpoTablaUsuarios.addEventListener('click', async (e) => {
            const btnEliminar = e.target.closest('.btnEliminarUsuario');
            const btnEditar = e.target.closest('.btnEditarUsuario');

            // Ver Usuario
            const btnVer = e.target.closest('.btnVerUsuario');
            if (btnVer) {
                const id = btnVer.dataset.id;
                const usuarios = window.allUsuarios || await getUsuarios();
                const usuario = usuarios.find(u => u.id == id);
                if (usuario) abrirModalUsuario(usuario);
            }

            // Eliminar Usuario
            if (btnEliminar) {
                const id = btnEliminar.dataset.id;
                Swal.fire({
                    title: '¿Eliminar usuario?',
                    text: "Esta acción eliminará permanentemente al usuario.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await deleteUsuarios(id);
                            Swal.fire(
                                'Eliminado',
                                'El usuario ha sido eliminado.',
                                'success'
                            );
                            cargarUsuarios(); // Recargar tabla
                        } catch (error) {
                            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
                            console.error(error);
                        }
                    }
                });
            }


            // Editar Usuario
            if (btnEditar) {
                const id = btnEditar.dataset.id;
                const tr = e.target.closest('tr');
                const nombreActual = tr.querySelector('.infoColaborador h4').innerText;
                const rolActualElement = tr.querySelector('.badgeRol');
                const rolActual = rolActualElement ? rolActualElement.innerText : 'usuario'; // Default a usuario si no encuentra

                // Preguntar qué se desea editar
                const { value: opcion } = await Swal.fire({
                    title: `Editar Usuario: ${nombreActual}`,
                    input: 'radio',
                    inputOptions: {
                        '1': 'Cambiar Rol',
                        '2': 'Cambiar Nombre'
                    },
                    inputValidator: (value) => {
                        if (!value) {
                            return 'Debes seleccionar una opción'
                        }
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Continuar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#3e206f'
                });

                if (opcion === "1") {
                    // Cambiar Rol con validación estricta
                    const { value: nuevoRol } = await Swal.fire({
                        title: 'Cambiar Rol',
                        input: 'select',
                        inputOptions: {
                            'admin': 'Administrador (admin)',
                            'usuario': 'Usuario (usuario)',
                            'ciudadano': 'Ciudadano (ciudadano)'
                        },
                        inputPlaceholder: 'Selecciona un rol',
                        inputValue: rolActual.toLowerCase(),
                        showCancelButton: true,
                        confirmButtonText: 'Guardar',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#3e206f',
                        preConfirm: (value) => {
                            // Validación adicional aunque el select ya limita, por seguridad
                            const rolesValidos = ['admin', 'usuario', 'ciudadano'];
                            if (!rolesValidos.includes(value)) {
                                Swal.showValidationMessage('Rol inválido seleccionado');
                            }
                            return value;
                        }
                    });

                    if (nuevoRol && nuevoRol !== rolActual) {
                        try {
                            await patchUsuarios({ rol: nuevoRol }, id);
                            Swal.fire({
                                icon: 'success',
                                title: 'Rol Actualizado',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            cargarUsuarios();
                        } catch (error) {
                            Swal.fire('Error', 'Error al actualizar el rol', 'error');
                        }
                    }
                } else if (opcion === "2") {
                    // Cambiar Nombre
                    const { value: nuevoNombre } = await Swal.fire({
                        title: 'Cambiar Nombre',
                        input: 'text',
                        inputValue: nombreActual,
                        showCancelButton: true,
                        confirmButtonText: 'Guardar',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#3e206f',
                        inputValidator: (value) => {
                            if (!value) {
                                return 'El nombre no puede estar vacío'
                            }
                        }
                    });

                    if (nuevoNombre && nuevoNombre !== nombreActual) {
                        try {
                            await patchUsuarios({ nombre: nuevoNombre }, id);
                            Swal.fire({
                                icon: 'success',
                                title: 'Nombre Actualizado',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            cargarUsuarios();
                        } catch (error) {
                            Swal.fire('Error', 'Error al actualizar el nombre', 'error');
                        }
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
                return {
                    nombre: document.getElementById('swal-nombre').value,
                    correo: document.getElementById('swal-correo').value,
                    telefono: document.getElementById('swal-telefono').value,
                    rol: document.getElementById('swal-rol').value
                }
            }
        });

        if (formValues) {
            try {
                // Validación básica
                if (!formValues.nombre || !formValues.correo) {
                    throw new Error('Nombre y correo son obligatorios');
                }

                await patchUsuarios(usuario.id, formValues);
                Swal.fire('¡Actualizado!', 'El usuario ha sido modificado exitosamente.', 'success');
                cargarUsuarios(); // Recargar tabla
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