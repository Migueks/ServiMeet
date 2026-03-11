// Importo la instancia de Prisma ya configurada para poder interactuar con la base de datos.
const prisma = require("../src/config/prisma");

// Array con las categorías iniciales que quiero insertar en la base de datos.
const categories = [
  "Limpieza",
  "Clases particulares",
  "Reparaciones",
  "Mudanzas",
  "Cuidado de mayores",
  "Cuidado infantil",
  "Mascotas",
  "Informática",
  "Diseño gráfico",
  "Fotografía",
  "Jardinería",
  "Belleza",
  "Pintura",
  "Electricidad",
  "Fontanería",
  "Carpintería",
  "Eventos",
  "Traducción",
  "Entrenamiento personal",
  "Transporte",
];

// Array con las ciudades iniciales que quiero insertar en la base de datos.
const cities = [
  "Albacete",
  "Alicante",
  "Almería",
  "Ávila",
  "Badajoz",
  "Barcelona",
  "Bilbao",
  "Burgos",
  "Cáceres",
  "Cádiz",
  "Castellón de la Plana",
  "Ceuta",
  "Ciudad Real",
  "Córdoba",
  "Cuenca",
  "Gerona",
  "Granada",
  "Guadalajara",
  "Huelva",
  "Huesca",
  "Jaén",
  "La Coruña",
  "Las Palmas de Gran Canaria",
  "León",
  "Lérida",
  "Logroño",
  "Lugo",
  "Madrid",
  "Málaga",
  "Melilla",
  "Murcia",
  "Orense",
  "Oviedo",
  "Palencia",
  "Palma de Mallorca",
  "Pamplona",
  "Pontevedra",
  "Salamanca",
  "Santander",
  "San Sebastián",
  "Santa Cruz de Tenerife",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Teruel",
  "Toledo",
  "Valencia",
  "Valladolid",
  "Vitoria",
  "Zamora",
  "Zaragoza",
];

// Función principal que ejecuta el seed.
async function main() {
  // Recorro todas las categorías y hago un upsert:
  // Si ya existe una categoría con ese nombre, no hago cambios, si no existe, la creo.
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Recorro todas las ciudades y hago un upsert:
  // Si ya existe una ciudad con ese nombre, no hago cambios, si no existe, la creo.
  for (const name of cities) {
    await prisma.city.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Muestro un mensaje en consola cuando el seed termina correctamente.
  console.log("Seed completado: categorías y ciudades creadas.");
}

// Ejecuto la función principal.
main()
  .catch((error) => {
    // Si ocurre un error durante la ejecución del seed, lo muestro por consola y cierro el proceso con código de error.
    console.error("Error al ejecutar el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    // Cierro la conexión con la base de datos al finalizar, tanto si todo ha ido bien como si ha fallado.
    await prisma.$disconnect();
  });
