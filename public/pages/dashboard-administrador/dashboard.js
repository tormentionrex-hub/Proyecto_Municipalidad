console.log('Dashboard cargado');

// Ejemplo de funcionalidad
document.querySelector('.sidebar a[href="#"]').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Click en link del dashboard');
});
