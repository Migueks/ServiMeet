import { Link, Outlet } from "react-router-dom";
import styles from "./AuthLayout.module.css";

function AuthLayout() {
  return (
    <div className={styles.authLayout}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.logo}>
          <img src="/image/logo.webp" alt="Logo ServiMeet" />
        </Link>
      </div>

      <Outlet />
    </div>
  );
}

export default AuthLayout;
