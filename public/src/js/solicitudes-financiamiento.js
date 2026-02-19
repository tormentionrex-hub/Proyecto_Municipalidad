import { getSolicitudesFinanciamiento, postSolicitudesFinanciamiento } from '../services/services.js';

// Menu desplegable (Lógica idéntica a home.js)
document.querySelectorAll(".desplegable > a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const li = link.parentElement;
        li.classList.toggle("activo");
    });
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".desplegable")) {
        document.querySelectorAll(".desplegable.activo").forEach(li => li.classList.remove("activo"));
    }
});

const gridSolicitudes = document.querySelector('.gridSolicitudes');
const btnNuevaSolicitud = document.getElementById('btnNuevaSolicitud');
const modalSolicitud = document.getElementById('modalSolicitud');
const cerrarModal = document.getElementById('cerrarModal');
const formSolicitud = document.getElementById('formSolicitud');
const ubicacionSelect = document.getElementById('ubicacionProyecto');

const cantonesObjetivo = ['San Antonio', 'San Rafael', 'Escazú Centro'];

// Inject CSS for pending state
const style = document.createElement('style');
style.textContent = `
    .estadoPendiente {
        background-color: #fff3cd;
        color: #856404;
    }
    .detalleSolicitud {
        font-size: 0.9em;
        color: #666;
        margin-top: 8px;
        margin-bottom: 8px;
    }
`;
document.head.appendChild(style);

// Populate Location Select
function poblarUbicaciones() {
    if (ubicacionSelect) {
        ubicacionSelect.innerHTML = '<option value="" disabled selected>Seleccione una ubicación</option>';
        cantonesObjetivo.forEach(canton => {
            const option = document.createElement('option');
            option.value = canton;
            option.textContent = canton;
            ubicacionSelect.appendChild(option);
        });
    }
}

// Cargar solicitudes al inicio
async function cargarSolicitudes() {
    try {
        const solicitudes = await getSolicitudesFinanciamiento();

        if (!solicitudes || solicitudes.length === 0) {
            gridSolicitudes.innerHTML = '<p>No hay solicitudes registradas.</p>';
            return;
        }

        gridSolicitudes.innerHTML = ''; // Clear static content

        solicitudes.forEach(solicitud => {
            const card = document.createElement('article');
            card.classList.add('cardSolicitud');

            // Determine status class and text
            let statusClass = 'estadoPendiente';
            const estado = solicitud.estado ? solicitud.estado.toLowerCase() : 'pendiente';

            if (estado === 'aprobado' || estado === 'disponible') {
                statusClass = 'estadoActivo';
            } else if (estado === 'rechazado' || estado === 'cerrado') {
                statusClass = 'estadoCerrado';
            }

            // Determine icon based on project name or defaults
            let iconClass = 'fa-file-invoice-dollar';
            const nombre = solicitud.nombre_proyecto ? solicitud.nombre_proyecto.toLowerCase() : '';

            if (nombre.includes('parque') || nombre.includes('ambiente') || nombre.includes('arbol')) {
                iconClass = 'fa-tree';
            } else if (nombre.includes('vivienda') || nombre.includes('casa') || nombre.includes('hogar')) {
                iconClass = 'fa-home';
            } else if (nombre.includes('emprend') || nombre.includes('negocio') || nombre.includes('pyme')) {
                iconClass = 'fa-store';
            } else if (nombre.includes('beca') || nombre.includes('estudio') || nombre.includes('educa')) {
                iconClass = 'fa-graduation-cap';
            } else if (nombre.includes('señal') || nombre.includes('vial') || nombre.includes('calle')) {
                iconClass = 'fa-traffic-light';
            } else if (nombre.includes('salud') || nombre.includes('medico')) {
                iconClass = 'fa-heartbeat';
            }

            // Using the data from the table to populate the card
            card.innerHTML = `
                <div class="iconoCard">
                    <i class="fas ${iconClass}"></i>
                </div>
                <h2>${solicitud.nombre_proyecto || 'Solicitud sin título'}</h2>
                <p>${solicitud.descripcion || 'Sin descripción disponible.'}</p>
                <div class="detalleSolicitud">
                    <p><strong>Ubicación:</strong> ${solicitud.ubicacion || 'No especificada'}</p>
                    <p><strong>Monto:</strong> ₡${solicitud.monto_solicitado || 0}</p>
                    <p><strong>Entidad:</strong> ${solicitud.entidad_financiera || 'Pendiente'}</p>
                </div>
                <span class="estadoCard ${statusClass}">${solicitud.estado || 'Pendiente'}</span>
            `;
            gridSolicitudes.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        gridSolicitudes.innerHTML = '<p>Error al cargar las solicitudes.</p>';
    }
}

// Event Listeners para el Modal
if (btnNuevaSolicitud) {
    btnNuevaSolicitud.addEventListener('click', () => {
        poblarUbicaciones(); // Ensure options are populated when opening
        modalSolicitud.classList.remove('oculto');
    });
}

if (cerrarModal) {
    cerrarModal.addEventListener('click', () => {
        modalSolicitud.classList.add('oculto');
    });
}

if (modalSolicitud) {
    modalSolicitud.addEventListener('click', (e) => {
        if (e.target === modalSolicitud) {
            modalSolicitud.classList.add('oculto');
        }
    });
}

// Manejo del formulario
if (formSolicitud) {
    formSolicitud.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombreProyecto = document.getElementById('nombreProyecto').value.trim();
        const descripcion = document.getElementById('descripcionProyecto').value.trim();
        const montoSolicitado = document.getElementById('montoSolicitado').value.trim();
        const ubicacion = document.getElementById('ubicacionProyecto').value.trim();

        // Validación estricta: No permitir campos vacíos
        if (!nombreProyecto || !descripcion || !montoSolicitado || !ubicacion) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos Vacíos',
                text: 'Todos los campos son obligatorios. Por favor, complete la información y no deje espacios en blanco.',
                confirmButtonColor: '#3e206f'
            });
            return;
        }

        // Validación de longitud de descripción 
        if (descripcion.replace(/\s/g, '').length < 40) {  //maximo de caracteres
            Swal.fire({
                icon: 'warning',
                title: 'Descripción muy corta',
                text: 'Por favor describa el proyecto con más detalle. (Mínimo 40 caracteres)',
                confirmButtonColor: '#3e206f'
            });
            return;
        }

        // Crear objeto solicitud según estructura especificada
        const nuevaSolicitud = {
            nombre_proyecto: nombreProyecto,
            descripcion: descripcion,
            monto_solicitado: Number(montoSolicitado),
            ubicacion: ubicacion,
            monto_aprobado: null,
            estado: "pendiente",
            entidad_financiera: null,
            fecha_creacion: new Date().toLocaleDateString('es-CR'),
            fecha_aprobación: null
        };

        try {
            await postSolicitudesFinanciamiento(nuevaSolicitud);

            Swal.fire({
                icon: 'success',
                title: 'Solicitud Enviada',
                text: 'Su solicitud ha sido registrada correctamente.',
                confirmButtonColor: '#3e206f'
            });

            modalSolicitud.classList.add('oculto');
            formSolicitud.reset();
            cargarSolicitudes(); // Recargar la lista

        } catch (error) {
            console.error('Error al enviar solicitud:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al enviar la solicitud. Intente nuevamente.',
                confirmButtonColor: '#3e206f'
            });
        }
    });
}

