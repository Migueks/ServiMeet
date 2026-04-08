// Importo los estilos del componente.
import styles from "./Pagination.module.css";

// Esta función calcula qué páginas se deben mostrar en la paginación para no enseñar demasiados botones a la vez.
function getVisiblePages(currentPage, totalPages) {
  // Si hay 7 páginas o menos, las muestro todas.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  // Si estoy al principio, muestro las primeras páginas,
  // puntos suspensivos y la última.
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  // Si estoy al principio, muestro las primeras páginas,
  // puntos suspensivos y la última.
  if (currentPage >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // Si estoy en una zona intermedia, muestro la primera, puntos suspensivos, la página actual con sus vecinas, y la última.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

// Componente de paginación reutilizable.
function Pagination({ currentPage, totalPages, onPageChange }) {
  // Si solo hay una página o ninguna, no muestro la paginación.
  if (totalPages <= 1) return null;

  // Calculo qué botones de página deben verse.
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className={styles.pagination}>
      {/* Botón para ir a la página anterior */}
      <button
        type="button"
        className={styles.pageButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </button>

      {/* Bloque central con los números de página */}
      <div className={styles.pageNumbers}>
        {visiblePages.map((page, index) =>
          page === "..." ? (
            // Si el elemento son puntos suspensivos, lo muestro como texto.
            <span key={`dots-${index}`} className={styles.paginationDots}>
              ...
            </span>
          ) : (
            // Si es una página real, renderizo su botón.
            <button
              key={page}
              type="button"
              className={`${styles.pageNumber} ${
                currentPage === page ? styles.activePage : ""
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ),
        )}
      </div>

      {/* Botón para ir a la página siguiente */}
      <button
        type="button"
        className={styles.pageButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </div>
  );
}

// Exporto el componente para reutilizarlo donde haga falta.
export default Pagination;
