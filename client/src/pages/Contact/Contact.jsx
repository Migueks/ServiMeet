// Importo useState para gestionar el estado del formulario
// y los mensajes de éxito o error.
import { useState } from "react";

// Importo el servicio que envía el mensaje de contacto al backend.
import { createContactMessage } from "../../services/contact.service";

// Importo los estilos del componente.
import styles from "./Contact.module.css";

// Estado inicial del formulario de contacto.
const INITIAL_FORM = {
  name: "",
  city: "",
  email: "",
  message: "",
};

// Estado inicial de los errores por campo.
const INITIAL_FIELD_ERRORS = {
  name: "",
  city: "",
  email: "",
  message: "",
};

// Página de contacto.
function Contact() {
  // Estado con los datos del formulario.
  const [form, setForm] = useState(INITIAL_FORM);

  // Indica si el formulario se ha enviado correctamente.
  const [submitted, setSubmitted] = useState(false);

  // Indica si el formulario se está enviando en este momento.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guarda un posible error general al enviar el formulario.
  const [errorMessage, setErrorMessage] = useState("");

  // Guarda errores concretos de cada campo del formulario.
  const [fieldErrors, setFieldErrors] = useState(INITIAL_FIELD_ERRORS);

  // Maneja los cambios en los campos del formulario.
  function handleChange(event) {
    const { name, value } = event.target;

    // Si el usuario vuelve a escribir, limpio el estado de éxito y error general.
    setSubmitted(false);
    setErrorMessage("");

    // Limpio el error del campo que se está editando.
    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Actualizo el valor del campo correspondiente.
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Maneja el envío del formulario.
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      // Activo el estado de envío y limpio mensajes previos.
      setIsSubmitting(true);
      setSubmitted(false);
      setErrorMessage("");
      setFieldErrors(INITIAL_FIELD_ERRORS);

      // Envío el formulario al backend.
      await createContactMessage(form);

      // Si todo va bien, marco el envío como correcto
      // y reinicio el formulario.
      setSubmitted(true);
      setForm(INITIAL_FORM);
    } catch (error) {
      // Si el backend devuelve errores por campo, los asigno al formulario.
      if (error.errors) {
        setFieldErrors({
          name: error.errors.name?.[0] || "",
          city: error.errors.city?.[0] || "",
          email: error.errors.email?.[0] || "",
          message: error.errors.message?.[0] || "",
        });
      }

      // Guardo el mensaje de error general.
      setErrorMessage(
        error.message || "Ha ocurrido un error al enviar el mensaje",
      );
    } finally {
      // Desactivo el estado de envío al terminar.
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            {/* Pequeña etiqueta superior de la página */}
            <span className={styles.eyebrow}>Contacto</span>

            {/* Título principal */}
            <h1 className={styles.title}>Estamos aquí para ayudarte</h1>

            {/* Texto descriptivo de apoyo */}
            <p className={styles.subtitle}>
              Si tienes dudas sobre la plataforma, quieres publicar tus
              servicios o necesitas ayuda con una solicitud, puedes escribirnos
              desde este formulario.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className="container">
          <div className={styles.grid}>
            <article className={styles.infoCard}>
              {/* Bloque informativo con datos de contacto */}
              <h2>Información de contacto</h2>
              <p>
                Atendemos consultas generales sobre ServiMeet, soporte básico
                para usuarios y dudas de profesionales interesados en publicar
                sus servicios.
              </p>

              <div className={styles.infoList}>
                <div>
                  <span>Email</span>
                  <p>contacto@servimeet.com</p>
                </div>

                <div>
                  <span>Ubicación</span>
                  <p>Málaga, España</p>
                </div>

                <div>
                  <span>Horario</span>
                  <p>Lunes a viernes · 09:00 a 18:00</p>
                </div>
              </div>

              <div className={styles.mapWrapper}>
                {/* Mapa embebido con la ubicación de referencia */}
                <iframe
                  title="Mapa de Málaga"
                  src="https://www.google.com/maps?q=M%C3%A1laga,+Espa%C3%B1a&z=12&output=embed"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </article>

            <article className={styles.formCard}>
              {/* Bloque con el formulario de contacto */}
              <h2>Envíanos un mensaje</h2>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <label className={styles.field} htmlFor="name">
                  <span>Nombre</span>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    autoComplete="name"
                    required
                    disabled={isSubmitting}
                  />
                  {fieldErrors.name ? (
                    <small className={styles.fieldError}>
                      {fieldErrors.name}
                    </small>
                  ) : null}
                </label>

                <label className={styles.field} htmlFor="city">
                  <span>Ciudad</span>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Tu ciudad"
                    autoComplete="address-level2"
                    required
                    disabled={isSubmitting}
                  />
                  {fieldErrors.city ? (
                    <small className={styles.fieldError}>
                      {fieldErrors.city}
                    </small>
                  ) : null}
                </label>

                <label className={styles.field} htmlFor="email">
                  <span>Email</span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tuemail@ejemplo.com"
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                  />
                  {fieldErrors.email ? (
                    <small className={styles.fieldError}>
                      {fieldErrors.email}
                    </small>
                  ) : null}
                </label>

                <label className={styles.field} htmlFor="message">
                  <span>Mensaje</span>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Cuéntanos en qué podemos ayudarte"
                    rows="6"
                    required
                    disabled={isSubmitting}
                  />
                  {fieldErrors.message ? (
                    <small className={styles.fieldError}>
                      {fieldErrors.message}
                    </small>
                  ) : null}
                </label>

                {/* Botón de envío del formulario */}
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                </button>

                {/* Mensaje de éxito tras el envío */}
                {submitted ? (
                  <p className={styles.successMessage}>
                    Tu mensaje se ha enviado correctamente.
                  </p>
                ) : null}

                {/* Mensaje de error general */}
                {errorMessage ? (
                  <p className={styles.errorMessage}>{errorMessage}</p>
                ) : null}
              </form>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

// Exporto la página para usarla en el router.
export default Contact;
