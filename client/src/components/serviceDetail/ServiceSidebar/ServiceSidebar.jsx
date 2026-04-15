// Importo la utilidad para formatear el precio del servicio.
import formatPrice from "../../../utils/formatPrice";

// Importo los estilos del componente.
import styles from "./ServiceSidebar.module.css";

// Componente lateral que muestra el resumen del servicio
// y el bloque para contactar con el profesional.
function ServiceSidebar({
  service,
  cityName,
  professionalName,
  isAuthenticated,
  canRequest,
  isServiceUnavailable,
  user,
  requestMessage,
  requestError,
  requestSuccess,
  isSendingRequest,
  onRequestMessageChange,
  onRequestSubmit,
  onLoginRedirect,
}) {
  return (
    <aside className={styles.sidebar}>
      {/* Tarjeta con información rápida del servicio */}
      <div className={styles.sideCard}>
        <p className={styles.sideLabel}>Precio orientativo</p>
        <p className={styles.price}>Desde {formatPrice(service.price)}</p>

        <div className={styles.sideInfo}>
          <p>
            <strong>Profesional:</strong> {professionalName}
          </p>
          <p>
            <strong>Ciudad:</strong> {cityName}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            {service.isActive ? "Activo" : "No disponible"}
          </p>
        </div>
      </div>

      {/* Tarjeta con el bloque de contacto o mensajes informativos */}
      <div className={styles.sideCard}>
        <h3>Contactar</h3>

        {/* Si el servicio no está activo, aviso al usuario */}
        {isServiceUnavailable ? (
          <p className={styles.professionalText}>
            Este servicio no está disponible actualmente.
          </p>
        ) : null}

        {/* Si no hay sesión iniciada, invito al usuario a hacer login */}
        {!isAuthenticated && !isServiceUnavailable ? (
          <>
            <p className={styles.professionalText}>
              Inicia sesión para enviar una solicitud a este profesional.
            </p>
            <button
              type="button"
              className={styles.ctaButton}
              onClick={onLoginRedirect}
            >
              Iniciar sesión
            </button>
          </>
        ) : null}

        {/* Si el usuario autenticado es profesional, informo de que no puede solicitar */}
        {isAuthenticated && !isServiceUnavailable && user?.role === "PRO" ? (
          <p className={styles.professionalText}>
            Has iniciado sesión como profesional. Solo los clientes pueden
            enviar solicitudes.
          </p>
        ) : null}

        {/* Si el usuario es cliente pero no puede solicitar este servicio,
            muestro el motivo correspondiente */}
        {isAuthenticated &&
        !isServiceUnavailable &&
        user?.role === "CLIENT" &&
        !canRequest ? (
          <p className={styles.professionalText}>
            No puedes solicitar tu propio servicio.
          </p>
        ) : null}

        {/* Si el usuario sí puede solicitar, muestro el formulario */}
        {canRequest ? (
          <form className={styles.requestForm} onSubmit={onRequestSubmit}>
            <textarea
              value={requestMessage}
              onChange={(event) => onRequestMessageChange(event.target.value)}
              placeholder="Describe brevemente qué necesitas..."
              className={styles.requestTextarea}
              rows="5"
            />

            {/* Mensaje de error del formulario */}
            {requestError ? (
              <p className={styles.errorText}>{requestError}</p>
            ) : null}

            {/* Mensaje de éxito tras enviar la solicitud */}
            {requestSuccess ? (
              <p className={styles.successText}>{requestSuccess}</p>
            ) : null}

            {/* Botón para enviar la solicitud */}
            <button
              type="submit"
              className={styles.ctaButton}
              disabled={isSendingRequest}
            >
              {isSendingRequest ? "Enviando..." : "Enviar solicitud"}
            </button>
          </form>
        ) : null}
      </div>
    </aside>
  );
}

// Exporto el componente para usarlo dentro del detalle del servicio.
export default ServiceSidebar;
