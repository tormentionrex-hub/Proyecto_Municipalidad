/* global Swal */
import { getUsuarios, patchUsuarios, deleteUsuarios } from '../services/services.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar Sesión
    const usuarioSesion = localStorage.getItem('usuarioActivo');
    if (!usuarioSesion) {
        window.location.href = '../pages/login.html';
        return;
    }

    const usuarioActivoLocal = JSON.parse(usuarioSesion);
    const idUsuario = usuarioActivoLocal.id;

    // 2. Elementos del DOM
    const inputNombre = document.getElementById('nombre');
    const inputTelefono = document.getElementById('telefono');
    const inputCorreo = document.getElementById('correo');

    const imgPreview = document.querySelector('.foto-preview');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnEliminarFoto = document.getElementById('btn-eliminar-foto');
    const inputFoto = document.getElementById('input-foto');

    // Inputs de Contraseña
    const inputPassAnterior = document.getElementById('pass-anterior');
    const inputPassNueva = document.getElementById('pass-nueva');
    const inputPassConfirmar = document.getElementById('pass-confirmar');

    let usuarioData = null;
    let nuevaFotoBase64 = null;
    const defaultPhoto = "https://cdn-icons-png.flaticon.com/512/1144/1144760.png";

    // 3. Cargar datos frescos del servidor
    async function cargarDatosUsuario() {
        try {
            const usuarios = await getUsuarios();
            const usuario = usuarios.find(u => u.id === idUsuario);

            if (usuario) {
                usuarioData = usuario;
                llenarFormulario(usuario);
            } else {
                Swal.fire('Error', 'Usuario no encontrado en la base de datos', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error al conectar con el servidor', 'error');
        }
    }

    function llenarFormulario(usuario) {
        inputNombre.value = usuario.nombre || '';
        inputTelefono.value = usuario.telefono || '';
        inputCorreo.value = usuario.correo || '';

        // Cargar foto si existe
        if (usuario.foto && usuario.foto.trim() !== '') {
            imgPreview.src = usuario.foto;
        } else {
            imgPreview.src = defaultPhoto;
        }

        // Mostrar boton eliminar si NO es la default
        if (btnEliminarFoto) {
            if (usuario.foto && usuario.foto !== defaultPhoto && usuario.foto.trim() !== '') {
                btnEliminarFoto.style.display = 'block';
            } else {
                btnEliminarFoto.style.display = 'none';
            }
        }
    }

    // 4. Manejo de cambio de foto (Input File)
    if (inputFoto) {
        inputFoto.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Límite de seguridad para evitar colgar el navegador (5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    title: 'Archivo demasiado grande',
                    text: 'Por favor seleccione una imagen menor a 5MB para procesar.',
                    icon: 'error'
                });
                inputFoto.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 300;
                    const MAX_HEIGHT = 300;

                    // Calcular nuevas dimensiones manteniendo el aspecto
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Comprimir a JPEG calidad 0.7 (reduce drásticamente el peso)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                    imgPreview.src = dataUrl;
                    nuevaFotoBase64 = dataUrl;

                    if (btnEliminarFoto) btnEliminarFoto.style.display = 'block';
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // 5. Manejo de Eliminar Foto
    if (btnEliminarFoto) {
        btnEliminarFoto.addEventListener('click', async () => {
            Swal.fire({
                title: '¿Eliminar foto de perfil?',
                text: "Su foto volverá a la imagen predeterminada.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        // Actualizar en servidor
                        await patchUsuarios({ foto: defaultPhoto }, idUsuario);

                        // Actualizar LocalStorage
                        const sesionActualizada = { ...usuarioActivoLocal, foto: defaultPhoto };
                        localStorage.setItem('usuarioActivo', JSON.stringify(sesionActualizada));

                        // Actualizar UI
                        imgPreview.src = defaultPhoto;
                        btnEliminarFoto.style.display = 'none';
                        nuevaFotoBase64 = null; // Limpiar buffer de subida
                        inputFoto.value = ''; // Limpiar input file

                        // Actualizar data local
                        if (usuarioData) usuarioData.foto = defaultPhoto;

                        Swal.fire({
                            title: 'Foto eliminada',
                            text: 'La foto de perfil se ha restablecido.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });

                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error', 'No se pudo eliminar la foto', 'error');
                    }
                }
            });
        });
    }

    // 6. Guardar cambios (Formulario General)
    if (btnGuardar) {
        btnGuardar.addEventListener('click', async () => {
            if (!usuarioData) return;

            // Uso de trim() para asegurar que no sean solo espacios
            const nombre = inputNombre.value.trim();
            const telefono = inputTelefono.value.trim();
            const correo = inputCorreo.value.trim();

            // Validaciones Estrictas: Ni vacíos ni solo espacios
            if (!nombre) {
                Swal.fire('Atención', 'El campo Nombre es obligatorio y no puede quedar vacío.', 'warning');
                return;
            }
            if (!telefono) {
                Swal.fire('Atención', 'El campo Teléfono es obligatorio y no puede quedar vacío.', 'warning');
                return;
            }
            // Validación estricta de teléfono (8 dígitos)
            if (!/^[0-9]{8}$/.test(telefono)) {
                Swal.fire('Atención', 'El teléfono debe tener 8 dígitos numéricos.', 'warning');
                return;
            }
            if (!correo) {
                Swal.fire('Atención', 'El campo Correo es obligatorio y no puede quedar vacío.', 'warning');
                return;
            }

            // Lógica de contraseña
            let nuevaContraseña = usuarioData.contraseña;
            const passAnt = inputPassAnterior.value.trim();
            const passNue = inputPassNueva.value.trim();
            const passConf = inputPassConfirmar.value.trim();

            // Si intenta cambiar contraseña
            if (passAnt || passNue || passConf) {
                if (!passAnt) {
                    Swal.fire('Atención', 'Debe ingresar su contraseña anterior para realizar cambios de seguridad.', 'warning');
                    return;
                }
                if (passAnt !== usuarioData.contraseña) {
                    Swal.fire('Error', 'La contraseña anterior es incorrecta.', 'error');
                    return;
                }
                if (!passNue) {
                    Swal.fire('Error', 'Debe ingresar la nueva contraseña.', 'warning');
                    return;
                }
                if (passNue.length < 8) {
                    Swal.fire('Error', 'La nueva contraseña debe tener al menos 8 caracteres.', 'warning');
                    return;
                }
                if (!passConf) {
                    Swal.fire('Error', 'Debe confirmar la nueva contraseña.', 'warning');
                    return;
                }
                if (passNue !== passConf) {
                    Swal.fire('Error', 'Las nuevas contraseñas no coinciden.', 'error');
                    return;
                }
                nuevaContraseña = passNue;
            }

            // Preparar objeto de actualización
            const datosActualizar = {
                nombre: nombre,
                telefono: telefono,
                correo: correo,
                contraseña: nuevaContraseña,
                // Si hay nueva foto subida, usarla. Si no, mantener la actual (que puede ser default si se eliminó antes)
                foto: nuevaFotoBase64 || usuarioData.foto
            };

            try {
                await patchUsuarios(datosActualizar, idUsuario);

                // Actualizar localStorage
                const sesionActualizada = { ...usuarioActivoLocal, ...datosActualizar };
                localStorage.setItem('usuarioActivo', JSON.stringify(sesionActualizada));

                Swal.fire({
                    title: 'Perfil Actualizado',
                    text: 'Tus datos se han guardado correctamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    // Limpiar campos de contraseña
                    inputPassAnterior.value = '';
                    inputPassNueva.value = '';
                    inputPassConfirmar.value = '';
                    cargarDatosUsuario();
                });

            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo actualizar el perfil', 'error');
            }
        });
    }

    // 7. Eliminar Cuenta
    const btnEliminarCuenta = document.getElementById('btn-eliminar-cuenta');
    if (btnEliminarCuenta) {
        btnEliminarCuenta.addEventListener('click', () => {
            Swal.fire({
                title: '¿Estás seguro de que deseas borrar tu cuenta?',
                text: 'Esta acción eliminará tu cuenta definitivamente. Tendrás que volver a registrarte.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, borrar mi cuenta',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await deleteUsuarios(idUsuario);
                        localStorage.removeItem('usuarioActivo');
                        Swal.fire(
                            '¡Cuenta Eliminada!',
                            'Tu cuenta ha sido eliminada correctamente.',
                            'success'
                        ).then(() => {
                            window.location.href = '../pages/login.html';
                        });
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error', 'No se pudo eliminar la cuenta', 'error');
                    }
                }
            })
        });
    }

    // Iniciar carga
    cargarDatosUsuario();
});

