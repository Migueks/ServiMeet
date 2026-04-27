// Importo hooks de React para guardar estado, ejecutar efectos, guardar referencias del DOM y memorizar valores calculados.
import { useEffect, useMemo, useRef, useState } from "react";

// Importo el contexto de autenticación para acceder al token, al usuario actual y a funciones de sesión.
import { useAuth } from "../../context/AuthContext";

// Importo servicios de metadatos para obtener categorías y ciudades.
import { getCategories, getCities } from "../../services/meta.service";

// Importo servicios relacionados con solicitudes.
import {
  getMyClientRequests,
  getMyProRequests,
  updateRequestStatus,
} from "../../services/requests.service";

// Importo servicios relacionados con reseñas.
import { createReview, getMyReviews } from "../../services/reviews.service";

// Importo servicios relacionados con servicios publicados por el profesional.
import {
  createService,
  getMyServices,
  updateService,
} from "../../services/services.service";

// Importo servicios exclusivos del panel de administración.
import {
  getAdminRequests,
  getAdminReviews,
  getAdminServices,
  getAdminUsers,
  getAdminContactMessages,
  toggleAdminServiceActive,
  toggleAdminUserBlocked,
  toggleAdminReviewVisibility,
} from "../../services/admin.service";

// Importo servicios relacionados con el perfil y el dashboard del usuario.
import {
  getMyDashboard,
  updateMyProfile,
  deleteMyAvatar,
} from "../../services/users.service";

// Importo la utilidad que transforma errores del backend en un objeto más fácil de usar en formularios.
import buildFieldErrors from "../../utils/buildFieldErrors";

// Importo los componentes visuales que forman el dashboard.
import DashboardHero from "../../components/dashboard/DashboardHero/DashboardHero";
import DashboardStats from "../../components/dashboard/DashboardStats/DashboardStats";
import ProfileSection from "../../components/dashboard/ProfileSection/ProfileSection";
import ClientRequestsSection from "../../components/dashboard/ClientRequestsSection/ClientRequestsSection";
import ProServiceForm from "../../components/dashboard/ProServiceForm/ProServiceForm";
import ProServicesSection from "../../components/dashboard/ProServicesSection/ProServicesSection";
import ProRequestsSection from "../../components/dashboard/ProRequestsSection/ProRequestsSection";
import ProReviewsSection from "../../components/dashboard/ProReviewsSection/ProReviewsSection";
import AdminUsersSection from "../../components/dashboard/AdminUsersSection/AdminUsersSection";
import AdminServicesSection from "../../components/dashboard/AdminServicesSection/AdminServicesSection";
import AdminRequestsSection from "../../components/dashboard/AdminRequestsSection/AdminRequestsSection";
import AdminReviewsSection from "../../components/dashboard/AdminReviewsSection/AdminReviewsSection";
import AdminContactMessagesSection from "../../components/dashboard/AdminContactMessagesSection/AdminContactMessagesSection";

// Importo los estilos de la página.
import styles from "./Dashboard.module.css";

// Estado inicial del formulario de creación/edición de servicios.
const INITIAL_SERVICE_FORM = {
  title: "",
  description: "",
  price: "",
  categoryId: "",
  cityId: "",
  image: null,
};

// Estado inicial del formulario de perfil.
const INITIAL_PROFILE_FORM = {
  name: "",
  email: "",
  city: "",
  avatar: null,
};

