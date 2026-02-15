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
