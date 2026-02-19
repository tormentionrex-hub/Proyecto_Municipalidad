
import { getReportes, postReportes, patchReportes, deleteReportes, getUsuarios } from '../services/services.js';

let todosLosReportes = [];
let todosLosUsuarios = [];
let filtroUbicacion = 'todos';
let filtroTipo = 'todos';
let filtroMios = false;
let modoEdicion = false;
let idReporteEditar = null;
let fotoActualEdicion = '';

// Leer usuario activo del localStorage
const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo') || 'null');

// Menú desplegable navbar
document.querySelectorAll(".desplegable > a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        link.parentElement.classList.toggle("activo");
    });
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".desplegable")) {
        document.querySelectorAll(".desplegable.activo").forEach(li => li.classList.remove("activo"));
    }
});

// Cerrar dropdowns de 3 puntos al hacer click fuera
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-opciones:not(.oculto)').forEach(d => d.classList.add('oculto'));
});

document.addEventListener('DOMContentLoaded', async () => {
    configurarBotonIngresar();
    configurarMenuAdmin();

    // Mostrar filtro "Mis publicaciones" solo si hay usuario activo
    if (usuarioActivo) {
        const grupoFiltroMio = document.getElementById('grupoFiltroMio');
        if (grupoFiltroMio) grupoFiltroMio.style.display = '';

        // Ocultar campo de nombre si el usuario está autenticado
        const campoNombre = document.getElementById('campoNombreUsuario');
        if (campoNombre) campoNombre.style.display = 'none';
    }

    const btnMisPublicaciones = document.getElementById('btnMisPublicaciones');
    if (btnMisPublicaciones) {
        btnMisPublicaciones.addEventListener('click', () => {
            filtroMios = !filtroMios;
            btnMisPublicaciones.classList.toggle('activo', filtroMios);
            aplicarFiltros();
        });
    }

    // Filtros ubicación
    const btnsUbicacion = document.querySelectorAll('#filtrosUbicacion .btn-filtro');
    btnsUbicacion.forEach(btn => {
        btn.addEventListener('click', () => {
            btnsUbicacion.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            filtroUbicacion = btn.dataset.filtro;
            aplicarFiltros();
        });
    });

    // Filtros tipo
    const btnsTipo = document.querySelectorAll('#filtrosTipo .btn-filtro');
    btnsTipo.forEach(btn => {
        btn.addEventListener('click', () => {
            btnsTipo.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            filtroTipo = btn.dataset.tipo;
            aplicarFiltros();
        });
    });

    // Modal
    const btnNuevoReporte = document.getElementById('btnNuevoReporte');
    const modalReporte = document.getElementById('modalReporte');
    const cerrarModal = document.getElementById('cerrarModal');
    const formReporte = document.getElementById('formReporteCiudadano');

    if (btnNuevoReporte) {
        btnNuevoReporte.addEventListener('click', () => {
            resetearFormulario();
            modalReporte.classList.remove('oculto');
        });
    }

    if (cerrarModal) {
        cerrarModal.addEventListener('click', () => modalReporte.classList.add('oculto'));
    }

    window.addEventListener('click', (e) => {
        if (e.target === modalReporte) modalReporte.classList.add('oculto');
    });

    // Zona de foto (upload estilo redes sociales)
    const fotoInput = document.getElementById('fotoReporte');
    const zonaFoto = document.getElementById('zonaFoto');
    const previewFoto = document.getElementById('previewFoto');
    const imgPreview = document.getElementById('imgPreview');
    const btnQuitarFoto = document.getElementById('btnQuitarFoto');

    // Click en la zona abre el selector de archivo
    zonaFoto.addEventListener('click', (e) => {
        if (e.target === btnQuitarFoto || btnQuitarFoto.contains(e.target)) return;
        fotoInput.click();
    });

    // Drag & drop
    zonaFoto.addEventListener('dragover', (e) => {
        e.preventDefault();
        zonaFoto.classList.add('arrastrando');
    });
    zonaFoto.addEventListener('dragleave', () => zonaFoto.classList.remove('arrastrando'));
    zonaFoto.addEventListener('drop', (e) => {
        e.preventDefault();
        zonaFoto.classList.remove('arrastrando');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) mostrarPreview(file);
    });

    fotoInput.addEventListener('change', () => {
        const file = fotoInput.files[0];
        if (file) mostrarPreview(file);
    });

    btnQuitarFoto.addEventListener('click', (e) => {
        e.stopPropagation();
        limpiarPreview();
    });

    function mostrarPreview(file) {
        const url = URL.createObjectURL(file);
        imgPreview.src = url;
        previewFoto.classList.remove('oculto');
        document.getElementById('zonaFotoPlaceholder').style.display = 'none';
    }

    function limpiarPreview() {
        fotoInput.value = '';
        imgPreview.src = '';
        previewFoto.classList.add('oculto');
        document.getElementById('zonaFotoPlaceholder').style.display = '';
    }

    if (formReporte) {
        formReporte.addEventListener('submit', async (e) => {
            e.preventDefault();

            const titulo = document.getElementById('tituloReporte').value;
            const descripcion = document.getElementById('descripcionReporte').value;
            const ubicacion = document.getElementById('ubicacionReporte').value;
            const fotoInput = document.getElementById('fotoReporte');

            let foto = '';
            if (fotoInput.files.length > 0) {
                const file = fotoInput.files[0];
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
            } else if (modoEdicion && fotoActualEdicion) {
                foto = fotoActualEdicion;
            }

            // Usar datos del usuario activo si existe, si no usar el campo del formulario (solo para nuevos)
            const nombreUsuario = usuarioActivo
                ? usuarioActivo.nombre
                : (document.getElementById('usuarioReporte').value || 'Anónimo');

            try {
                if (modoEdicion) {
                    const reporteActualizado = {
                        tipo_obstruccion: titulo,
                        comentario: descripcion,
                        ubicacion,
                        foto // Actualizar foto si se cambió o mantener la anterior
                    };

                    await patchReportes(reporteActualizado, idReporteEditar);

                    Swal.fire({
                        icon: 'success',
                        title: '¡Actualizado!',
                        text: 'La publicación ha sido modificada.',
                        confirmButtonColor: '#3e206f',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    const nuevoReporte = {
                        tipo_obstruccion: titulo,
                        comentario: descripcion,
                        ubicacion,
                        usuario: nombreUsuario,
                        user_id: usuarioActivo ? usuarioActivo.id : null,
                        foto,
                        fecha: new Date().toISOString().split('T')[0],
                        estado: 'Pendiente'
                    };

                    await postReportes(nuevoReporte);

                    Swal.fire({
                        icon: 'success',
                        title: '¡Reporte enviado!',
                        text: 'Gracias por colaborar con tu comunidad.',
                        confirmButtonColor: '#3e206f'
                    });
                }

                resetearFormulario();
                modalReporte.classList.add('oculto');

                // Recargar
                const reportes = await getReportes();
                todosLosReportes = reportes.reverse();
                aplicarFiltros();

            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al procesar la solicitud.',
                    confirmButtonColor: '#3e206f'
                });
            }
        });
    }

    // Funciones auxiliares para el modal
    function resetearFormulario() {
        formReporte.reset();
        limpiarPreview();
        modoEdicion = false;
        idReporteEditar = null;
        fotoActualEdicion = '';

        // Restaurar textos
        document.querySelector('#modalReporte h2').textContent = 'Reportar un Problema';
        document.querySelector('.boton-submit').textContent = 'Enviar Reporte';

        // Mostrar campo nombre si no hay usuario (solo en crear)
        const campoNombre = document.getElementById('campoNombreUsuario');
        if (campoNombre && !usuarioActivo) campoNombre.style.display = '';
    }

    window.cargarDatosEdicion = function (reporte) {
        modoEdicion = true;
        idReporteEditar = reporte.id;
        fotoActualEdicion = reporte.foto || '';

        // Llenar campos
        document.getElementById('tituloReporte').value = reporte.tipo_obstruccion || '';
        document.getElementById('descripcionReporte').value = reporte.comentario || '';
        document.getElementById('ubicacionReporte').value = reporte.ubicacion || '';

        // Ocultar campo nombre en edición (usualmente no se edita el autor)
        const campoNombre = document.getElementById('campoNombreUsuario');
        if (campoNombre) campoNombre.style.display = 'none';

        // Foto
        limpiarPreview(); // limpiar input file real
        if (reporte.foto && reporte.foto.trim() !== '') {
            const imgPreview = document.getElementById('imgPreview');
            const previewFoto = document.getElementById('previewFoto');
            const placeholder = document.getElementById('zonaFotoPlaceholder');

            imgPreview.src = reporte.foto;
            previewFoto.classList.remove('oculto');
            placeholder.style.display = 'none';
        }

        // Cambiar textos UI
        document.querySelector('#modalReporte h2').textContent = 'Editar Publicación';
        document.querySelector('.boton-submit').textContent = 'Guardar Cambios';

        // Mostrar modal
        modalReporte.classList.remove('oculto');
    };

    // Cargar reportes y usuarios en paralelo
    try {
        const [reportes, usuarios] = await Promise.all([getReportes(), getUsuarios()]);
        todosLosUsuarios = usuarios || [];
        todosLosReportes = reportes.reverse();
        renderizarBannerUsuario();
        aplicarFiltros();
    } catch (error) {
        console.error('Error cargando datos:', error);
        document.getElementById('listaReportes').innerHTML = '<p class="no-data">Hubo un error al cargar los reportes.</p>';
    }
});

