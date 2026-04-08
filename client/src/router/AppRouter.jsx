// Importo los componentes principales del sistema de rutas de React Router.
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Importo los layouts de la aplicación.
// MainLayout se usa para las páginas públicas principales.
// AuthLayout se usa para las páginas de autenticación.
import MainLayout from "../layouts/MainLayout/MainLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";

// Importo la ruta protegida para impedir el acceso a ciertas páginas si el usuario no está autenticado.
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";

// Importo el componente que hace que la página vuelva arriba al cambiar de ruta.
import ScrollToTop from "../components/common/ScrollToTop/ScrollToTop";

// Importo las distintas páginas de la aplicación.
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Services from "../pages/Services/Services";
import ServiceDetail from "../pages/ServiceDetail/ServiceDetail";
import Dashboard from "../pages/Dashboard/Dashboard";
import ForProfessionals from "../pages/ForProfessionals/ForProfessionals";
import Contact from "../pages/Contact/Contact";
import NotFound from "../pages/NotFound/NotFound";

// Componente que centraliza toda la navegación de la aplicación.
function AppRouter() {
  return (
    // BrowserRouter permite que React Router controle la navegación usando la URL del navegador.
    <BrowserRouter>
      {/* Al cambiar de página, este componente fuerza el scroll al inicio */}
      <ScrollToTop />

      {/* Dentro de Routes definimos todas las rutas de la app */}
      <Routes>
        {/* Grupo de rutas que comparten el layout principal */}
        <Route element={<MainLayout />}>
          {/* Página de inicio */}
          <Route path="/" element={<Home />} />
          {/* Página de listado de servicios */}
          <Route path="/services" element={<Services />} />
          {/* Página de detalle de un servicio concreto. :id es un parámetro dinámico de la URL */}
          <Route path="/services/:id" element={<ServiceDetail />} />
          {/* Página orientada a profesionales */}
          <Route path="/profesionales" element={<ForProfessionals />} />
          {/* Página de contacto */}
          <Route path="/contacto" element={<Contact />} />
          {/* Ruta protegida: solo podrá entrar un usuario autenticado */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Grupo de rutas que comparten el layout de autenticación */}
        <Route element={<AuthLayout />}>
          {/* Página de inicio de sesión */}
          <Route path="/login" element={<Login />} />
          {/* Página de registro */}
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Ruta comodín: captura cualquier URL no existente */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// Exporto el componente para usarlo desde App.jsx.
export default AppRouter;
