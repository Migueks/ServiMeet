import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCities } from "../../services/meta.service";
import buildFieldErrors from "../../utils/buildFieldErrors";
import styles from "./Register.module.css";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  city: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "CLIENT",
};

function normalizeCitiesResponse(data) {
  const rawCities = Array.isArray(data) ? data : data?.cities || [];

  return rawCities
    .map((city) => {
      if (typeof city === "string") {
        return {
          id: city,
          name: city,
        };
      }

      return {
        id: city.id ?? city.name,
        name: city.name ?? "",
      };
    })
    .filter((city) => city.name);
}

function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoadingAuth } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [citiesError, setCitiesError] = useState("");

  const passwordHint = useMemo(() => {
    return "Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.";
  }, []);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  useEffect(() => {
    async function loadCities() {
      try {
        setIsLoadingCities(true);
        setCitiesError("");

        const data = await getCities();
        const normalizedCities = normalizeCitiesResponse(data);
        setCities(normalizedCities);
      } catch {
        setCities([]);
        setCitiesError("No se pudieron cargar las ciudades.");
      } finally {
        setIsLoadingCities(false);
      }
    }

    loadCities();
  }, []);

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
  }

  function validateForm() {
    const errors = {};
    const trimmedEmail = formData.email.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!formData.firstName.trim()) {
      errors.firstName = "Introduce tu nombre.";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Introduce tus apellidos.";
    }

    if (!formData.city.trim()) {
      errors.city = "Selecciona tu ciudad.";
    }

    if (!trimmedEmail) {
      errors.email = "Introduce tu correo electrónico.";
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = "Introduce un correo válido.";
    }

    if (!formData.password) {
      errors.password = "Introduce una contraseña.";
    } else if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Debe tener 8 caracteres o más, mayúscula, minúscula, número y símbolo.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Repite la contraseña.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
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

    const fullName = `${formData.firstName} ${formData.lastName}`
      .replace(/\s+/g, " ")
      .trim();

    const payload = {
      name: fullName,
      city: formData.city.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
    };

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      setSubmitError("");

      await register(payload);

      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: payload.email,
          successMessage:
            "Cuenta creada correctamente. Ya puedes iniciar sesión.",
        },
      });
    } catch (error) {
      const serverFieldErrors = buildFieldErrors(error);

      if (Object.keys(serverFieldErrors).length > 0) {
        if (serverFieldErrors.name) {
          serverFieldErrors.firstName = serverFieldErrors.name;
          serverFieldErrors.lastName = serverFieldErrors.name;
          delete serverFieldErrors.name;
        }

        setFieldErrors(serverFieldErrors);
      }

      setSubmitError(error.message || "No se pudo completar el registro.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.registerPage}>
      <div className="container">
        <Link to="/" className={styles.backLink}>
          ← Volver al inicio
        </Link>

        <div className={styles.wrapper}>
          <section className={styles.info}>
            <span className={styles.badge}>Registro</span>
            <h1 className={styles.title}>
              Crea tu cuenta y empieza en ServiMeet
            </h1>
            <p className={styles.text}>
              Regístrate como cliente o profesional y accede a una plataforma
              pensada para conectar servicios de forma sencilla.
            </p>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Crear cuenta</h2>
              <p>Completa tus datos para comenzar.</p>
            </div>

            {submitError ? (
              <p className={styles.errorBox}>{submitError}</p>
            ) : null}

            {citiesError ? (
              <p className={styles.errorBox}>{citiesError}</p>
            ) : null}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="firstName">Nombre</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={fieldErrors.firstName ? styles.inputError : ""}
                    autoComplete="given-name"
                  />
                  {fieldErrors.firstName ? (
                    <span className={styles.fieldError}>
                      {fieldErrors.firstName}
                    </span>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label htmlFor="lastName">Apellidos</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Tus apellidos"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={fieldErrors.lastName ? styles.inputError : ""}
                    autoComplete="family-name"
                  />
                  {fieldErrors.lastName ? (
                    <span className={styles.fieldError}>
                      {fieldErrors.lastName}
                    </span>
                  ) : null}
                </div>

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
                    <span className={styles.fieldError}>
                      {fieldErrors.email}
                    </span>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label htmlFor="city">Ciudad</label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={fieldErrors.city ? styles.inputError : ""}
                    disabled={isLoadingCities || !!citiesError}
                  >
                    <option value="">
                      {isLoadingCities
                        ? "Cargando ciudades..."
                        : "Selecciona una ciudad"}
                    </option>

                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.city ? (
                    <span className={styles.fieldError}>
                      {fieldErrors.city}
                    </span>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label htmlFor="password">Contraseña</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Crea una contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    className={fieldErrors.password ? styles.inputError : ""}
                    autoComplete="new-password"
                  />

                  {fieldErrors.password ? (
                    <span className={styles.fieldError}>
                      {fieldErrors.password}
                    </span>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label htmlFor="confirmPassword">Repite contraseña</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={
                      fieldErrors.confirmPassword ? styles.inputError : ""
                    }
                    autoComplete="new-password"
                  />
                  {fieldErrors.confirmPassword ? (
                    <span className={styles.fieldError}>
                      {fieldErrors.confirmPassword}
                    </span>
                  ) : null}
                </div>
              </div>

              <span className={styles.helperText}>{passwordHint}</span>

              <div className={styles.field}>
                <label htmlFor="role">Rol</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="CLIENT">Cliente</option>
                  <option value="PRO">Profesional</option>
                </select>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={
                  isSubmitting ||
                  isLoadingCities ||
                  !!citiesError ||
                  isLoadingAuth
                }
              >
                {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>

            <p className={styles.footerText}>
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Register;
