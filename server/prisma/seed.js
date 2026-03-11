// Importo bcrypt completo para poder usar bcrypt.hash(...)
const bcrypt = require("bcrypt");

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

// Helper para crear o actualizar un usuario demo sin duplicarlo.
// Usa el email como campo único para hacer el upsert.
async function upsertDemoUser({ name, email, password, role }) {
  // Hasheo la contraseña antes de guardarla en base de datos.
  const hashedPassword = await bcrypt.hash(password, 10);

  // upsert:
  // Si ya existe un usuario con ese email, lo actualiza, si no existe, lo crea
  return prisma.user.upsert({
    // Busco el usuario por email porque debe ser único.
    where: { email },
    // Si el usuario ya existe, actualizo estos campos.
    update: {
      name,
      password: hashedPassword,
      role,
    },
    // Si el usuario no existe, lo creo con estos datos.
    create: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });
}

// Helper para crear o actualizar un servicio demo sin duplicarlo.
// Tomo como referencia title + professionalId para evitar duplicados del mismo pro.
async function upsertDemoService({
  title,
  description,
  category,
  price,
  zone,
  professionalId,
}) {
  // Busco primero si ya existe un servicio con ese título perteneciente a ese profesional.
  const existingService = await prisma.service.findFirst({
    where: {
      title,
      professionalId,
    },
  });

  // Si ya existe, actualizo sus datos principales.
  if (existingService) {
    return prisma.service.update({
      // Actualizo el servicio encontrado usando su id.
      where: { id: existingService.id },
      data: {
        description,
        category,
        price,
        zone,
        // Me aseguro de dejar el servicio activo.
        isActive: true,
      },
    });
  }

  // Si no existe, creo un nuevo servicio demo.
  return prisma.service.create({
    data: {
      title,
      description,
      category,
      price,
      zone,
      // El servicio se crea activo por defecto.
      isActive: true,
      // Estos campos se inicializan en null.
      imageUrl: null,
      imageId: null,
      // Relaciono el servicio con el profesional que lo publica.
      professionalId,
    },
  });
}

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

  // Creo o actualizo usuarios demo.
  const admin = await upsertDemoUser({
    name: "Admin Demo",
    email: "admin@servimeet.com",
    password: "Admin1234!",
    role: "ADMIN",
  });

  const pro = await upsertDemoUser({
    name: "Profesional Demo",
    email: "pro@servimeet.com",
    password: "Pro1234!",
    role: "PRO",
  });

  const client = await upsertDemoUser({
    name: "Cliente Demo",
    email: "client@servimeet.com",
    password: "Client1234!",
    role: "CLIENT",
  });

  // Creo o actualizo servicios demo asociados al usuario profesional.
  await upsertDemoService({
    title: "Clases particulares de inglés",
    description:
      "Profesor particular para Primaria y ESO. Refuerzo escolar, conversación y preparación de exámenes.",
    category: "Clases particulares",
    price: 15,
    zone: "Málaga",
    professionalId: pro.id,
  });

  await upsertDemoService({
    title: "Reparación básica de ordenadores",
    description:
      "Formateo, limpieza de virus, instalación de programas y mejora de rendimiento para portátiles y PC.",
    category: "Informática",
    price: 25,
    zone: "Málaga",
    professionalId: pro.id,
  });

  await upsertDemoService({
    title: "Paseo y cuidado de mascotas",
    description:
      "Paseos diarios, visitas a domicilio y cuidado puntual de perros y gatos en la zona.",
    category: "Mascotas",
    price: 12,
    zone: "Málaga",
    professionalId: pro.id,
  });

  // Saco por consola el Seed al completo y si se ha ejecutado correctamente
  console.log("Seed completado correctamente.");
  console.log("Usuarios demo creados o actualizados:");
  console.log("- ADMIN  -> admin@servimeet.com / Admin1234!");
  console.log("- PRO    -> pro@servimeet.com / Pro1234!");
  console.log("- CLIENT -> client@servimeet.com / Client1234!");
  console.log("Servicios demo creados o actualizados.");
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
