const API_URL = "http://localhost:3001";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formRegister");
    const fotoInput = document.getElementById("foto");
    const zonaFotoPerfil = document.getElementById("zonaFotoPerfil");

    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const rolParam = params.get('rol');
    const nombreParam = params.get('nombre');

    if (nombreParam) {
        document.getElementById("nombre").value = nombreParam;
    }

    if (emailParam) {
        document.getElementById("correo").value = emailParam;
        document.getElementById("correo").readOnly = true;
    }

    if (rolParam) {
        document.getElementById("rol").value = rolParam;
    }

    form.addEventListener("submit", registrarUsuario);
    fotoInput.addEventListener("change", mostrarVistaPrevia);

    if (zonaFotoPerfil) {
        zonaFotoPerfil.addEventListener("click", () => {
            fotoInput.click();
        });
    }
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
        if (file.size > 70000) {
            Swal.fire({
                icon: 'error',
                title: 'Imagen demasiado pesada',
                text: 'La imagen debe pesar menos de 70KB.',
                confirmButtonColor: '#3e206f'
            });
            fotoInput.value = "";
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

async function registrarUsuario(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contraseña = document.getElementById("password").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const rolInput = document.getElementById("rol").value;
    const rol = rolInput ? rolInput : "ciudadano";
    const fotoInput = document.getElementById("foto");

    // 1. Validaciones Locales con SweetAlert
    if (!nombre || !correo || !contraseña || !telefono) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos Incompletos',
            text: 'Todos los campos son obligatorios.',
            confirmButtonColor: '#3e206f'
        });
        return;
    }

    if (!validarCorreo(correo)) {
        Swal.fire({
            icon: 'warning',
            title: 'Correo Inválido',
            text: 'Ingrese un correo electrónico válido.',
            confirmButtonColor: '#3e206f'
        });
        return;
    }

    if (contraseña.length < 4) {
        Swal.fire({
            icon: 'warning',
            title: 'Contraseña Débil',
            text: 'La contraseña debe tener al menos 4 caracteres.',
            confirmButtonColor: '#3e206f'
        });
        return;
    }

    if (!/^[0-9]{8}$/.test(telefono)) {
        Swal.fire({
            icon: 'warning',
            title: 'Teléfono Inválido',
            text: 'El teléfono debe tener 8 dígitos numéricos.',
            confirmButtonColor: '#3e206f'
        });
        return;
    }

    let foto = '';
    if (fotoInput.files.length > 0) {
        const file = fotoInput.files[0];
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

    try {
        // 2. Validación de Duplicados
        // Correo (aunque venga readonly, validamos por seguridad)
        const checkCorreo = await fetch(`${API_URL}/usuarios?correo=${correo}`);
        const usuariosCorreo = await checkCorreo.json();

        if (usuariosCorreo.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Correo Registrado',
                text: 'El correo electrónico ya se encuentra registrado en el sistema.',
                confirmButtonColor: '#3e206f'
            });
            return;
        }

        // Teléfono
        const checkTel = await fetch(`${API_URL}/usuarios?telefono=${telefono}`);
        const usuariosTel = await checkTel.json();

        if (usuariosTel.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Teléfono Registrado',
                text: 'El número de teléfono ya se encuentra registrado en el sistema.',
                confirmButtonColor: '#3e206f'
            });
            return;
        }

        // 3. Crear Usuario
        const nuevoUsuario = {
            nombre,
            correo,
            contraseña,
            telefono,
            rol: rol,
            foto
        };

        await fetch(`${API_URL}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoUsuario)
        });

        Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: 'Cuenta creada correctamente. Redirigiendo...',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "login.html";
        });

    } catch (error) {
        console.error("Error al registrar:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Servidor',
            text: 'No se pudo conectar con el servidor.',
            confirmButtonColor: '#3e206f'
        });
    }
}

function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}
