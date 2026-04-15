// Importo los estilos del componente.
import styles from "./ServiceDescriptionCard.module.css";

// Componente que muestra la descripción completa del servicio.
function ServiceDescriptionCard({ description }) {
  return (
    <div className={styles.card}>
      <h2>Descripción del servicio</h2>
      <p>{description}</p>
    </div>
  );
}

// Exporto el componente para usarlo dentro del detalle del servicio.
export default ServiceDescriptionCard;
