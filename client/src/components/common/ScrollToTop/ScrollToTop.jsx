// Importo useEffect para ejecutar lógica cuando cambia la ruta.
import { useEffect } from "react";
// Importo useLocation para saber en qué ruta está actualmente el usuario.
import { useLocation } from "react-router-dom";

// Este componente hace que la ventana vuelva arriba cada vez que el usuario cambia de página.
function ScrollToTop() {
  // Extraigo el pathname actual de la URL.
  const { pathname } = useLocation();

  // Cada vez que cambia la ruta, hago scroll al inicio de la página.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  // Este componente no renderiza nada visible.
  return null;
}

// Exporto el componente para usarlo dentro del router.
export default ScrollToTop;
