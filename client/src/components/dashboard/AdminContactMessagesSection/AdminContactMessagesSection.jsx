// Importo hooks de React para guardar estado local
// y memorizar los mensajes paginados.
import { useMemo, useState } from "react";
import Pagination from "../../common/Pagination/Pagination";

// Importo los estilos del componente.
import styles from "./AdminContactMessagesSection.module.css";

// Defino cuántos mensajes se mostrarán por página.
const ITEMS_PER_PAGE = 10;

// Función auxiliar para formatear la fecha del mensaje
// en un formato legible para España.
function formatDate(dateString) {
  return new Date(dateString).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Componente que muestra al admin los mensajes
// enviados desde el formulario de contacto.
function AdminContactMessagesSection({ adminContactMessages }) {
  // Estado local para controlar la página actual de la paginación.
  const [currentPage, setCurrentPage] = useState(1);

  // Calculo el número total de páginas.
  // Como mínimo habrá 1 para evitar problemas en la paginación.
  const totalPages = Math.max(
    1,
    Math.ceil(adminContactMessages.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Calculo qué mensajes se mostrarán en la página actual.
  // Uso useMemo para no recalcular el slice en cada render sin necesidad.
  const paginatedMessages = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return adminContactMessages.slice(start, end);
  }, [adminContactMessages, safeCurrentPage]);

  // Cambia la página actual si el valor recibido es válido.
  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        {/* Título principal de la sección */}
        <h2 className={styles.sectionTitle}>Mensajes de contacto</h2>

        {/* Texto resumen con el número total de mensajes */}
        <p className={styles.infoText}>
          {adminContactMessages.length}{" "}
          {adminContactMessages.length === 1
            ? "mensaje registrado"
            : "mensajes registrados"}
        </p>
      </div>

      {adminContactMessages.length === 0 ? (
        // Si no hay mensajes, muestro un mensaje vacío.
        <p className={styles.infoText}>
          No hay mensajes de contacto registrados.
        </p>
      ) : (
        <>
          {/* Listado de tarjetas de mensajes */}
          <div className={styles.cardsColumn}>
            {paginatedMessages.map((message) => (
              <article key={message.id} className={styles.card}>
                {/* Nombre de la persona que envió el mensaje */}
                <h3 className={styles.cardTitle}>{message.name}</h3>

                {/* Email de contacto */}
                <p className={styles.cardText}>
                  <strong>Email:</strong> {message.email}
                </p>

                {/* Ciudad del remitente */}
                <p className={styles.cardText}>
                  <strong>Ciudad:</strong> {message.city}
                </p>

                {/* Fecha de creación del mensaje formateada */}
                <p className={styles.cardText}>
                  <strong>Fecha:</strong> {formatDate(message.createdAt)}
                </p>

                {/* Contenido del mensaje */}
                <p className={styles.cardText}>
                  <strong>Mensaje:</strong> {message.message}
                </p>
              </article>
            ))}
          </div>

          {/* Paginación del listado de mensajes */}
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}

// Exporto el componente para usarlo dentro del dashboard.
export default AdminContactMessagesSection;
