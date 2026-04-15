// Importo hooks de React para ejecutar efectos, memorizar valores
// y guardar el estado local del formulario y de la página.
import { useEffect, useMemo, useState } from "react";

// Importo utilidades de React Router para enlazar páginas
// y redirigir al usuario por código.
import { Link, useNavigate } from "react-router-dom";

// Importo el contexto de autenticación para registrar usuarios
// y saber si ya hay una sesión iniciada.
import { useAuth } from "../../context/AuthContext";

// Importo el servicio que obtiene la lista de ciudades desde el backend.
import { getCities } from "../../services/meta.service";

// Importo la utilidad que transforma los errores del backend
// en un objeto más fácil de usar en el formulario.
import buildFieldErrors from "../../utils/buildFieldErrors";

// Importo los estilos de la página.
import styles from "./Register.module.css";

// Defino el estado inicial del formulario de registro.
const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  city: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "CLIENT",
};

// Esta función normaliza la respuesta de ciudades
// para asegurar que siempre tenga el mismo formato.
function normalizeCitiesResponse(data) {
  // Si la respuesta ya es un array, lo uso directamente.
  // Si no, intento leer data.cities.
  const rawCities = Array.isArray(data) ? data : data?.cities || [];

  return (
    rawCities
      .map((city) => {
        // Si la ciudad llega como texto simple, la convierto a objeto con id y name.
        if (typeof city === "string") {
          return {
            id: city,
            name: city,
          };
        }

        // Si ya viene como objeto, me aseguro de devolver un formato consistente.
        return {
          id: city.id ?? city.name,
          name: city.name ?? "",
        };
      })
      // Elimino posibles elementos sin nombre válido.
      .filter((city) => city.name)
  );
}

// Página de registro.
function Register() {
  // Hook para redirigir al usuario a otra página por código.
  const navigate = useNavigate();

  // Obtengo del contexto la función de registro
  // y el estado actual de autenticación.
  const { register, isAuthenticated, isLoadingAuth } = useAuth();

  // Estado principal del formulario.
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Estado para guardar errores por campo.
  const [fieldErrors, setFieldErrors] = useState({});

  // Estado para mostrar un error general del formulario.
  const [submitError, setSubmitError] = useState("");

  // Estado para desactivar el botón mientras se envía el formulario.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado con la lista de ciudades disponibles.
  const [cities, setCities] = useState([]);

  // Estado para indicar si la lista de ciudades sigue cargando.
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  // Estado para guardar un posible error al cargar ciudades.
  const [citiesError, setCitiesError] = useState("");

  // Memoizo el texto de ayuda de la contraseña.
  // En este caso no es estrictamente necesario, pero mantiene el valor estable.
  const passwordHint = useMemo(() => {
    return "Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.";
  }, []);

  // Si el usuario ya está autenticado, lo redirijo al dashboard.
  useEffect(() => {
    if (isLoadingAuth) return;

    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  // Cargo las ciudades al montar la página.
  useEffect(() => {
    async function loadCities() {
      try {
        // Activo la carga y limpio errores previos.
        setIsLoadingCities(true);
        setCitiesError("");

        // Pido las ciudades al backend y normalizo la respuesta.
        const data = await getCities();
        const normalizedCities = normalizeCitiesResponse(data);

        // Guardo la lista normalizada en el estado.
        setCities(normalizedCities);
      } catch {
        // Si falla la carga, vacío la lista y muestro error.
        setCities([]);
        setCitiesError("No se pudieron cargar las ciudades.");
      } finally {
        // Desactivo la carga al terminar.
        setIsLoadingCities(false);
      }
    }

    loadCities();
  }, []);

  // Actualiza el campo del formulario que haya cambiado
  // y limpia errores previos de ese mismo campo.
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

  // Valido los datos del formulario antes de enviarlos al backend.
  function validateForm() {
    const errors = {};
    const trimmedEmail = formData.email.trim();

    // Expresión regular para validar emails.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Expresión regular para exigir una contraseña segura.
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

  // Maneja el envío del formulario de registro.
  async function handleSubmit(event) {
    event.preventDefault();

    // Primero valido los datos en cliente.
    const clientErrors = validateForm();

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    // Uno nombre y apellidos en un único campo "name"
    // para adaptarlo al formato que espera el backend.
    const fullName = `${formData.firstName} ${formData.lastName}`
      .replace(/\s+/g, " ")
      .trim();

    // Construyo el payload final que se enviará al backend.
    const payload = {
      name: fullName,
      city: formData.city.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
    };

    try {
      // Activo el estado de envío y limpio errores previos.
      setIsSubmitting(true);
      setFieldErrors({});
      setSubmitError("");

      // Envío los datos al backend usando la función register del contexto.
      await register(payload);

      // Si el registro va bien, redirijo al login
      // y paso datos útiles en location.state.
      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: payload.email,
          successMessage:
            "Cuenta creada correctamente. Ya puedes iniciar sesión.",
        },
      });
    } catch (error) {
      // Si el backend devuelve errores por campo, los adapto al formulario.
      const serverFieldErrors = buildFieldErrors(error);

      if (Object.keys(serverFieldErrors).length > 0) {
        // Si el backend devuelve error sobre "name",
        // lo reparto entre nombre y apellidos para la interfaz.
        if (serverFieldErrors.name) {
          serverFieldErrors.firstName = serverFieldErrors.name;
          serverFieldErrors.lastName = serverFieldErrors.name;
          delete serverFieldErrors.name;
        }

        setFieldErrors(serverFieldErrors);
      }

      // Muestro también el error general.
      setSubmitError(error.message || "No se pudo completar el registro.");
    } finally {
      // Desactivo el estado de envío al terminar.
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.registerPage}>
      <div className="container">
        {/* Enlace para volver a la página de inicio */}
        <Link to="/" className={styles.backLink}>
          ← Volver al inicio
        </Link>

        <div className={styles.wrapper}>
          {/* Columna informativa lateral */}
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

          {/* Tarjeta principal con el formulario de registro */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Crear cuenta</h2>
              <p>Completa tus datos para comenzar.</p>
            </div>

            {/* Error general del formulario */}
            {submitError ? (
              <p className={styles.errorBox}>{submitError}</p>
            ) : null}

            {/* Error al cargar ciudades */}
            {citiesError ? (
              <p className={styles.errorBox}>{citiesError}</p>
            ) : null}

            {/* Formulario de registro */}
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

              {/* Texto de ayuda para orientar sobre la contraseña */}
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

              {/* Botón de envío del formulario */}
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

            {/* Enlace a la página de login */}
            <p className={styles.footerText}>
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

// Exporto la página para usarla en el router.
export default Register;
