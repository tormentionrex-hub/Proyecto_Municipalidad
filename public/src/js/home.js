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

const API_URL = "http://localhost:3000";

import { getReportes } from '../services/services.js';

document.addEventListener("DOMContentLoaded", () => {
    cargarReportes();
    configurarBotonIngresar();
    // configurarFormularioReporte();
});



async function cargarReportes() {
    const contenedor = document.getElementById('contenedorReportes');
    if (!contenedor) return;

    // Si quisieras mostrar los reportes públicos aquí
    // const reportes = await getReportes();
    // ... lógica de renderizado ...
}

//Botón para el ingreso a login
function configurarBotonIngresar() {
    const boton = document.querySelector(".botonIngresar");

    boton.addEventListener("click", () => {
        window.location.href = "../pages/login.html";
    });
}

