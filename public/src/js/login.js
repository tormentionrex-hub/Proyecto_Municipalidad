const API_URL = "http://localhost:3001";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formLogin");
    form.addEventListener("submit", iniciarSesion);
});

//Función de login
async function iniciarSesion(e) {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const passwordInput = document.getElementById("password").value.trim();
    const mensajeError = document.getElementById("mensajeError");

    mensajeError.textContent = "";

    //Validar los campos obligatorios
    if (!correo || !passwordInput) {
        mensajeError.textContent = "Todos los campos son obligatorios.";
        return;
    }

    try {
        //Validación de las credenciales (GET)
        // Nota: El campo en la base de datos se llama "contraseña"
        //Validación de las credenciales (GET)
        // Nota: El campo en la base de datos se llama "contraseña"
        const response = await fetch(`${API_URL}/usuarios?correo=${encodeURIComponent(correo)}`);
        const usuarios = await response.json();

        const usuario = usuarios.find(u => u.contraseña === passwordInput);

        if (!usuario) {
            mensajeError.textContent = "Correo o contraseña incorrectos.";
            return;
        }

        // Guardar sesión en localStorage
        localStorage.setItem("usuarioActivo", JSON.stringify(usuario));

        //Redirección general
        window.location.href = "home.html";

    } catch (error) {
        console.error("Error en el login:", error);
        mensajeError.textContent = "Error al conectar con el servidor.";
    }
}

//Mostrar y ocultar contraseña:
const togglePassword = document.getElementById("togglePassword");
const passwordField = document.getElementById("password");

if (togglePassword && passwordField) {
    togglePassword.addEventListener("click", () => {
        const type = passwordField.type === "password" ? "text" : "password";
        passwordField.type = type;
        togglePassword.classList.toggle("fa-eye-slash");
    });
}
