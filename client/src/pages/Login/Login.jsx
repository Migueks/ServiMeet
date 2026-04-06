import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import buildFieldErrors from "../../utils/buildFieldErrors";
import styles from "./Login.module.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoadingAuth } = useAuth();

  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (isAuthenticated) {
      const redirectTo = location.state?.from
        ? `${location.state.from.pathname || ""}${location.state.from.search || ""}${location.state.from.hash || ""}`
        : "/dashboard";

      navigate(redirectTo || "/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, location.state, navigate]);

  useEffect(() => {
    if (!location.state?.successMessage && !location.state?.registeredEmail) {
      return;
    }

    window.history.replaceState({}, document.title);
  }, [location.state]);

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

  async function handleSubmit(event) {
    event.preventDefault();

    const clientErrors = validateForm();

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      setSubmitError("");

      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const redirectTo = location.state?.from
        ? `${location.state.from.pathname || ""}${location.state.from.search || ""}${location.state.from.hash || ""}`
        : "/dashboard";

      navigate(redirectTo || "/dashboard", { replace: true });
    } catch (error) {
      setFieldErrors(buildFieldErrors(error));
      setSubmitError(error.message || "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.loginPage}>
      <div className="container">
        <Link to="/" className={styles.backLink}>
          ← Volver al inicio
        </Link>

        <div className={styles.wrapper}>
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

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Iniciar sesión</h2>
              <p>Introduce tus credenciales para continuar.</p>
            </div>

            {successMessage ? (
              <p className={styles.successBox}>{successMessage}</p>
            ) : null}

            {submitError ? (
              <p className={styles.errorBox}>{submitError}</p>
            ) : null}

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

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || isLoadingAuth}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className={styles.footerText}>
              ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Login;
