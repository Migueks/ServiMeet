import styles from "./HomeHero.module.css";

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
  const formattedAverageRating = Number(stats.averageRating || 0).toFixed(1);
  const highlightedRating = Number(
    highlightedService?.averageRating || 0,
  ).toFixed(1);

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.top}>
          <span className={styles.badge}>Marketplace de servicios</span>

          <h1 className={styles.title}>
            Encuentra ayuda fiable para las tareas de tu día a día
          </h1>

          <p className={styles.subtitle}>
            Busca profesionales, compara servicios y envía solicitudes en pocos
            pasos.
          </p>

          <form className={styles.searchBox} onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="¿Qué servicio necesitas?"
              className={styles.searchInput}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />

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

            <button type="submit" className={styles.searchButton}>
              Buscar
            </button>
          </form>

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

        <div className={styles.featuredCard}>
          <div className={styles.featuredImageWrapper}>
            <img
              src="/image/home-hero.webp"
              alt="Profesional ofreciendo servicios a domicilio"
              className={styles.featuredImage}
            />
          </div>

          <div className={styles.featuredContent}>
            <span className={styles.featuredLabel}>Servicio destacado</span>

            <h3>{highlightedService?.title || "Servicio destacado"}</h3>

            <p>
              {highlightedService?.description ||
                "Explora servicios reales publicados por profesionales de distintas ciudades."}
            </p>

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

export default HomeHero;