// Esta función transforma las estadísticas crudas del backend en tarjetas más fáciles de renderizar según el rol del usuario.
function getStatsEntries(role, stats) {
  if (!stats) return [];

  if (role === "CLIENT") {
    return [
      { label: "Solicitudes totales", value: stats.totalRequests ?? 0 },
      { label: "Pendientes", value: stats.pendingRequests ?? 0 },
      { label: "Aceptadas", value: stats.acceptedRequests ?? 0 },
      { label: "Completadas", value: stats.completedRequests ?? 0 },
      { label: "Rechazadas", value: stats.rejectedRequests ?? 0 },
      { label: "Canceladas", value: stats.cancelledRequests ?? 0 },
      { label: "Reseñas dadas", value: stats.reviewsGiven ?? 0 },
    ];
  }

  if (role === "PRO") {
    return [
      { label: "Servicios totales", value: stats.totalServices ?? 0 },
      { label: "Servicios activos", value: stats.activeServices ?? 0 },
      { label: "Servicios inactivos", value: stats.inactiveServices ?? 0 },
      {
        label: "Solicitudes recibidas",
        value: stats.totalRequestsReceived ?? 0,
      },
      { label: "Pendientes", value: stats.pendingRequestsReceived ?? 0 },
      { label: "Canceladas", value: stats.cancelledRequestsReceived ?? 0 },
      { label: "Trabajos completados", value: stats.completedJobs ?? 0 },
      { label: "Reseñas recibidas", value: stats.reviewsReceived ?? 0 },
      { label: "Valoración media", value: stats.averageRating ?? 0 },
    ];
  }

  if (role === "ADMIN") {
    return [
      { label: "Usuarios totales", value: stats.totalUsers ?? 0 },
      { label: "Clientes", value: stats.totalClients ?? 0 },
      { label: "Profesionales", value: stats.totalPros ?? 0 },
      { label: "Admins", value: stats.totalAdmins ?? 0 },
      { label: "Servicios", value: stats.totalServices ?? 0 },
      { label: "Servicios activos", value: stats.activeServices ?? 0 },
      { label: "Solicitudes", value: stats.totalRequests ?? 0 },
      { label: "Pendientes", value: stats.pendingRequests ?? 0 },
      { label: "Completadas", value: stats.completedRequests ?? 0 },
      { label: "Reseñas", value: stats.totalReviews ?? 0 },
    ];
  }

  return [];
}

