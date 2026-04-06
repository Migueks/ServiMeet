import { useEffect, useState } from "react";
import styles from "./HomeCategoriesSection.module.css";

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function getLowestPriceByCategory(categoryId, services = []) {
  const categoryServices = services.filter(
    (service) => service.category?.id === categoryId,
  );

  if (categoryServices.length === 0) {
    return 0;
  }

  return Math.min(
    ...categoryServices.map((service) => Number(service.price) || 0),
  );
}

function HomeCategoriesSection({
  categories = [],
  services = [],
  onSelectCategory,
}) {
  const [randomCategories, setRandomCategories] = useState([]);

  useEffect(() => {
    setRandomCategories(shuffleArray(categories).slice(0, 8));
  }, [categories]);

  return (
    <section id="categorias" className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <span className={styles.sectionEyebrow}>Categorías</span>
          <h2>Categorías populares</h2>
          <p>
            Descubre algunas de las categorías más buscadas por los usuarios.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className={styles.emptyText}>
            Todavía no hay categorías disponibles.
          </p>
        ) : (
          <div className={styles.categoriesGrid}>
            {randomCategories.map((category) => {
              const lowestPrice = getLowestPriceByCategory(
                category.id,
                services,
              );

              return (
                <button
                  key={category.id}
                  type="button"
                  className={styles.categoryCard}
                  onClick={() => onSelectCategory(category.id)}
                >
                  <div className={styles.imageWrapper}>
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className={styles.categoryImage}
                    />
                  </div>

                  <div className={styles.cardContent}>
                    <h3>{category.name}</h3>
                    <p>Proyectos desde {Math.floor(lowestPrice)} €</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeCategoriesSection;
