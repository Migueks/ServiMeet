// Importo hooks de React para guardar estado y ejecutar efectos
// cuando cambian las categorías recibidas.
import { useEffect, useState } from "react";

// Importo los estilos del componente.
import styles from "./HomeCategoriesSection.module.css";

// Esta función mezcla aleatoriamente un array.
// La uso para mostrar categorías distintas en la home.
function shuffleArray(array) {
  // Hago una copia para no modificar el array original recibido.
  const copy = [...array];

  // Recorro el array desde el final hasta el principio
  // e intercambio posiciones aleatorias.
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  // Devuelvo el array ya mezclado.
  return copy;
}

// Esta función calcula el precio más bajo de una categoría concreta
// usando la lista de servicios disponible.
function getLowestPriceByCategory(categoryId, services = []) {
  // Me quedo solo con los servicios que pertenecen a esa categoría.
  const categoryServices = services.filter(
    (service) => service.category?.id === categoryId,
  );

  // Si no hay servicios en esa categoría, devuelvo 0.
  if (categoryServices.length === 0) {
    return 0;
  }

  // Devuelvo el precio mínimo encontrado en los servicios filtrados.
  return Math.min(
    ...categoryServices.map((service) => Number(service.price) || 0),
  );
}

// Componente que muestra una selección aleatoria de categorías destacadas.
function HomeCategoriesSection({
  categories = [],
  services = [],
  onSelectCategory,
}) {
  // Estado donde guardo las categorías aleatorias que se mostrarán en la home.
  const [randomCategories, setRandomCategories] = useState([]);

  // Cada vez que cambian las categorías,
  // mezclo el array y me quedo solo con 8.
  useEffect(() => {
    setRandomCategories(shuffleArray(categories).slice(0, 8));
  }, [categories]);

  return (
    <section id="categorias" className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeading}>
          {/* Encabezado de la sección */}
          <span className={styles.sectionEyebrow}>Categorías</span>
          <h2>Categorías populares</h2>
          <p>
            Descubre algunas de las categorías más buscadas por los usuarios.
          </p>
        </div>

        {/* Si no hay categorías, muestro un mensaje vacío */}
        {categories.length === 0 ? (
          <p className={styles.emptyText}>
            Todavía no hay categorías disponibles.
          </p>
        ) : (
          // Si sí hay categorías, pinto la cuadrícula de tarjetas
          <div className={styles.categoriesGrid}>
            {randomCategories.map((category) => {
              // Calculo el precio más bajo de esa categoría
              // para mostrarlo en la tarjeta.
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
                  {/* Imagen de la categoría */}
                  <div className={styles.imageWrapper}>
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className={styles.categoryImage}
                    />
                  </div>

                  {/* Contenido textual de la tarjeta */}
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

// Exporto el componente para usarlo dentro de la página Home.
export default HomeCategoriesSection;
