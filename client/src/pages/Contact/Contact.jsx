import { useState } from "react";
import { createContactMessage } from "../../services/contact.service";
import styles from "./Contact.module.css";

const INITIAL_FORM = {
  name: "",
  city: "",
  email: "",
  message: "",
};

const INITIAL_FIELD_ERRORS = {
  name: "",
  city: "",
  email: "",
  message: "",
};

function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState(INITIAL_FIELD_ERRORS);

  function handleChange(event) {
    const { name, value } = event.target;

    setSubmitted(false);
    setErrorMessage("");

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitted(false);
      setErrorMessage("");
      setFieldErrors(INITIAL_FIELD_ERRORS);

      await createContactMessage(form);

      setSubmitted(true);
      setForm(INITIAL_FORM);
    } catch (error) {
      if (error.errors) {
        setFieldErrors({
          name: error.errors.name?.[0] || "",
          city: error.errors.city?.[0] || "",
          email: error.errors.email?.[0] || "",
          message: error.errors.message?.[0] || "",
        });
      }

      setErrorMessage(
        error.message || "Ha ocurrido un error al enviar el mensaje",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>Contacto</span>

            <h1 className={styles.title}>Estamos aquí para ayudarte</h1>

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

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                </button>

                {submitted ? (
                  <p className={styles.successMessage}>
                    Tu mensaje se ha enviado correctamente.
                  </p>
                ) : null}

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

export default Contact;
