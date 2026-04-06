import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCategories, getCities } from "../../services/meta.service";
import {
  getMyClientRequests,
  getMyProRequests,
  updateRequestStatus,
} from "../../services/requests.service";
import { createReview, getMyReviews } from "../../services/reviews.service";
import {
  createService,
  getMyServices,
  updateService,
} from "../../services/services.service";
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
import {
  getMyDashboard,
  updateMyProfile,
  deleteMyAvatar,
} from "../../services/users.service";
import buildFieldErrors from "../../utils/buildFieldErrors";
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
import styles from "./Dashboard.module.css";

const INITIAL_SERVICE_FORM = {
  title: "",
  description: "",
  price: "",
  categoryId: "",
  cityId: "",
  image: null,
};

const INITIAL_PROFILE_FORM = {
  name: "",
  email: "",
  city: "",
  avatar: null,
};

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

function Dashboard() {
  const { token, user, logout, setAuthUser } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  const [profileForm, setProfileForm] = useState(INITIAL_PROFILE_FORM);
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  const [serviceForm, setServiceForm] = useState(INITIAL_SERVICE_FORM);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceFormError, setServiceFormError] = useState("");
  const [serviceFormSuccess, setServiceFormSuccess] = useState("");
  const [isSavingService, setIsSavingService] = useState(false);
  const [isTogglingServiceId, setIsTogglingServiceId] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    requestId: null,
    rating: "5",
    comment: "",
  });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRequestId, setIsUpdatingRequestId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        const dashboardPromise = getMyDashboard(token);

        if (user?.role === "CLIENT") {
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

    if (token && user?.role) {
      loadDashboard();
    }
  }, [token, user?.role, logout]);

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

  const statsEntries = useMemo(() => {
    return getStatsEntries(user?.role, dashboardData?.stats);
  }, [user?.role, dashboardData?.stats]);

  function resetServiceForm(clearMessages = true) {
    setServiceForm(INITIAL_SERVICE_FORM);
    setEditingServiceId(null);

    if (clearMessages) {
      setServiceFormError("");
      setServiceFormSuccess("");
    }
  }

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

  async function handleProfileSubmit(event) {
    event.preventDefault();

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
      const fieldErrors = buildFieldErrors(saveError);

      if (Object.keys(fieldErrors).length > 0) {
        setProfileFieldErrors(fieldErrors);
      }

      setProfileError(saveError.message || "No se pudo actualizar el perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  }

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

      if (updatedUser) {
        setDashboardData((prev) => ({
          ...(prev || {}),
          user: updatedUser,
        }));

        setAuthUser(updatedUser);
      }

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

  function handleServiceFormChange(event) {
    const { name, value, files, type } = event.target;

    setServiceForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files?.[0] || null : value,
    }));

    setServiceFormError("");
    setServiceFormSuccess("");
  }

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

  async function handleServiceSubmit(event) {
    event.preventDefault();

    const validationError = validateServiceForm();

    if (validationError) {
      setServiceFormError(validationError);
      return;
    }

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
  }

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

  async function handleUpdateRequestStatus(requestId, status) {
    try {
      setIsUpdatingRequestId(requestId);

      const response = await updateRequestStatus(token, requestId, status);
      const updatedRequest = response?.request;

      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? updatedRequest || request : request,
        ),
      );

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

  function handleOpenReviewForm(requestId) {
    setReviewForm({
      requestId,
      rating: "5",
      comment: "",
    });
    setReviewError("");
    setReviewSuccess("");
  }

  function handleReviewChange(event) {
    const { name, value } = event.target;

    setReviewForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setReviewError("");
    setReviewSuccess("");
  }

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

  return (
    <main className={styles.dashboardPage}>
      <div className="container">
        <DashboardHero user={dashboardData?.user || user} />
        <DashboardStats statsEntries={statsEntries} />

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

        {user?.role === "PRO" ? (
          <>
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

export default Dashboard;
