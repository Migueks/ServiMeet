import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Navbar.module.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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

  function handleLogout() {
    logout();
    closeMenu();
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} onClick={handleHomeClick}>
          <img src="/image/logo.webp" alt="Logo ServiMeet" />
        </Link>

        <nav className={styles.nav}>
          <Link to="/services">Servicios</Link>
          <Link to="/profesionales">Para profesionales</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <span className={styles.userBadge}>
                {user?.name?.split(" ")[0] || "Usuario"}
              </span>

              <Link to="/dashboard" className={styles.loginButton}>
                Dashboard
              </Link>

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
              <Link to="/login" className={styles.loginButton}>
                Iniciar sesión
              </Link>

              <Link to="/register" className={styles.registerButton}>
                Regístrate
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
        >
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

      <div
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <div className={`container ${styles.mobileMenuInner}`}>
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

          <div className={styles.mobileActions}>
            {isAuthenticated ? (
              <>
                <p className={styles.mobileUserText}>
                  Sesión iniciada como {user?.name || "usuario"}
                </p>

                <Link
                  to="/dashboard"
                  className={styles.mobileLoginButton}
                  onClick={closeMenu}
                >
                  Ir al dashboard
                </Link>

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

export default Navbar;
