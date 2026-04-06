import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ServiceDetailHeader from "../../components/serviceDetail/ServiceDetailHeader/ServiceDetailHeader";
import ServiceDescriptionCard from "../../components/serviceDetail/ServiceDescriptionCard/ServiceDescriptionCard";
import ServiceReviewsCard from "../../components/serviceDetail/ServiceReviewsCard/ServiceReviewsCard";
import ServiceSidebar from "../../components/serviceDetail/ServiceSidebar/ServiceSidebar";
import { useAuth } from "../../context/AuthContext";
import { createRequest } from "../../services/requests.service";
import { getServiceById } from "../../services/services.service";
import styles from "./ServiceDetail.module.css";

function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token, user } = useAuth();

  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  useEffect(() => {
    async function loadService() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getServiceById(id, token);
        setService(data?.service || null);
      } catch (loadError) {
        setError(loadError.message || "No se pudo cargar el servicio.");
      } finally {
        setIsLoading(false);
      }
    }

    loadService();
  }, [id, token]);

  const categoryName = service?.category?.name || "Sin categoría";
  const cityName = service?.city?.name || "Sin ciudad";
  const professionalName = service?.pro?.name || "Profesional";
  const reviews = service?.reviews || [];
  const isServiceUnavailable = !service?.isActive;

  const canRequest = useMemo(() => {
    if (!service || !isAuthenticated || !user) {
      return false;
    }

    return (
      user.role === "CLIENT" && service.proId !== user.id && service.isActive
    );
  }, [service, isAuthenticated, user]);

  async function handleRequestSubmit(event) {
    event.preventDefault();

    if (!requestMessage.trim()) {
      setRequestError("Escribe un mensaje para el profesional.");
      return;
    }

    try {
      setIsSendingRequest(true);
      setRequestError("");
      setRequestSuccess("");

      await createRequest(token, {
        serviceId: Number(id),
        message: requestMessage.trim(),
      });

      setRequestMessage("");
      setRequestSuccess("Solicitud enviada correctamente.");
    } catch (requestSubmitError) {
      setRequestError(
        requestSubmitError.message || "No se pudo enviar la solicitud.",
      );
    } finally {
      setIsSendingRequest(false);
    }
  }

  function handleLoginRedirect() {
    navigate("/login", {
      state: {
        from: location,
      },
    });
  }

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

export default ServiceDetail;