// -------------------------------------------------------------------------
// FUNCIONES NAVBAR (Idénticas a home.js)
// -------------------------------------------------------------------------

function configurarBotonIngresar() {
    const boton = document.querySelector(".botonIngresar");
    const usuarioActivo = localStorage.getItem('usuarioActivo');

    if (boton) {
        if (usuarioActivo) {
            // Estado: Logueado -> Convertir en botón de Cerrar Sesión
            boton.textContent = "Cerrar Sesión";
            boton.style.borderColor = "#dc3545";
            boton.style.color = "#dc3545";
            boton.style.fontWeight = "bold";

            // Hover
            boton.addEventListener('mouseenter', () => {
                boton.style.backgroundColor = "#dc3545";
                boton.style.color = "white";
            });

            boton.addEventListener('mouseleave', () => {
                boton.style.backgroundColor = "transparent";
                boton.style.color = "#dc3545";
            });

            // CLICK CERRAR SESIÓN CON SWEETALERT
            boton.addEventListener("click", (e) => {
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
                        // eliminar usuario
                        localStorage.removeItem("usuarioActivo");

                        // mensaje de éxito
                        Swal.fire({
                            title: 'Sesión cerrada',
                            text: 'Has cerrado sesión correctamente',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            // redirigir
                            window.location.href = "../pages/login.html";
                        });
                    }
                });
            });

        } else {
            // Estado: No Logueado
            boton.addEventListener("click", () => {
                window.location.href = "../pages/login.html";
            });
        }
    }
}

function configurarMenuAdmin() {
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (usuarioActivo && usuarioActivo.rol === 'admin') {
        const listaMenu = document.querySelector('.listaMenu');
        if (listaMenu) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="../pages/dashboardAdmin.html" style="color: #28a745; font-weight: bold;">Admin <i class="fas fa-user-shield"></i></a>';
            // Insertar al principio para coincidir con Home/Requirements
            listaMenu.insertBefore(li, listaMenu.firstChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarSolicitudes();
    poblarUbicaciones();
    configurarBotonIngresar();
    configurarMenuAdmin();
});