// Página principal del dashboard.
// Según el rol del usuario, carga y muestra bloques distintos.
function Dashboard() {
  // Obtengo datos de autenticación desde el contexto global.
  const { token, user, logout, setAuthUser } = useAuth();

  // Estado general con la respuesta principal del dashboard.
  const [dashboardData, setDashboardData] = useState(null);

  // Estados con datos específicos según el rol.
  const [requests, setRequests] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  // Estados del formulario de perfil.
  const [profileForm, setProfileForm] = useState(INITIAL_PROFILE_FORM);
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  // Estados del formulario de servicios del profesional.
  const [serviceForm, setServiceForm] = useState(INITIAL_SERVICE_FORM);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceFormError, setServiceFormError] = useState("");
  const [serviceFormSuccess, setServiceFormSuccess] = useState("");
  const [isSavingService, setIsSavingService] = useState(false);
  const [isTogglingServiceId, setIsTogglingServiceId] = useState(null);

  // Referencia al bloque del formulario para poder desplazar la vista automáticamente cuando se pulse en editar.
  const serviceFormRef = useRef(null);

  // Estados del formulario de reseña del cliente.
  const [reviewForm, setReviewForm] = useState({
    requestId: null,
    rating: "5",
    comment: "",
  });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Estados exclusivos del panel de administración.
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminServices, setAdminServices] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [adminReviews, setAdminReviews] = useState([]);
  const [adminContactMessages, setAdminContactMessages] = useState([]);
  const [isAdminTogglingServiceId, setIsAdminTogglingServiceId] =
    useState(null);
  const [isAdminTogglingUserId, setIsAdminTogglingUserId] = useState(null);
  const [isAdminTogglingReviewId, setIsAdminTogglingReviewId] = useState(null);
  const [adminActionError, setAdminActionError] = useState("");
  const [adminActionSuccess, setAdminActionSuccess] = useState("");

  // Estados generales de carga y error.
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRequestId, setIsUpdatingRequestId] = useState(null);
  const [error, setError] = useState("");

  // Este efecto carga la información del dashboard según el rol actual.
  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        // Esta petición es común para todos los roles.
        const dashboardPromise = getMyDashboard(token);

        if (user?.role === "CLIENT") {
          // Si es cliente, cargo su dashboard, sus solicitudes y sus reseñas.
          const [dashboardResponse, requestsResponse, reviewsResponse] =
            await Promise.all([
              dashboardPromise,
              getMyClientRequests(token),
              getMyReviews(token),
            ]);

          setDashboardData(dashboardResponse);
          setRequests(requestsResponse?.requests || []);
          setMyReviews(reviewsResponse?.reviews || []);
          setMyServices([]);
          setAdminUsers([]);
          setAdminServices([]);
          setAdminRequests([]);
          setAdminReviews([]);
          setAdminContactMessages([]);
        } else if (user?.role === "PRO") {
          // Si es profesional, cargo además sus servicios, categorías, ciudades y reseñas recibidas.
          const [
            dashboardResponse,
            requestsResponse,
            servicesResponse,
            categoriesResponse,
            citiesResponse,
            reviewsResponse,
          ] = await Promise.all([
            dashboardPromise,
            getMyProRequests(token),
            getMyServices(token),
            getCategories(),
            getCities(),
            getMyReviews(token),
          ]);

          setDashboardData(dashboardResponse);
          setRequests(requestsResponse?.requests || []);
          setMyServices(servicesResponse?.services || []);
          setCategories(categoriesResponse?.categories || []);
          setCities(citiesResponse?.cities || []);
          setMyReviews(reviewsResponse?.reviews || []);
          setAdminUsers([]);
          setAdminServices([]);
          setAdminRequests([]);
          setAdminReviews([]);
          setAdminContactMessages([]);
        } else {
          // Si es admin, cargo todos los bloques de administración.
          const [
            dashboardResponse,
            usersResponse,
            servicesResponse,
            requestsResponse,
            reviewsResponse,
            contactMessagesResponse,
          ] = await Promise.all([
            dashboardPromise,
            getAdminUsers(token),
            getAdminServices(token),
            getAdminRequests(token),
            getAdminReviews(token),
            getAdminContactMessages(token),
          ]);

          setDashboardData(dashboardResponse);
          setRequests([]);
          setMyServices([]);
          setMyReviews([]);
          setAdminUsers(usersResponse?.users || []);
          setAdminServices(servicesResponse?.services || []);
          setAdminRequests(requestsResponse?.requests || []);
          setAdminReviews(reviewsResponse?.reviews || []);
          setAdminContactMessages(
            contactMessagesResponse?.contactMessages || [],
          );
        }
      } catch (loadError) {
        // Si la sesión ya no es válida, cierro sesión automáticamente.
        if (loadError.status === 401) {
          logout();
          return;
        }

        setError(
          loadError.message ||
            "No se pudo cargar la información del dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    // Solo intento cargar si ya tengo token y rol disponibles.
    if (token && user?.role) {
      loadDashboard();
    }
  }, [token, user?.role, logout]);

  // Este efecto rellena el formulario de perfil cuando cambian los datos del usuario cargados.
  useEffect(() => {
    const currentUser = dashboardData?.user || user;

    if (!currentUser) return;

    setProfileForm({
      name: currentUser.name || "",
      email: currentUser.email || "",
      city: currentUser.city || "",
      avatar: null,
    });
  }, [dashboardData?.user, user]);

  // Estos efectos hacen que los mensajes de éxito desaparezcan solos tras 4 segundos.
  useEffect(() => {
    if (!serviceFormSuccess) return;
    const timeoutId = setTimeout(() => setServiceFormSuccess(""), 4000);
    return () => clearTimeout(timeoutId);
  }, [serviceFormSuccess]);

  useEffect(() => {
    if (!reviewSuccess) return;
    const timeoutId = setTimeout(() => setReviewSuccess(""), 4000);
    return () => clearTimeout(timeoutId);
  }, [reviewSuccess]);

  useEffect(() => {
    if (!adminActionSuccess) return;
    const timeoutId = setTimeout(() => setAdminActionSuccess(""), 4000);
    return () => clearTimeout(timeoutId);
  }, [adminActionSuccess]);

  useEffect(() => {
    if (!profileSuccess) return;
    const timeoutId = setTimeout(() => setProfileSuccess(""), 4000);
    return () => clearTimeout(timeoutId);
  }, [profileSuccess]);

  // Preparo las tarjetas resumen del dashboard a partir del rol del usuario y sus estadísticas.
  const statsEntries = useMemo(() => {
    return getStatsEntries(user?.role, dashboardData?.stats);
  }, [user?.role, dashboardData?.stats]);

  // Reinicia el formulario de servicio y, si se indica,
  // también limpia sus mensajes.
  function resetServiceForm(clearMessages = true) {
    setServiceForm(INITIAL_SERVICE_FORM);
    setEditingServiceId(null);

    if (clearMessages) {
      setServiceFormError("");
      setServiceFormSuccess("");
    }
  }

  // Maneja los cambios del formulario de perfil,
  // incluyendo inputs normales y el archivo del avatar.
  function handleProfileChange(event) {
    const { name, value, files, type } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files?.[0] || null : value,
    }));

    setProfileFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setProfileError("");
    setProfileSuccess("");
  }

  // Envía el formulario de perfil al backend.
  async function handleProfileSubmit(event) {
    event.preventDefault();

    // Uso FormData porque puede incluir avatar.
    const payload = new FormData();
    payload.append("name", profileForm.name.trim());
    payload.append("email", profileForm.email.trim().toLowerCase());
    payload.append("city", profileForm.city.trim());

    if (profileForm.avatar) {
      payload.append("avatar", profileForm.avatar);
    }

    try {
      setIsSavingProfile(true);
      setProfileFieldErrors({});
      setProfileError("");
      setProfileSuccess("");

      const response = await updateMyProfile(token, payload);
      const updatedUser = response?.user;

      // Si el backend devuelve el usuario actualizado,
      // actualizo tanto el dashboard como el contexto global.
      if (updatedUser) {
        setDashboardData((prev) => ({
          ...(prev || {}),
          user: updatedUser,
        }));

        setAuthUser(updatedUser);
      }

      setProfileSuccess(
        response?.message || "Perfil actualizado correctamente.",
      );
    } catch (saveError) {
      // Si el backend devuelve errores por campo, los guardo para el formulario.
      const fieldErrors = buildFieldErrors(saveError);

      if (Object.keys(fieldErrors).length > 0) {
        setProfileFieldErrors(fieldErrors);
      }

      setProfileError(saveError.message || "No se pudo actualizar el perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  // Elimina el avatar actual del usuario.
  async function handleRemoveAvatar() {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar tu avatar actual?",
    );

    if (!confirmed) return;

    try {
      setIsRemovingAvatar(true);
      setProfileFieldErrors((prev) => ({
        ...prev,
        avatar: "",
      }));
      setProfileError("");
      setProfileSuccess("");

      const response = await deleteMyAvatar(token);
      const updatedUser = response?.user;

      // Si el backend devuelve el usuario actualizado,
      // sincronizo dashboard y contexto.
      if (updatedUser) {
        setDashboardData((prev) => ({
          ...(prev || {}),
          user: updatedUser,
        }));

        setAuthUser(updatedUser);
      }

      // Limpio el archivo seleccionado del formulario.
      setProfileForm((prev) => ({
        ...prev,
        avatar: null,
      }));

      setProfileSuccess(response?.message || "Avatar eliminado correctamente.");
    } catch (removeError) {
      setProfileError(removeError.message || "No se pudo eliminar el avatar.");
    } finally {
      setIsRemovingAvatar(false);
    }
  }

  // Maneja los cambios del formulario de creación/edición de servicios.
  function handleServiceFormChange(event) {
    const { name, value, files, type } = event.target;

    setServiceForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files?.[0] || null : value,
    }));

    setServiceFormError("");
    setServiceFormSuccess("");
  }

  // Validación básica del formulario de servicios.
  function validateServiceForm() {
    if (!serviceForm.title.trim())
      return "Introduce un título para el servicio.";
    if (!serviceForm.description.trim())
      return "Introduce una descripción para el servicio.";
    if (!serviceForm.price || Number(serviceForm.price) <= 0)
      return "Introduce un precio válido.";
    if (!serviceForm.categoryId) return "Selecciona una categoría.";
    if (!serviceForm.cityId) return "Selecciona una ciudad.";
    return "";
  }

  // Recarga los datos del dashboard del cliente.
  async function refreshClientData() {
    const [dashboardResponse, requestsResponse, reviewsResponse] =
      await Promise.all([
        getMyDashboard(token),
        getMyClientRequests(token),
        getMyReviews(token),
      ]);

    setDashboardData(dashboardResponse);
    setRequests(requestsResponse?.requests || []);
    setMyReviews(reviewsResponse?.reviews || []);
  }

  // Recarga los datos del dashboard del profesional.
  async function refreshProData() {
    const [
      dashboardResponse,
      requestsResponse,
      servicesResponse,
      reviewsResponse,
    ] = await Promise.all([
      getMyDashboard(token),
      getMyProRequests(token),
      getMyServices(token),
      getMyReviews(token),
    ]);

    setDashboardData(dashboardResponse);
    setRequests(requestsResponse?.requests || []);
    setMyServices(servicesResponse?.services || []);
    setMyReviews(reviewsResponse?.reviews || []);
  }

  // Recarga los datos del panel de administración.
  async function refreshAdminData() {
    const [
      dashboardResponse,
      usersResponse,
      servicesResponse,
      requestsResponse,
      reviewsResponse,
      contactMessagesResponse,
    ] = await Promise.all([
      getMyDashboard(token),
      getAdminUsers(token),
      getAdminServices(token),
      getAdminRequests(token),
      getAdminReviews(token),
      getAdminContactMessages(token),
    ]);

    setDashboardData(dashboardResponse);
    setAdminUsers(usersResponse?.users || []);
    setAdminServices(servicesResponse?.services || []);
    setAdminRequests(requestsResponse?.requests || []);
    setAdminReviews(reviewsResponse?.reviews || []);
    setAdminContactMessages(contactMessagesResponse?.contactMessages || []);
  }

  // Crea o actualiza un servicio del profesional.
  async function handleServiceSubmit(event) {
    event.preventDefault();

    const validationError = validateServiceForm();

    if (validationError) {
      setServiceFormError(validationError);
      return;
    }

    // Uso FormData porque el servicio puede incluir imagen.
    const payload = new FormData();
    payload.append("title", serviceForm.title.trim());
    payload.append("description", serviceForm.description.trim());
    payload.append("price", String(Number(serviceForm.price)));
    payload.append("categoryId", String(Number(serviceForm.categoryId)));
    payload.append("cityId", String(Number(serviceForm.cityId)));

    if (serviceForm.image) {
      payload.append("image", serviceForm.image);
    }

    try {
      setIsSavingService(true);
      setServiceFormError("");
      setServiceFormSuccess("");

      const isEditing = Boolean(editingServiceId);

      if (isEditing) {
        await updateService(token, editingServiceId, payload);
      } else {
        await createService(token, payload);
      }

      // Tras guardar, recargo los datos y reseteo el formulario.
      await refreshProData();
      resetServiceForm(false);

      setServiceFormSuccess(
        isEditing
          ? "Servicio actualizado correctamente."
          : "Servicio creado correctamente.",
      );
    } catch (saveError) {
      setServiceFormError(
        saveError.message || "No se pudo guardar el servicio.",
      );
    } finally {
      setIsSavingService(false);
    }
  }

  // Carga en el formulario los datos de un servicio para editarlo.
  function handleEditService(service) {
    setEditingServiceId(service.id);
    setServiceForm({
      title: service.title || "",
      description: service.description || "",
      price: service.price != null ? String(service.price) : "",
      categoryId: service.category?.id ? String(service.category.id) : "",
      cityId: service.city?.id ? String(service.city.id) : "",
      image: null,
    });
    setServiceFormError("");
    setServiceFormSuccess("");

    // Hago scroll automático hasta el formulario de servicio
    // para que el usuario vea directamente la zona de edición.
    requestAnimationFrame(() => {
      serviceFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  // Activa o desactiva un servicio del profesional.
  async function handleToggleService(service) {
    try {
      setIsTogglingServiceId(service.id);
      setServiceFormError("");
      setServiceFormSuccess("");

      const payload = new FormData();
      payload.append("isActive", String(!service.isActive));

      await updateService(token, service.id, payload);

      await refreshProData();
      setServiceFormSuccess(
        service.isActive
          ? "Servicio desactivado correctamente."
          : "Servicio activado correctamente.",
      );
    } catch (toggleError) {
      setServiceFormError(
        toggleError.message || "No se pudo cambiar el estado del servicio.",
      );
    } finally {
      setIsTogglingServiceId(null);
    }
  }

  // Actualiza el estado de una solicitud.
  async function handleUpdateRequestStatus(requestId, status) {
    try {
      setIsUpdatingRequestId(requestId);

      const response = await updateRequestStatus(token, requestId, status);
      const updatedRequest = response?.request;

      // Actualizo localmente la solicitud modificada.
      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? updatedRequest || request : request,
        ),
      );

      // Después refresco los datos según el rol.
      if (user?.role === "CLIENT") {
        await refreshClientData();
      }

      if (user?.role === "PRO") {
        await refreshProData();
      }
    } catch (updateError) {
      alert(
        updateError.message ||
          "No se pudo actualizar el estado de la solicitud.",
      );
    } finally {
      setIsUpdatingRequestId(null);
    }
  }

  // Abre el formulario para crear una reseña sobre una solicitud concreta.
  function handleOpenReviewForm(requestId) {
    setReviewForm({
      requestId,
      rating: "5",
      comment: "",
    });
    setReviewError("");
    setReviewSuccess("");
  }

  // Maneja los cambios del formulario de reseñas.
  function handleReviewChange(event) {
    const { name, value } = event.target;

    setReviewForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setReviewError("");
    setReviewSuccess("");
  }

  // Envía una nueva reseña al backend.
  async function handleReviewSubmit(event) {
    event.preventDefault();

    if (!reviewForm.requestId) {
      setReviewError("No se ha seleccionado ninguna solicitud.");
      return;
    }

    if (!reviewForm.comment.trim()) {
      setReviewError("Escribe un comentario para la reseña.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewError("");
      setReviewSuccess("");

      await createReview(token, {
        requestId: reviewForm.requestId,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      });

      await refreshClientData();

      // Reinicio el formulario tras crear la reseña.
      setReviewForm({
        requestId: null,
        rating: "5",
        comment: "",
      });

      setReviewSuccess("Reseña enviada correctamente.");
    } catch (reviewSubmitError) {
      setReviewError(
        reviewSubmitError.message || "No se pudo crear la reseña.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  }

  // Activa o desactiva un servicio desde el panel de administración.
  async function handleAdminToggleService(service) {
    try {
      setIsAdminTogglingServiceId(service.id);
      setAdminActionError("");
      setAdminActionSuccess("");

      await toggleAdminServiceActive(token, service.id);
      await refreshAdminData();

      setAdminActionSuccess(
        service.isActive
          ? "Servicio desactivado correctamente."
          : "Servicio activado correctamente.",
      );
    } catch (adminToggleError) {
      setAdminActionError(
        adminToggleError.message ||
          "No se pudo cambiar el estado del servicio.",
      );
    } finally {
      setIsAdminTogglingServiceId(null);
    }
  }

  // Bloquea o desbloquea un usuario desde el panel de administración.
  async function handleAdminToggleUserBlocked(adminUser) {
    try {
      setIsAdminTogglingUserId(adminUser.id);
      setAdminActionError("");
      setAdminActionSuccess("");

      await toggleAdminUserBlocked(token, adminUser.id);
      await refreshAdminData();

      setAdminActionSuccess(
        adminUser.isBlocked
          ? "Usuario desbloqueado correctamente."
          : "Usuario bloqueado correctamente.",
      );
    } catch (toggleError) {
      setAdminActionError(
        toggleError.message || "No se pudo cambiar el estado del usuario.",
      );
    } finally {
      setIsAdminTogglingUserId(null);
    }
  }

  // Oculta o vuelve visible una reseña desde el panel de administración.
  async function handleAdminToggleReviewVisibility(review) {
    try {
      setIsAdminTogglingReviewId(review.id);
      setAdminActionError("");
      setAdminActionSuccess("");

      await toggleAdminReviewVisibility(token, review.id);
      await refreshAdminData();

      setAdminActionSuccess(
        review.isVisible
          ? "Reseña ocultada correctamente."
          : "Reseña mostrada correctamente.",
      );
    } catch (toggleError) {
      setAdminActionError(
        toggleError.message ||
          "No se pudo cambiar la visibilidad de la reseña.",
      );
    } finally {
      setIsAdminTogglingReviewId(null);
    }
  }

  // Estado visual mientras el dashboard sigue cargando.
  if (isLoading) {
    return (
      <main className={styles.dashboardPage}>
        <div className="container">
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.infoText}>Cargando tu panel...</p>
        </div>
      </main>
    );
  }

  // Estado visual si la carga ha fallado.
  if (error) {
    return (
      <main className={styles.dashboardPage}>
        <div className="container">
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.errorText}>{error}</p>
        </div>
      </main>
    );
  }

  // Render principal del dashboard.
  return (
    <main className={styles.dashboardPage}>
      <div className="container">
        {/* Cabecera de bienvenida con datos del usuario */}
        <DashboardHero user={dashboardData?.user || user} />

        {/* Tarjetas resumen con estadísticas */}
        <DashboardStats statsEntries={statsEntries} />

        {/* Bloque de perfil, común para cualquier rol */}
        <ProfileSection
          profileForm={profileForm}
          profileFieldErrors={profileFieldErrors}
          profileError={profileError}
          profileSuccess={profileSuccess}
          isSavingProfile={isSavingProfile}
          currentAvatarUrl={
            dashboardData?.user?.avatarUrl || user?.avatarUrl || ""
          }
          isRemovingAvatar={isRemovingAvatar}
          handleProfileChange={handleProfileChange}
          handleProfileSubmit={handleProfileSubmit}
          handleRemoveAvatar={handleRemoveAvatar}
        />

        {/* Bloques exclusivos para CLIENT */}
        {user?.role === "CLIENT" ? (
          <ClientRequestsSection
            requests={requests}
            myReviews={myReviews}
            reviewForm={reviewForm}
            reviewError={reviewError}
            reviewSuccess={reviewSuccess}
            isSubmittingReview={isSubmittingReview}
            isUpdatingRequestId={isUpdatingRequestId}
            handleUpdateRequestStatus={handleUpdateRequestStatus}
            handleOpenReviewForm={handleOpenReviewForm}
            handleReviewChange={handleReviewChange}
            handleReviewSubmit={handleReviewSubmit}
            setReviewForm={setReviewForm}
          />
        ) : null}

        {/* Bloques exclusivos para PRO */}
        {user?.role === "PRO" ? (
          <>
            <div ref={serviceFormRef} className={styles.formScrollTarget}>
              <ProServiceForm
                editingServiceId={editingServiceId}
                serviceForm={serviceForm}
                categories={categories}
                cities={cities}
                serviceFormError={serviceFormError}
                serviceFormSuccess={serviceFormSuccess}
                isSavingService={isSavingService}
                handleServiceFormChange={handleServiceFormChange}
                handleServiceSubmit={handleServiceSubmit}
                resetServiceForm={resetServiceForm}
              />
            </div>

            <ProServicesSection
              myServices={myServices}
              isTogglingServiceId={isTogglingServiceId}
              handleEditService={handleEditService}
              handleToggleService={handleToggleService}
            />

            <ProRequestsSection
              requests={requests}
              isUpdatingRequestId={isUpdatingRequestId}
              handleUpdateRequestStatus={handleUpdateRequestStatus}
            />

            <ProReviewsSection myReviews={myReviews} />
          </>
        ) : null}

        {/* Bloques exclusivos para ADMIN */}
        {user?.role === "ADMIN" ? (
          <>
            <section className={styles.adminIntro}>
              <h2 className={styles.sectionTitle}>Panel de administración</h2>

              {adminActionError ? (
                <p className={styles.errorText}>{adminActionError}</p>
              ) : null}

              {adminActionSuccess ? (
                <p className={styles.successText}>{adminActionSuccess}</p>
              ) : null}
            </section>

            <AdminContactMessagesSection
              adminContactMessages={adminContactMessages}
            />

            <AdminUsersSection
              adminUsers={adminUsers}
              currentAdminUserId={user?.id}
              isAdminTogglingUserId={isAdminTogglingUserId}
              handleAdminToggleUserBlocked={handleAdminToggleUserBlocked}
            />

            <AdminServicesSection
              adminServices={adminServices}
              isAdminTogglingServiceId={isAdminTogglingServiceId}
              handleAdminToggleService={handleAdminToggleService}
            />

            <AdminRequestsSection adminRequests={adminRequests} />

            <AdminReviewsSection
              adminReviews={adminReviews}
              isAdminTogglingReviewId={isAdminTogglingReviewId}
              handleAdminToggleReviewVisibility={
                handleAdminToggleReviewVisibility
              }
            />
          </>
        ) : null}
      </div>
    </main>
  );
}

// Exporto la página para usarla en el router.
export default Dashboard;
