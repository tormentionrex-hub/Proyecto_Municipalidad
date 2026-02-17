
import { getReportes, postReportes } from '../services/services.js';

let todosLosReportes = [];
let filtroUbicacion = 'todos';
let filtroTipo = 'todos';

// Menu desplegable
document.querySelectorAll(".desplegable > a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const li = link.parentElement;
        li.classList.toggle("activo");
    });
});

// Cerrar al hacer click fuera
document.addEventListener("click", (e) => {
    if (!e.target.closest(".desplegable")) {
        document.querySelectorAll(".desplegable.activo").forEach(li => li.classList.remove("activo"));
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Cargando informes de la comunidad...');
    const contenedor = document.getElementById('listaReportes');

    // Inicializar Filtros Ubicación
    const btnsUbicacion = document.querySelectorAll('#filtrosUbicacion .btn-filtro');
    btnsUbicacion.forEach(btn => {
        btn.addEventListener('click', () => {
            btnsUbicacion.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            filtroUbicacion = btn.dataset.filtro;
            aplicarFiltros();
        });
    });

    // Inicializar Filtros Tipo
    const btnsTipo = document.querySelectorAll('#filtrosTipo .btn-filtro');
    btnsTipo.forEach(btn => {
        btn.addEventListener('click', () => {
            btnsTipo.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            filtroTipo = btn.dataset.tipo;
            aplicarFiltros();
        });
    });

    // Modal y Formulario
    const btnNuevoReporte = document.getElementById('btnNuevoReporte');
    const modalReporte = document.getElementById('modalReporte');
    const cerrarModal = document.getElementById('cerrarModal');
    const formReporte = document.getElementById('formReporteCiudadano');

    if (btnNuevoReporte) {
        btnNuevoReporte.addEventListener('click', () => {
            modalReporte.classList.remove('oculto');
        });
    }

    if (cerrarModal) {
        cerrarModal.addEventListener('click', () => {
            modalReporte.classList.add('oculto');
        });
    }

    // Cerrar modal al hacer click fuera
    window.addEventListener('click', (e) => {
        if (e.target === modalReporte) {
            modalReporte.classList.add('oculto');
        }
    });

    if (formReporte) {
        formReporte.addEventListener('submit', async (e) => {
            e.preventDefault();

            const titulo = document.getElementById('tituloReporte').value;
            const descripcion = document.getElementById('descripcionReporte').value;
            const ubicacion = document.getElementById('ubicacionReporte').value;
            const usuario = document.getElementById('usuarioReporte').value || 'Anónimo';
            const fotoInput = document.getElementById('fotoReporte');

            let foto = '';
            if (fotoInput.files.length > 0) {
                const file = fotoInput.files[0];
                // Validar tamaño: 70KB
                if (file.size > 70000) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Imagen demasiado pesada',
                        text: 'La imagen debe pesar menos de 70KB.',
                        confirmButtonColor: '#3e206f'
                    });
                    return;
                }
                foto = await convertirImagenABase64(file);
            }

            const nuevoReporte = {
                tipo_obstruccion: titulo,
                comentario: descripcion,
                ubicacion,
                usuario,
                user_id: 1,
                foto,
                fecha: new Date().toISOString().split('T')[0],
                estado: 'Pendiente'
            };

            try {
                await postReportes(nuevoReporte);
                Swal.fire({
                    icon: 'success',
                    title: '¡Reporte enviado!',
                    text: 'Gracias por colaborar con tu comunidad.',
                    confirmButtonColor: '#3e206f'
                });
                formReporte.reset();
                modalReporte.classList.add('oculto');

                // Recargar reportes
                const reportes = await getReportes();
                todosLosReportes = reportes.reverse();
                aplicarFiltros(); // Re-aplicar filtros actuales

            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo enviar el reporte.',
                    confirmButtonColor: '#3e206f'
                });
            }
        });
    }

    try {
        const reportes = await getReportes();
        todosLosReportes = reportes.reverse(); // Guardar en variable global
        renderizarInformes(todosLosReportes);
    } catch (error) {
        console.error('Error:', error);
        contenedor.innerHTML = '<p class="error-msg">Hubo un error al cargar los reportes.</p>';
    }
});

function aplicarFiltros() {
    const filtrados = todosLosReportes.filter(r => {
        // Filtro Ubicación
        const coincideUbicacion = (filtroUbicacion === 'todos') ||
            (r.ubicacion && r.ubicacion.toLowerCase().includes(filtroUbicacion.toLowerCase()));

        // Filtro Tipo
        const coincideTipo = (filtroTipo === 'todos') ||
            (r.tipo_obstruccion && r.tipo_obstruccion.toLowerCase() === filtroTipo.toLowerCase());

        return coincideUbicacion && coincideTipo;
    });

    renderizarInformes(filtrados);
}

function renderizarInformes(reportes) {
    const contenedor = document.getElementById('listaReportes');
    contenedor.innerHTML = '';

    if (reportes.length === 0) {
        contenedor.innerHTML = '<p class="no-data">No hay reportes para este criterio.</p>';
        return;
    }

    reportes.forEach(reporte => {
        const div = document.createElement('div');
        div.className = 'reporte';

        const imagenHtml = reporte.foto ?
            `<div class="contenedor-imagen">
                <img src="${reporte.foto}" alt="Evidencia del reporte">
             </div>` : '';

        div.innerHTML = `
            <h2>${reporte.tipo_obstruccion}</h2>
            <h3>${reporte.comentario}</h3>
            ${imagenHtml}
            <div class="info-extra">
                <p><i class="fas fa-map-marker-alt"></i> <strong>Ubicación:</strong> ${reporte.ubicacion}</p>
                <p><i class="fas fa-calendar-alt"></i> <strong>Fecha:</strong> ${reporte.fecha}</p>
                <p><i class="fas fa-user"></i> <strong>Reportado por:</strong> ${reporte.usuario || 'Anónimo'}</p>
                <span class="etiqueta-estado estado-${reporte.estado.toLowerCase().replace(' ', '-')}">${reporte.estado}</span>
            </div>
        `;

        contenedor.appendChild(div);
    });
}
