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

document.addEventListener("DOMContentLoaded", () => {
    cargarReportes();
    configurarBotonIngresar();
});

// Carga de reportes (get)
async function cargarReportes() {
    try {
        const response = await fetch(`${API_URL}/reportes`);
        const reportes = await response.json();

        const contenedor = document.getElementById("contenedorReportes");
        contenedor.innerHTML = "<h2>Reportes Recientes</h2>";

        reportes.slice(-5).reverse().forEach(reporte => {
            contenedor.innerHTML += `
                <div class="cardReporte">
                    <h3>${reporte.tipo}</h3>
                    <p>${reporte.descripcion}</p>
                    <p><strong>Ubicación:</strong> ${reporte.ubicacion}</p>
                    <p><strong>Estado:</strong> ${reporte.estado}</p>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error al cargar reportes:", error);
    }
}

//Botón para el ingreso a login
function configurarBotonIngresar() {
    const boton = document.querySelector(".botonIngresar");

    boton.addEventListener("click", () => {
        window.location.href = "../pages/login.html";
    });
}

