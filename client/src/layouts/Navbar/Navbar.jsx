// Importo useState para controlar si el menú móvil está abierto o cerrado.
import { useState } from "react";

// Importo Link para navegar entre páginas sin recargar
// y useLocation para saber en qué ruta está el usuario.
import { Link, useLocation } from "react-router-dom";

// Importo el contexto de autenticación para saber si hay sesión,
// mostrar datos del usuario y permitir cerrar sesión.
import { useAuth } from "../../context/AuthContext";

// Importo los estilos del componente.
import styles from "./Navbar.module.css";

// Componente de la barra de navegación principal.
function Navbar() {
  // Estado para controlar la apertura del menú móvil.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Obtengo del contexto si el usuario está autenticado,
  // sus datos y la función para cerrar sesión.
  const { isAuthenticated, user, logout } = useAuth();

  // Obtengo la ruta actual para poder hacer lógica según la página.
  const location = useLocation();

  // Abre o cierra el menú móvil alternando su estado actual.
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Cierra el menú móvil.
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Maneja el clic en el logo de inicio.
  // Si ya estamos en la home, evita navegar de nuevo
  // y hace scroll suave hasta arriba.
  function handleHomeClick(event) {
    closeMenu();

    if (location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }

  // Cierra sesión y además cierra el menú móvil si estuviera abierto.
  function handleLogout() {
    logout();
    closeMenu();
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* Logo de la aplicación. Lleva a la home */}
        <Link to="/" className={styles.logo} onClick={handleHomeClick}>
          <img src="/image/logo.webp" alt="Logo ServiMeet" />
        </Link>

        {/* Navegación principal en escritorio */}
        <nav className={styles.nav}>
          <Link to="/services">Servicios</Link>
          <Link to="/profesionales">Para profesionales</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>

        {/* Zona derecha con acciones de usuario */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              {/* Si hay sesión, muestro una pequeña bienvenida con el primer nombre */}
              <span className={styles.userBadge}>
                {user?.name?.split(" ")[0] || "Usuario"}
              </span>

              {/* Acceso rápido al dashboard */}
              <Link to="/dashboard" className={styles.loginButton}>
                Dashboard
              </Link>

              {/* Botón para cerrar sesión */}
              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              {/* Si no hay sesión, muestro acceso a login y registro */}
              <Link to="/login" className={styles.loginButton}>
                Iniciar sesión
              </Link>

              <Link to="/register" className={styles.registerButton}>
                Regístrate
              </Link>
            </>
          )}
        </div>

        {/* Botón hamburguesa para abrir/cerrar el menú móvil */}
        <button
          type="button"
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
        >
          {/* Las tres barras cambian de clase cuando el menú está abierto
              para animar el icono */}
          <span
            className={`${styles.bar} ${isMenuOpen ? styles.barTopOpen : ""}`}
          />
          <span
            className={`${styles.bar} ${isMenuOpen ? styles.barMiddleOpen : ""}`}
          />
          <span
            className={`${styles.bar} ${isMenuOpen ? styles.barBottomOpen : ""}`}
          />
        </button>
      </div>

      {/* Menú móvil desplegable */}
      <div
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <div className={`container ${styles.mobileMenuInner}`}>
          {/* Navegación móvil */}
          <nav className={styles.mobileNav}>
            <Link to="/services" onClick={closeMenu}>
              Servicios
            </Link>
            <Link to="/profesionales" onClick={closeMenu}>
              Para profesionales
            </Link>
            <Link to="/contacto" onClick={closeMenu}>
              Contacto
            </Link>
          </nav>

          {/* Acciones móviles según haya o no sesión iniciada */}
          <div className={styles.mobileActions}>
            {isAuthenticated ? (
              <>
                {/* Mensaje informativo con el nombre del usuario */}
                <p className={styles.mobileUserText}>
                  Sesión iniciada como {user?.name || "usuario"}
                </p>

                {/* Acceso al dashboard */}
                <Link
                  to="/dashboard"
                  className={styles.mobileLoginButton}
                  onClick={closeMenu}
                >
                  Ir al dashboard
                </Link>

                {/* Botón para cerrar sesión */}
                <button
                  type="button"
                  className={styles.mobileLogoutButton}
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                {/* Accesos a login y registro para usuarios no autenticados */}
                <Link
                  to="/login"
                  className={styles.mobileLoginButton}
                  onClick={closeMenu}
                >
                  Iniciar sesión
                </Link>

                <Link
                  to="/register"
                  className={styles.mobileRegisterButton}
                  onClick={closeMenu}
                >
                  Regístrate
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Exporto el componente para poder usarlo en el layout principal.
export default Navbar;
