// Importo Outlet de React Router.
// Outlet es el lugar donde se renderiza la página hija correspondiente a la ruta actual.
import { Outlet } from "react-router-dom";
// Importo la barra de navegación común de la aplicación.
import Navbar from "../Navbar/Navbar";
// Importo el pie de página común de la aplicación.
import Footer from "../Footer/Footer";

// Este layout se usa para las páginas principales de la web.
// Su función es envolver el contenido con la estructura común:
// navbar arriba, contenido en medio y footer abajo.
function MainLayout() {
  return (
    <>
      {/* Muestro la barra de navegación en la parte superior */}
      <Navbar />
      {/* Aquí se renderiza la página hija según la ruta activa */}
      <Outlet />
      {/* Muestro el pie de página al final */}
      <Footer />
    </>
  );
}

// Exporto el layout para poder usarlo en el router.
export default MainLayout;
