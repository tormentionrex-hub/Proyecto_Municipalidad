document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard Admin de la Municipalidad de Escazú cargado');

    // Lógica para el botón de cierre de sesión
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                // Aquí iría la lógica de limpiar tokens o login state
                window.location.href = './login.html';
            }
        });
    }

    // Cambio de Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover activo de todos
            tabButtons.forEach(b => b.classList.remove('active'));
            // Agregar activo al seleccionado
            btn.classList.add('active');

            const tabName = btn.getAttribute('data-tab');
            console.log(`Cambiando a la pestaña: ${tabName}`);
            // Aquí se filtraría el contenido dinámicamente
        });
    });

    // Lógica para el selector de periodo
    const periodoSelect = document.getElementById('periodoSelect');
    if (periodoSelect) {
        periodoSelect.addEventListener('change', (e) => {
            const dias = e.target.value;
            console.log(`Actualizando datos para los últimos ${dias} días`);
            // Simulación de recarga de datos
            alert(`Actualizando tablero para los últimos ${dias} días...`);
        });
    }
});
