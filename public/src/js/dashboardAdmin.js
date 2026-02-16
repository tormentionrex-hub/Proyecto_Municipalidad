document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard Admin de la Municipalidad de Escazú cargado');

    // Lógica para el botón de cierre de sesión
    const botonCerrarSesion = document.getElementById('botonCerrarSesion');
    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                // Aquí iría la lógica de limpiar tokens o login state
                window.location.href = './login.html';
            }
        });
    }

    // Cambio de Pestañas (Tabs)
    const botonesPestana = document.querySelectorAll('.botonPestana');
    botonesPestana.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover activo de todos
            botonesPestana.forEach(b => b.classList.remove('activo'));
            // Agregar activo al seleccionado
            btn.classList.add('activo');

            const nombrePestana = btn.getAttribute('data-tab');
            console.log(`Cambiando a la pestaña: ${nombrePestana}`);
            // Aquí se filtraría el contenido dinámicamente
        });
    });

    // Lógica para el selector de periodo
    const selectorPeriodo = document.getElementById('selectorPeriodo');
    if (selectorPeriodo) {
        selectorPeriodo.addEventListener('change', (e) => {
            const dias = e.target.value;
            console.log(`Actualizando datos para los últimos ${dias} días`);
            // Simulación de recarga de datos
            alert(`Actualizando tablero para los últimos ${dias} días...`);
        });
    }
});
