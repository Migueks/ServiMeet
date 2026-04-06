import styles from "./ServiceDescriptionCard.module.css";

function ServiceDescriptionCard({ description }) {
  return (
    <div className={styles.card}>
      <h2>Descripción del servicio</h2>
      <p>{description}</p>
    </div>
  );
}

export default ServiceDescriptionCard;
