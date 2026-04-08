// Importo Navigate para redirigir al usuario si no tiene acceso,
// y useLocation para guardar la ruta desde la que intentó entrar.
import { Navigate, useLocation } from "react-router-dom";

// Importo el hook del contexto de autenticación para saber si el usuario está autenticado y si la sesión sigue cargando.
import { useAuth } from "../../context/AuthContext";

// Este componente protege rutas privadas.
// Si el usuario no ha iniciado sesión, lo redirige al login.
function ProtectedRoute({ children }) {
  // Guardo la ubicación actual para poder recordar desde qué página
  // intentó acceder el usuario antes de ser redirigido.
  const location = useLocation();

  // Obtengo del contexto si el usuario está autenticado
  // y si todavía se está comprobando su sesión.
  const { isAuthenticated, isLoadingAuth } = useAuth();

  // Mientras se comprueba la sesión, muestro un mensaje de carga.
  if (isLoadingAuth) {
    return (
      <main className="container" style={{ paddingBlock: "4rem" }}>
        <p>Cargando tu sesión...</p>
      </main>
    );
  }

  // Si el usuario no está autenticado, lo envío al login.
  // Además, guardo en "state" la ruta original para poder volver después si hiciera falta.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si todo está correcto, renderizo el contenido protegido.
  return children;
}

// Exporto el componente para usarlo en AppRouter.
export default ProtectedRoute;
