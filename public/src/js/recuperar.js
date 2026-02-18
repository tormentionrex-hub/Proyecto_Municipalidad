// Configuración de EmailJS
const EMAILJS_PUBLIC_KEY = "qUlvQrT1jvUYVC0jD"; 
const EMAILJS_SERVICE_ID = "service_5p3x2vj"; 
const EMAILJS_TEMPLATE_ID = "template_vo1l64o"; 

// Inicializar EmailJS
(function () {
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
            // Se añaden múltiples variantes para el destinatario y el link de recuperación
            const recoveryLink = `${window.location.origin}/pages/reset-password.html?token=${btoa(email)}`;

            const templateParams = {
                user_email: email,
                to_email: email,
                email: email,
                link: recoveryLink, // El parámetro que espera tu plataforma
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
