const API_URL = "http://localhost:3001";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formRegister");
    const fotoInput = document.getElementById("foto");

    form.addEventListener("submit", registrarUsuario);
    fotoInput.addEventListener("change", mostrarVistaPrevia);
});

function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function mostrarVistaPrevia() {
    const fotoInput = document.getElementById("foto");
    const imgPreview = document.getElementById("imgPreview");
    const previewPlaceholder = document.getElementById("previewPlaceholder");

    if (fotoInput.files && fotoInput.files[0]) {
        const file = fotoInput.files[0];

        // Validar tamaño: 70KB (como en registrarUsuario)
        if (file.size > 70000) {
            Swal.fire({
                icon: 'error',
                title: 'Imagen demasiado pesada',
                text: 'La imagen debe pesar menos de 70KB.',
                confirmButtonColor: '#3e206f'
            });
            fotoInput.value = ""; // Limpiar input
            imgPreview.style.display = "none";
            previewPlaceholder.style.display = "block";
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            imgPreview.src = e.target.result;
            imgPreview.style.display = "block";
            previewPlaceholder.style.display = "none";
        };
        reader.readAsDataURL(file);
    } else {
        imgPreview.style.display = "none";
        previewPlaceholder.style.display = "block";
    }
}

//Registro de usuario
async function registrarUsuario(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contraseña = document.getElementById("password").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const fotoInput = document.getElementById("foto");

    const mensajeError = document.getElementById("mensajeError");
    const mensajeExito = document.getElementById("mensajeExito");

    mensajeError.textContent = "";
    mensajeExito.textContent = "";

    let foto = '';
    if (fotoInput.files.length > 0) {
        const file = fotoInput.files[0];
        // Validar tamaño: 70KB
        if (file.size > 70000) {
            Swal.fire({
                icon: 'error',
                title: 'Imagen demasiado pesada',
                text: 'La imagen debe pesar menos de 70KB.',
                confirmButtonColor: '#3e206f'
            });
            return;
        }
        foto = await convertirImagenABase64(file);
    }
    //Validaciones

    if (!nombre || !correo || !contraseña || !telefono) {
        mensajeError.textContent = "Todos los campos son obligatorios.";
        return;
    }

    if (!validarCorreo(correo)) {
        mensajeError.textContent = "Ingrese un correo válido.";
        return;
    }

    if (contraseña.length < 4) {
        mensajeError.textContent = "La contraseña debe tener al menos 4 caracteres.";
        return;
    }

    if (!/^[0-9]{8}$/.test(telefono)) {
        mensajeError.textContent = "El teléfono debe tener 8 dígitos.";
        return;
    }

    try {

        //Crear usuario (post)
        const nuevoUsuario = {
            nombre,
            correo,
            contraseña,
            telefono,
            rol: "ciudadano",
            foto
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