// --- Lógica Navbar (Unificada) ---
document.addEventListener("DOMContentLoaded", () => {
    configurarBotonIngresar();
    configurarMenuAdmin();
});

//Botón para el ingreso a login o cierre de sesión
function configurarBotonIngresar() {
    const boton = document.querySelector(".botonIngresar");
    const usuarioActivo = localStorage.getItem('usuarioActivo');

    if (boton) {
        if (usuarioActivo) {
            // Estado: Logueado -> Convertir en botón de Cerrar Sesión
            boton.textContent = "Cerrar Sesión";
            boton.style.borderColor = "#dc3545";
            boton.style.color = "#dc3545";
            boton.style.fontWeight = "bold";

            // Hover
            boton.addEventListener('mouseenter', () => {
                boton.style.backgroundColor = "#dc3545";
                boton.style.color = "white";
            });

            boton.addEventListener('mouseleave', () => {
                boton.style.backgroundColor = "transparent";
                boton.style.color = "#dc3545";
            });

            // CLICK CERRAR SESIÓN CON SWEETALERT
            boton.addEventListener("click", (e) => {
                e.preventDefault();

                Swal.fire({
                    title: '¿Cerrar sesión?',
                    text: 'Tu sesión actual se cerrará',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sí, cerrar sesión',
                    cancelButtonText: 'Cancelar',
                    reverseButtons: true
                }).then((result) => {

                    if (result.isConfirmed) {
                        // eliminar usuario
                        localStorage.removeItem("usuarioActivo");

                        // mensaje de éxito
                        Swal.fire({
                            title: 'Sesión cerrada',
                            text: 'Has cerrado sesión correctamente',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            // redirigir
                            window.location.href = "../pages/login.html";
                        });
                    }
                });
            });

        } else {
            // Estado: No Logueado
            boton.addEventListener("click", () => {
                window.location.href = "../pages/login.html";
            });
        }
    }
}

function configurarMenuAdmin() {
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    if (usuarioActivo) {
        const usuario = JSON.parse(usuarioActivo);
        if (usuario.rol === 'admin') {
            const listaMenu = document.querySelector('.listaMenu');
            if (listaMenu) {
                // Verificar si ya existe para no duplicar
                if (!listaMenu.querySelector('.admin-link')) {
                    const li = document.createElement('li');
                    li.className = 'admin-link';
                    li.innerHTML = '<a href="../pages/dashboardAdmin.html" style="color: #28a745; font-weight: bold;">Admin <i class="fas fa-user-shield"></i></a>';
                    listaMenu.insertBefore(li, listaMenu.firstChild);
                }
            }
        }
    }
}
