// Configuración de EmailJS (Placeholder - El usuario debe configurar estos valores)
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY"; // Reemplazar con la llave pública
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID"; // Reemplazar con el ID del servicio
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // Reemplazar con el ID de la plantilla

// Inicializar EmailJS
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init({
          publicKey: EMAILJS_PUBLIC_KEY,
        });
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formRecuperar');
    const feedback = document.getElementById('mensajeFeedback');
    const btn = document.getElementById('btnRecuperar');
    const btnIcon = btn.querySelector('i');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('recovery-email').value;

        // Limpiar mensajes previos
        feedback.textContent = "";
        feedback.className = "mensajeFeedback";

        // Estado de carga
        btn.classList.add('loading');
        btnIcon.className = "fa-solid fa-circle-notch";
        btn.disabled = true;

        try {
            // Enviar correo vía EmailJS
            // Se asocia con los parámetros de la plantilla de EmailJS
            const templateParams = {
                to_email: email,
                message: "Se ha solicitado un restablecimiento de contraseña para tu cuenta en la Municipalidad de Escazú.",
                reply_to: "no-reply@escazu.go.cr"
            };

            const response = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams
            );

            if (response.status === 200) {
                feedback.textContent = "¡Correo enviado con éxito! Revisa tu bandeja de entrada.";
                feedback.classList.add('success');
                form.reset();
            } else {
                throw new Error("Error al enviar el correo");
            }

        } catch (error) {
            console.error("EmailJS Error:", error);
            feedback.textContent = "Hubo un problema al enviar el correo. Inténtalo más tarde.";
            feedback.classList.add('error');
        } finally {
            // Reestablecer botón
            btn.classList.remove('loading');
            btnIcon.className = "fa-solid fa-paper-plane";
            btn.disabled = false;
        }
    });
});