function renderizarBannerUsuario() {
    const banner = document.getElementById('bannerUsuario');
    if (!banner || !usuarioActivo) return;

    const misReportes = todosLosReportes.filter(r => String(r.user_id) === String(usuarioActivo.id)).length;

    const avatarHtml = usuarioActivo.foto
        ? `<img src="${usuarioActivo.foto}" alt="${usuarioActivo.nombre}" class="banner-avatar">`
        : `<div class="banner-avatar-placeholder"><i class="fas fa-user"></i></div>`;

    const rolesLabel = { admin: 'Administrador', ciudadano: 'Ciudadano', usuario: 'Usuario' };
    const rolLabel = rolesLabel[usuarioActivo.rol] || usuarioActivo.rol;

    banner.innerHTML = `
        <div class="banner-izquierda">
            ${avatarHtml}
            <div class="banner-info">
                <h2>${usuarioActivo.nombre}</h2>
                <span class="banner-rol rol-${usuarioActivo.rol}">${rolLabel}</span>
            </div>
        </div>
        <div class="banner-estadisticas">
            <div class="banner-stat">
                <span class="stat-numero">${misReportes}</span>
                <span class="stat-label">Mis reportes</span>
            </div>
            <div class="banner-stat">
                <span class="stat-numero">${todosLosReportes.length}</span>
                <span class="stat-label">Total reportes</span>
            </div>
        </div>
    `;
    banner.classList.remove('oculto');
}

