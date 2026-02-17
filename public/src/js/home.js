// Menu desplegable

import { getReportes } from "../services/services.js";

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

const API_URL = "http://localhost:3001";

document.addEventListener("DOMContentLoaded", () => {
    cargarReportes();
    configurarBotonIngresar();
    configurarMenuAdmin();
    // configurarFormularioReporte();
});

async function cargarReportes() {
    const contenedor = document.getElementById('contenedorReportes');
    if (!contenedor) return;
    // Si quisieras mostrar los reportes públicos aquí
    // const reportes = await getReportes();
    // ... lógica de renderizado ...
}

//Botón para el ingreso a login o cierre de sesión
function configurarBotonIngresar() {
    const boton = document.querySelector(".botonIngresar");
    const usuarioActivo = localStorage.getItem('usuarioActivo');

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


function configurarMenuAdmin() {
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (usuarioActivo && usuarioActivo.rol === 'admin') {
        const listaMenu = document.querySelector('.listaMenu');
        if (listaMenu) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="../pages/dashboardAdmin.html" style="color: #28a745; font-weight: bold;">Admin <i class="fas fa-user-shield"></i></a>';
            // Insertar al principio o donde prefieras. Aquí lo pongo al principio.
            listaMenu.insertBefore(li, listaMenu.firstChild);
        }
    }
}
 