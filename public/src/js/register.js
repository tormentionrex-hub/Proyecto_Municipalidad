const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formRegister");
    form.addEventListener("submit", registrarUsuario);
});

//Registro de usuario
async function registrarUsuario(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    const mensajeError = document.getElementById("mensajeError");
    const mensajeExito = document.getElementById("mensajeExito");

    mensajeError.textContent = "";
    mensajeExito.textContent = "";

    //Validaciones

    if (!nombre || !correo || !password || !telefono) {
        mensajeError.textContent = "Todos los campos son obligatorios.";
        return;
    }

    if (!validarCorreo(correo)) {
        mensajeError.textContent = "Ingrese un correo válido.";
        return;
    }

    if (password.length < 4) {
        mensajeError.textContent = "La contraseña debe tener al menos 4 caracteres.";
        return;
    }

    if (!/^[0-9]{8}$/.test(telefono)) {
        mensajeError.textContent = "El teléfono debe tener 8 dígitos.";
        return;
    }

    try {
//Verificación de correo existente
        const verificar = await fetch(`${API_URL}/usuarios?correo=${correo}`);
        const usuariosExistentes = await verificar.json();

        if (usuariosExistentes.length > 0) {
            mensajeError.textContent = "Este correo ya está registrado.";
            return;
        }

     //Crear usuario (post)
        const nuevoUsuario = {
            nombre,
            correo,
            password,
            telefono,
            rol: "ciudadano"
        };

        await fetch(`${API_URL}/usuarios`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoUsuario)
        });

        mensajeExito.textContent = "Usuario registrado correctamente. Redirigiendo...";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);

    } catch (error) {
        console.error("Error al registrar:", error);
        mensajeError.textContent = "Error al conectar con el servidor.";
    }
}

//Validación correo
function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}