function configurarBotonIngresar() {
    const boton = document.querySelector('.botonIngresar');
    if (!boton) return;

    if (usuarioActivo) {
        boton.textContent = 'Cerrar Sesión';
        boton.style.borderColor = '#dc3545';
        boton.style.color = '#dc3545';
        boton.style.fontWeight = 'bold';

        boton.addEventListener('mouseenter', () => {
            boton.style.backgroundColor = '#dc3545';
            boton.style.color = 'white';
        });
        boton.addEventListener('mouseleave', () => {
            boton.style.backgroundColor = 'transparent';
            boton.style.color = '#dc3545';
        });

        boton.addEventListener('click', (e) => {
            e.preventDefault();
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
    } else {
        boton.addEventListener('click', () => {
            window.location.href = '../pages/login.html';
        });
    }
}

function configurarMenuAdmin() {
    if (usuarioActivo && usuarioActivo.rol === 'admin') {
        const listaMenu = document.querySelector('.listaMenu');
        if (listaMenu) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="../pages/dashboardAdmin.html" style="color: #28a745; font-weight: bold;">Admin <i class="fas fa-user-shield"></i></a>';
            listaMenu.insertBefore(li, listaMenu.firstChild);
        }
    }
}

function obtenerUsuarioDeReporte(user_id) {
    if (!user_id) return null;
    return todosLosUsuarios.find(u => String(u.id) === String(user_id)) || null;
}

function esPropietarioOAdmin(reporte) {
    if (!usuarioActivo) return false;
    if (usuarioActivo.rol === 'admin') return true;
    return String(reporte.user_id) === String(usuarioActivo.id);
}

function obtenerClaseTipo(tipo) {
    if (!tipo) return 'tipo-default';
    const t = tipo.toLowerCase();
    if (t.includes('bache')) return 'tipo-baches';
    if (t.includes('alcantarill')) return 'tipo-alcantarillado';
    if (t.includes('se')) return 'tipo-senalizacion';
    return 'tipo-default';
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function aplicarFiltros() {
    const filtrados = todosLosReportes.filter(r => {
        const coincideUbicacion = filtroUbicacion === 'todos' ||
            (r.ubicacion && r.ubicacion.toLowerCase().includes(filtroUbicacion.toLowerCase()));
        const coincideTipo = filtroTipo === 'todos' ||
            (r.tipo_obstruccion && r.tipo_obstruccion.toLowerCase() === filtroTipo.toLowerCase());
        const coincideMios = !filtroMios ||
            (usuarioActivo && String(r.user_id) === String(usuarioActivo.id));
        return coincideUbicacion && coincideTipo && coincideMios;
    });
    renderizarInformes(filtrados);
}

async function eliminarReporte(id) {
    const resultado = await Swal.fire({
        title: '¿Eliminar publicación?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e53935',
        cancelButtonColor: '#3e206f',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!resultado.isConfirmed) return;

    try {
        await deleteReportes(id);
        const reportes = await getReportes();
        todosLosReportes = reportes.reverse();
        aplicarFiltros();
        Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'La publicación fue eliminada.',
            confirmButtonColor: '#3e206f',
            timer: 1800,
            showConfirmButton: false
        });
    } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.', confirmButtonColor: '#3e206f' });
    }
}

