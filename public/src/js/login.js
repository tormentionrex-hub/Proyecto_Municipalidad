const API_URL = "http://localhost:3001";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formLogin");
    form.addEventListener("submit", iniciarSesion);
});

//Función de login
async function iniciarSesion(e) {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("contraseña").value.trim();
    const mensajeError = document.getElementById("mensajeError");

    mensajeError.textContent = "";

    //Validar los campos obligatorios
    if (!correo || !password) {
        mensajeError.textContent = "Todos los campos son obligatorios.";
        return;
    }

    try {
        //Validación de las credenciales (GET)
        const response = await fetch(`${API_URL}/usuarios?correo=${correo}&contraseña=${password}`);
        const usuarios = await response.json();

        if (usuarios.length === 0) {
            mensajeError.textContent = "Correo o contraseña incorrectos.";
            return;
        }

        const usuario = usuarios[0];

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
const password = document.getElementById("password");

togglePassword.addEventListener("click", () => {
    const type = password.type === "password" ? "text" : "password";
    password.type = type;
    togglePassword.classList.toggle("fa-eye-slash");
});
