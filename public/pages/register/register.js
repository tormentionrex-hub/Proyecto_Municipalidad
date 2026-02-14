document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('Intento de registro');
    // Aquí iría la lógica de registro
    const password = document.getElementById('password').value;
    const confirmData = document.getElementById('confirmData').value;

    if (password !== confirmData) {
        alert('Las contraseñas no coinciden');
        return;
    }

    alert('Registro pendiente de implementación');
});
