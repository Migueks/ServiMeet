// Importo los estilos del componente.
import styles from "./HomeHero.module.css";

// Componente principal del hero de la página de inicio.
// Recibe el estado del buscador, listas de filtros,
// estadísticas generales y el servicio destacado.
function HomeHero({
  search,
  selectedCategory,
  selectedCity,
  categories = [],
  cities = [],
  onSearchChange,
  onCategoryChange,
  onCityChange,
  onSubmit,
  onFeaturedClick,
  stats = {
    totalServices: 0,
    professionals: 0,
    averageRating: 0,
  },
  highlightedService = null,
}) {
  // Formateo la valoración media global para mostrarla con un decimal.
  const formattedAverageRating = Number(stats.averageRating || 0).toFixed(1);

  // Formateo la valoración del servicio destacado para mostrarla con un decimal.
  const highlightedRating = Number(
    highlightedService?.averageRating || 0,
  ).toFixed(1);

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.top}>
          {/* Pequeña etiqueta descriptiva sobre la plataforma */}
          <span className={styles.badge}>Marketplace de servicios</span>

          {/* Título principal del hero */}
          <h1 className={styles.title}>
            Encuentra ayuda fiable para las tareas de tu día a día
          </h1>

          {/* Texto de apoyo explicando qué puede hacer el usuario */}
          <p className={styles.subtitle}>
            Busca profesionales, compara servicios y envía solicitudes en pocos
            pasos.
          </p>

          {/* Formulario principal de búsqueda */}
          <form className={styles.searchBox} onSubmit={onSubmit}>
            {/* Campo de texto para buscar por nombre o necesidad */}
            <input
              type="text"
              placeholder="¿Qué servicio necesitas?"
              className={styles.searchInput}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />

            {/* Selector de categoría */}
            <select
              className={styles.searchSelect}
              value={selectedCategory}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Selector de ciudad */}
            <select
              className={styles.searchSelect}
              value={selectedCity}
              onChange={(event) => onCityChange(event.target.value)}
            >
              <option value="">Todas las ciudades</option>
              {cities?.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>

            {/* Botón para lanzar la búsqueda */}
            <button type="submit" className={styles.searchButton}>
              Buscar
            </button>
          </form>

          {/* Bloque de estadísticas generales de la plataforma */}
          <div className={styles.stats}>
            <div>
              <strong>{stats.totalServices}</strong>
              <span>Servicios activos</span>
            </div>

            <div>
              <strong>{stats.professionals}</strong>
              <span>Profesionales visibles</span>
            </div>

            <div>
              <strong>{formattedAverageRating}/5</strong>
              <span>Valoración media</span>
            </div>
          </div>
        </div>

        {/* Tarjeta lateral con el servicio destacado */}
        <div className={styles.featuredCard}>
          <div className={styles.featuredImageWrapper}>
            <img
              src="/image/home-hero2.webp"
              alt="Profesional ofreciendo servicios a domicilio"
              className={styles.featuredImage}
            />
          </div>

          <div className={styles.featuredContent}>
            {/* Etiqueta visual para destacar la tarjeta */}
            <span className={styles.featuredLabel}>Servicio destacado</span>

            {/* Título del servicio destacado o texto por defecto */}
            <h3>{highlightedService?.title || "Servicio destacado"}</h3>

            {/* Descripción del servicio destacado o mensaje genérico */}
            <p>
              {highlightedService?.description ||
                "Explora servicios reales publicados por profesionales de distintas ciudades."}
            </p>

            {/* Lista corta con datos relevantes del servicio destacado */}
            <ul className={styles.featuredList}>
              <li>
                {highlightedService?.pro?.name
                  ? `Profesional: ${highlightedService.pro.name}`
                  : "Profesionales verificados"}
              </li>

              <li>
                {highlightedService?.city?.name
                  ? `${highlightedService.city.name} · ${
                      highlightedService.category?.name || "Sin categoría"
                    }`
                  : "Solicitudes rápidas"}
              </li>

              <li>
                {highlightedService
                  ? `${highlightedRating}/5 · ${
                      highlightedService.reviewsCount ?? 0
                    } reseñas`
                  : "Valoraciones de clientes"}
              </li>
            </ul>

            {/* Botón para ir al detalle del servicio destacado */}
            <button
              type="button"
              className={styles.featuredButton}
              onClick={onFeaturedClick}
              disabled={!highlightedService?.id}
            >
              Ver servicio destacado
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Exporto el componente para usarlo en la página Home.
export default HomeHero;
