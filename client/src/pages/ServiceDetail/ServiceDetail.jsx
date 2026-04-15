// Importo hooks de React para ejecutar efectos, memorizar lógica derivada
// y guardar el estado local de la página.
import { useEffect, useMemo, useState } from "react";

// Importo utilidades de React Router para leer parámetros de la URL,
// navegar por código y guardar la ubicación actual.
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

// Importo los componentes que forman la vista de detalle del servicio.
import ServiceDetailHeader from "../../components/serviceDetail/ServiceDetailHeader/ServiceDetailHeader";
import ServiceDescriptionCard from "../../components/serviceDetail/ServiceDescriptionCard/ServiceDescriptionCard";
import ServiceReviewsCard from "../../components/serviceDetail/ServiceReviewsCard/ServiceReviewsCard";
import ServiceSidebar from "../../components/serviceDetail/ServiceSidebar/ServiceSidebar";

// Importo el contexto de autenticación para saber si el usuario
// ha iniciado sesión, su token y sus datos.
import { useAuth } from "../../context/AuthContext";

// Importo los servicios que permiten obtener el detalle del servicio
// y enviar una solicitud al profesional.
import { createRequest } from "../../services/requests.service";
import { getServiceById } from "../../services/services.service";

// Importo los estilos de la página.
import styles from "./ServiceDetail.module.css";

// Componente principal de la página de detalle de un servicio.
function ServiceDetail() {
  // Obtengo el id del servicio desde la URL.
  const { id } = useParams();

  // Hook para navegar a otras rutas desde el código.
  const navigate = useNavigate();

  // Guardo la ruta actual para poder redirigir al login
  // recordando desde dónde venía el usuario.
  const location = useLocation();

  // Obtengo del contexto el estado de autenticación,
  // el token y los datos del usuario actual.
  const { isAuthenticated, token, user } = useAuth();

  // Estado donde guardo el servicio cargado desde el backend.
  const [service, setService] = useState(null);

  // Estado para controlar la carga inicial de la página.
  const [isLoading, setIsLoading] = useState(true);

  // Estado para guardar un posible error al cargar el servicio.
  const [error, setError] = useState("");

  // Estado del mensaje que el cliente escribirá para enviar la solicitud.
  const [requestMessage, setRequestMessage] = useState("");

  // Estado para mostrar errores al enviar la solicitud.
  const [requestError, setRequestError] = useState("");

  // Estado para mostrar el mensaje de éxito al enviar la solicitud.
  const [requestSuccess, setRequestSuccess] = useState("");

  // Estado para desactivar el botón mientras la solicitud se está enviando.
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Este efecto carga el servicio cuando la página se monta
  // o cuando cambia el id o el token.
  useEffect(() => {
    async function loadService() {
      try {
        // Activo la carga y limpio errores previos.
        setIsLoading(true);
        setError("");

        // Pido al backend el detalle del servicio.
        const data = await getServiceById(id, token);

        // Guardo el servicio recibido o null si no viene nada.
        setService(data?.service || null);
      } catch (loadError) {
        // Si falla la petición, guardo un mensaje de error.
        setError(loadError.message || "No se pudo cargar el servicio.");
      } finally {
        // Desactivo la carga al terminar.
        setIsLoading(false);
      }
    }

    loadService();
  }, [id, token]);

  // Extraigo datos preparados para mostrar con textos por defecto
  // por si el servicio no trae algún valor.
  const categoryName = service?.category?.name || "Sin categoría";
  const cityName = service?.city?.name || "Sin ciudad";
  const professionalName = service?.pro?.name || "Profesional";
  const reviews = service?.reviews || [];
  const isServiceUnavailable = !service?.isActive;

  // Calculo si el usuario actual puede enviar una solicitud a este servicio.
  const canRequest = useMemo(() => {
    // Si no hay servicio, no hay sesión o no hay usuario,
    // no permito enviar solicitudes.
    if (!service || !isAuthenticated || !user) {
      return false;
    }

    // Solo puede solicitar si es CLIENT,
    // si no es el dueño del servicio
    // y si el servicio está activo.
    return (
      user.role === "CLIENT" && service.proId !== user.id && service.isActive
    );
  }, [service, isAuthenticated, user]);

  // Maneja el envío del formulario de solicitud al profesional.
  async function handleRequestSubmit(event) {
    event.preventDefault();

    // Si el mensaje está vacío, muestro error y no continúo.
    if (!requestMessage.trim()) {
      setRequestError("Escribe un mensaje para el profesional.");
      return;
    }

    try {
      // Activo el estado de envío y limpio mensajes previos.
      setIsSendingRequest(true);
      setRequestError("");
      setRequestSuccess("");

      // Envío la solicitud al backend.
      await createRequest(token, {
        serviceId: Number(id),
        message: requestMessage.trim(),
      });

      // Si va bien, limpio el textarea y muestro mensaje de éxito.
      setRequestMessage("");
      setRequestSuccess("Solicitud enviada correctamente.");
    } catch (requestSubmitError) {
      // Si falla, muestro el mensaje de error correspondiente.
      setRequestError(
        requestSubmitError.message || "No se pudo enviar la solicitud.",
      );
    } finally {
      // Desactivo el estado de envío al terminar.
      setIsSendingRequest(false);
    }
  }

  // Redirige al usuario a la página de login
  // guardando la ruta actual para poder volver después.
  function handleLoginRedirect() {
    navigate("/login", {
      state: {
        from: location,
      },
    });
  }

  // Mientras el servicio se está cargando, muestro un estado temporal.
  if (isLoading) {
    return (
      <main className={styles.detailPage}>
        <div className="container">
          <div className={styles.notFound}>
            <h1>Cargando servicio...</h1>
            <p>Estamos recuperando la información del servicio.</p>
          </div>
        </div>
      </main>
    );
  }

  // Si hay error o no existe servicio, muestro un estado de no encontrado.
  if (error || !service) {
    return (
      <main className={styles.detailPage}>
        <div className="container">
          <div className={styles.notFound}>
            <h1>Servicio no encontrado</h1>
            <p>
              {error ||
                "El servicio que buscas no existe o ya no está disponible."}
            </p>
            <Link to="/services" className={styles.backButton}>
              Volver a servicios
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.detailPage}>
      <div className="container">
        <div className={styles.layout}>
          {/* Columna principal con la información del servicio */}
          <section className={styles.mainContent}>
            <ServiceDetailHeader
              service={service}
              categoryName={categoryName}
              cityName={cityName}
              professionalName={professionalName}
            />

            <ServiceDescriptionCard description={service.description} />

            <ServiceReviewsCard reviews={reviews} />
          </section>

          {/* Columna lateral con precio, datos rápidos y formulario de contacto */}
          <ServiceSidebar
            service={service}
            cityName={cityName}
            professionalName={professionalName}
            isAuthenticated={isAuthenticated}
            canRequest={canRequest}
            isServiceUnavailable={isServiceUnavailable}
            user={user}
            requestMessage={requestMessage}
            requestError={requestError}
            requestSuccess={requestSuccess}
            isSendingRequest={isSendingRequest}
            onRequestMessageChange={(value) => {
              setRequestMessage(value);
              setRequestError("");
              setRequestSuccess("");
            }}
            onRequestSubmit={handleRequestSubmit}
            onLoginRedirect={handleLoginRedirect}
          />
        </div>
      </div>
    </main>
  );
}

// Exporto la página para usarla en el router.
export default ServiceDetail;