function renderizarInformes(reportes) {
    const contenedor = document.getElementById('listaReportes');
    contenedor.innerHTML = '';

    if (reportes.length === 0) {
        contenedor.innerHTML = '<p class="no-data">No hay reportes para este criterio.</p>';
        return;
    }

    reportes.forEach(reporte => {
        const usuarioReporte = obtenerUsuarioDeReporte(reporte.user_id);
        const puedeGestionar = esPropietarioOAdmin(reporte);

        // Lógica de fallback para foto: 
        // 1. Intentar usar la foto de la base de datos (usuarioReporte)
        // 2. Si es mi propio reporte y la base no está actualizada, usar mi foto de sesión (usuarioActivo)
        let fotoAvatar = '';
        if (usuarioReporte && usuarioReporte.foto && usuarioReporte.foto.trim() !== '') {
            fotoAvatar = usuarioReporte.foto;
        } else if (usuarioActivo && String(reporte.user_id) === String(usuarioActivo.id) && usuarioActivo.foto) {
            fotoAvatar = usuarioActivo.foto;
        }

        const avatarHtml = fotoAvatar
            ? `<img src="${fotoAvatar}" alt="${usuarioReporte?.nombre || 'Usuario'}" class="avatar-usuario">`
            : `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`;

        const nombreAutor = usuarioReporte?.nombre || reporte.usuario || 'Anónimo';

        const tieneFotoValida = reporte.foto &&
            (reporte.foto.startsWith('data:image') || reporte.foto.startsWith('http'));

        const estadoClass = reporte.estado
            ? reporte.estado.toLowerCase().replace(/\s+/g, '-')
            : 'pendiente';

        const fotoHtml = tieneFotoValida
            ? `<div class="pub-foto-centrada">
                    <img src="${reporte.foto}" alt="Evidencia">
               </div>`
            : '';

        const infoFilaHtml = `
            <div class="pub-info-fila">
                <div class="pub-info-item">
                    <i class="fas fa-tag"></i>
                    <span class="pub-info-label">Tipo</span>
                    <span class="pub-info-valor">${reporte.tipo_obstruccion || '—'}</span>
                </div>
                <div class="pub-info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="pub-info-label">Ubicación</span>
                    <span class="pub-info-valor">${reporte.ubicacion || '—'}</span>
                </div>
                <div class="pub-info-item">
                    <i class="fas fa-circle-dot"></i>
                    <span class="pub-info-label">Estado</span>
                    <span class="pub-info-valor pub-estado-${estadoClass}">${reporte.estado || '—'}</span>
                </div>
            </div>`;

        const menuHtml = puedeGestionar ? `
            <div class="menu-opciones">
                <button class="btn-tres-puntos" title="Opciones"><i class="fas fa-ellipsis-h"></i></button>
                <div class="dropdown-opciones oculto">
                    <button class="opcion-dropdown opcion-editar">
                        <i class="fas fa-pen"></i> Editar
                    </button>
                    <button class="opcion-dropdown opcion-eliminar" data-id="${reporte.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>` : '';

        const div = document.createElement('div');
        div.className = 'tarjeta-publicacion';
        div.innerHTML = `
            <div class="publicacion-header">
                <div class="publicacion-autor">
                    ${avatarHtml}
                    <div class="autor-info">
                        <span class="autor-nombre">${nombreAutor}</span>
                        <span class="publicacion-fecha">${formatearFecha(reporte.fecha)}</span>
                    </div>
                </div>
                ${menuHtml}
            </div>
            <div class="publicacion-cuerpo">
                <p class="publicacion-descripcion">${reporte.comentario || ''}</p>
            </div>
            ${fotoHtml}
            ${infoFilaHtml}
        `;

        if (puedeGestionar) {
            const btnTresPuntos = div.querySelector('.btn-tres-puntos');
            const dropdown = div.querySelector('.dropdown-opciones');

            btnTresPuntos.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.dropdown-opciones:not(.oculto)').forEach(d => {
                    if (d !== dropdown) d.classList.add('oculto');
                });
                dropdown.classList.toggle('oculto');
            });

            div.querySelector('.opcion-eliminar').addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.add('oculto');
                eliminarReporte(reporte.id);
            });

            div.querySelector('.opcion-editar').addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.add('oculto');
                window.cargarDatosEdicion(reporte);
            });
        }

        contenedor.appendChild(div);
    });
}

function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ── Lightbox ────────────────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCerrar = document.getElementById('lightboxCerrar');

function abrirLightbox(src) {
    lightboxImg.src = src;
    lightbox.style.display = 'flex';
    lightbox.classList.remove('cerrando');
    document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
    lightbox.classList.add('cerrando');
    lightbox.addEventListener('animationend', () => {
        lightbox.style.display = 'none';
        lightbox.classList.remove('cerrando');
        lightboxImg.src = '';
        document.body.style.overflow = '';
    }, { once: true });
}

lightboxCerrar.addEventListener('click', cerrarLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) cerrarLightbox();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') cerrarLightbox();
});

// Delegación: click en cualquier imagen de publicación
document.getElementById('listaReportes').addEventListener('click', (e) => {
    const img = e.target.closest('.pub-foto-centrada img');
    if (img) abrirLightbox(img.src);
});
