// Importo hooks de React para guardar estado local y ejecutar efectos cuando cambie la autenticación.
import { useEffect, useState } from "react";

// Importo utilidades de React Router para navegar, leer la ubicación actual y enlazar a otras páginas.
import { Link, useLocation, useNavigate } from "react-router-dom";

// Importo el contexto de autenticación para iniciar sesión y saber si el usuario ya está autenticado.
import { useAuth } from "../../context/AuthContext";

// Importo la utilidad que transforma los errores del backend en un objeto más fácil de usar en el formulario.
import buildFieldErrors from "../../utils/buildFieldErrors";

// Importo los estilos del componente.
import styles from "./Login.module.css";

// Página de inicio de sesión.
function Login() {
  // Hook para redirigir al usuario a otra página por código.
  const navigate = useNavigate();

  // Hook para acceder a la ruta actual y a posibles datos enviados desde otra navegación, como mensajes o email precargado.
  const location = useLocation();

  // Obtengo del contexto la función de login y el estado de autenticación.
  const { login, isAuthenticated, isLoadingAuth } = useAuth();

  // Estado del formulario.
  // Si venimos del registro, precargo el email recibido por location.state.
  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || "",
    password: "",
  });

  // Estado para guardar errores por campo.
  const [fieldErrors, setFieldErrors] = useState({});

  // Estado para mostrar un error general al enviar el formulario.
  const [submitError, setSubmitError] = useState("");

  // Estado para mostrar un mensaje de éxito, por ejemplo después de registrarse.
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || "",
  );

  // Estado para desactivar el botón mientras se está enviando el formulario.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si el usuario ya está autenticado, lo redirijo automáticamente.
  // Si venía de una ruta protegida, lo devuelvo allí.
  useEffect(() => {
    if (isLoadingAuth) return;

    if (isAuthenticated) {
      const redirectTo = location.state?.from
        ? `${location.state.from.pathname || ""}${location.state.from.search || ""}${location.state.from.hash || ""}`
        : "/dashboard";

      navigate(redirectTo || "/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, location.state, navigate]);

  // Limpio del historial los mensajes temporales recibidos desde otra página
  // para que no vuelvan a aparecer al recargar o volver atrás.
  useEffect(() => {
    if (!location.state?.successMessage && !location.state?.registeredEmail) {
      return;
    }

    window.history.replaceState({}, document.title);
  }, [location.state]);

  // Actualizo el valor del campo que cambia y limpio sus errores anteriores.
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSubmitError("");
    setSuccessMessage("");
  }

  // Validación básica en cliente antes de enviar el formulario.
  function validateForm() {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Introduce tu correo electrónico.";
    }

    if (!formData.password.trim()) {
      errors.password = "Introduce tu contraseña.";
    }

    return errors;
  }

  // Maneja el envío del formulario de login.
  async function handleSubmit(event) {
    event.preventDefault();

    // Valido primero los datos en cliente.
    const clientErrors = validateForm();

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    try {
      // Activo el estado de envío y limpio errores previos.
      setIsSubmitting(true);
      setFieldErrors({});
      setSubmitError("");

      // Llamo al login del contexto con los datos normalizados.
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Si el login va bien, redirijo al usuario.
      // Si venía de una ruta protegida, lo mando allí.
      const redirectTo = location.state?.from
        ? `${location.state.from.pathname || ""}${location.state.from.search || ""}${location.state.from.hash || ""}`
        : "/dashboard";

      navigate(redirectTo || "/dashboard", { replace: true });
    } catch (error) {
      // Si el backend devuelve errores de campos, los adapto al formulario.
      setFieldErrors(buildFieldErrors(error));

      // También muestro un mensaje general de error.
      setSubmitError(error.message || "No se pudo iniciar sesión.");
    } finally {
      // Desactivo el estado de envío al terminar.
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.loginPage}>
      <div className="container">
        {/* Enlace para volver a la página de inicio */}
        <Link to="/" className={styles.backLink}>
          ← Volver al inicio
        </Link>

        <div className={styles.wrapper}>
          {/* Columna informativa lateral */}
          <section className={styles.info}>
            <span className={styles.badge}>Acceso</span>
            <h1 className={styles.title}>Bienvenido de nuevo a ServiMeet</h1>
            <p className={styles.text}>
              Inicia sesión para gestionar tus servicios, solicitudes y
              valoraciones desde un solo lugar.
            </p>

            <ul className={styles.features}>
              <li>Accede a tu panel personal</li>
              <li>Gestiona solicitudes en tiempo real</li>
              <li>Consulta tus reseñas y servicios</li>
            </ul>
          </section>

          {/* Tarjeta principal con el formulario de login */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Iniciar sesión</h2>
              <p>Introduce tus credenciales para continuar.</p>
            </div>

            {/* Mensaje de éxito, por ejemplo tras un registro correcto */}
            {successMessage ? (
              <p className={styles.successBox}>{successMessage}</p>
            ) : null}

            {/* Mensaje de error general del formulario */}
            {submitError ? (
              <p className={styles.errorBox}>{submitError}</p>
            ) : null}

            {/* Formulario de inicio de sesión */}
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tuemail@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={fieldErrors.email ? styles.inputError : ""}
                  autoComplete="email"
                />
                {fieldErrors.email ? (
                  <span className={styles.fieldError}>{fieldErrors.email}</span>
                ) : null}
              </div>

              <div className={styles.field}>
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Introduce tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className={fieldErrors.password ? styles.inputError : ""}
                  autoComplete="current-password"
                />
                {fieldErrors.password ? (
                  <span className={styles.fieldError}>
                    {fieldErrors.password}
                  </span>
                ) : null}
              </div>

              {/* Botón de envío del formulario */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || isLoadingAuth}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </button>
            </form>

            {/* Enlace a la página de registro */}
            <p className={styles.footerText}>
              ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

// Exporto la página para usarla en el router.
export default Login;
