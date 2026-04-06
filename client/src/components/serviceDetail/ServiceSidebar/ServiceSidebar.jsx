import formatPrice from "../../../utils/formatPrice";
import styles from "./ServiceSidebar.module.css";

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
            <strong>Estado:</strong> {service.isActive ? "Activo" : "No disponible"}
          </p>
        </div>
      </div>

      <div className={styles.sideCard}>
        <h3>Contactar</h3>

        {isServiceUnavailable ? (
          <p className={styles.professionalText}>
            Este servicio no está disponible actualmente.
          </p>
        ) : null}

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

        {isAuthenticated && !isServiceUnavailable && user?.role === "PRO" ? (
          <p className={styles.professionalText}>
            Has iniciado sesión como profesional. Solo los clientes pueden enviar solicitudes.
          </p>
        ) : null}

        {isAuthenticated &&
        !isServiceUnavailable &&
        user?.role === "CLIENT" &&
        !canRequest ? (
          <p className={styles.professionalText}>
            No puedes solicitar tu propio servicio.
          </p>
        ) : null}

        {canRequest ? (
          <form className={styles.requestForm} onSubmit={onRequestSubmit}>
            <textarea
              value={requestMessage}
              onChange={(event) => onRequestMessageChange(event.target.value)}
              placeholder="Describe brevemente qué necesitas..."
              className={styles.requestTextarea}
              rows="5"
            />

            {requestError ? <p className={styles.errorText}>{requestError}</p> : null}

            {requestSuccess ? (
              <p className={styles.successText}>{requestSuccess}</p>
            ) : null}

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

export default ServiceSidebar;
