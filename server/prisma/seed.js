const bcrypt = require("bcrypt");
const prisma = require("../src/config/prisma");

const categories = [
  {
    name: "Limpieza",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925541/Limpieza_bbsjim.webp",
    imageId: "servimeet/categories/Limpieza_bbsjim",
  },
  {
    name: "Clases particulares",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925538/Clases_particulares_zcw1is.webp",
    imageId: "servimeet/categories/Clases_particulares_zcw1is",
  },
  {
    name: "Reparaciones",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925542/Reparaciones_sgfucw.webp",
    imageId: "servimeet/categories/Reparaciones_sgfucw",
  },
  {
    name: "Mudanzas",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925544/Mudanza_kawtzf.webp",
    imageId: "servimeet/categories/Mudanza_kawtzf",
  },
  {
    name: "Cuidado de mayores",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925541/Cuidado_mayores_bzyaom.webp",
    imageId: "servimeet/categories/Cuidado_mayores_bzyaom",
  },
  {
    name: "Cuidado infantil",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925541/Cuidado_infantil_x4xvjw.webp",
    imageId: "servimeet/categories/Cuidado_infantil_x4xvjw",
  },
  {
    name: "Mascotas",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925538/Mascotas_y8geox.webp",
    imageId: "servimeet/categories/Mascotas_y8geox",
  },
  {
    name: "Informática",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925539/Inform%C3%A1tica_aobip7.webp",
    imageId: "servimeet/categories/Informática_aobip7",
  },
  {
    name: "Diseño gráfico",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925538/Dise%C3%B1o_gr%C3%A1fico_gfkmxa.webp",
    imageId: "servimeet/categories/Diseño_gráfico_gfkmxa",
  },
  {
    name: "Fotografía",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925538/Fotograf%C3%ADa_ggqzx6.webp",
    imageId: "servimeet/categories/Fotografía_ggqzx6",
  },
  {
    name: "Jardinería",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925538/Jardiner%C3%ADa_hady8n.webp",
    imageId: "servimeet/categories/Jardinería_hady8n",
  },
  {
    name: "Belleza",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925537/Belleza_dahmpp.webp",
    imageId: "servimeet/categories/Belleza_dahmpp",
  },
  {
    name: "Pintura",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925537/Pintura_bvcs5c.webp",
    imageId: "servimeet/categories/Pintura_bvcs5c",
  },
  {
    name: "Electricidad",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925545/Electricidad_i3twbh.webp",
    imageId: "servimeet/categories/Electricidad_i3twbh",
  },
  {
    name: "Fontanería",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925544/Fontaner%C3%ADa_zli4ua.webp",
    imageId: "servimeet/categories/Fontanería_zli4ua",
  },
  {
    name: "Carpintería",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925546/Carpinter%C3%ADa_edyubi.webp",
    imageId: "servimeet/categories/Carpintería_edyubi",
  },
  {
    name: "Eventos",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925543/Eventos_hu3vrp.webp",
    imageId: "servimeet/categories/Eventos_hu3vrp",
  },
  {
    name: "Traducción",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925537/Traducci%C3%B3n_eytmav.webp",
    imageId: "servimeet/categories/Traducción_eytmav",
  },
  {
    name: "Entrenamiento personal",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925538/Entrenador_personal_wyzmfb.webp",
    imageId: "servimeet/categories/Entrenador_personal_wyzmfb",
  },
  {
    name: "Transporte",
    imageUrl:
      "https://res.cloudinary.com/dzbrjpnxm/image/upload/v1773925538/Transporte_kowkrs.webp",
    imageId: "servimeet/categories/Transporte_kowkrs",
  },
];

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

const BIG_CITIES = new Set([
  "Madrid",
  "Barcelona",
  "Valencia",
  "Sevilla",
  "Málaga",
  "Zaragoza",
  "Murcia",
  "Alicante",
  "Bilbao",
  "Las Palmas de Gran Canaria",
]);

const MEDIUM_CITIES = new Set([
  "La Coruña",
  "Granada",
  "Córdoba",
  "Cádiz",
  "Palma de Mallorca",
  "Valladolid",
  "Oviedo",
  "Pamplona",
  "Santander",
  "Tarragona",
  "Vitoria",
  "Santa Cruz de Tenerife",
]);

const maleNames = [
  "Alejandro",
  "Daniel",
  "Pablo",
  "Sergio",
  "Javier",
  "David",
  "Carlos",
  "Adrián",
  "Rubén",
  "Iván",
  "Álvaro",
  "Miguel",
  "Raúl",
  "Hugo",
  "Mario",
];

const femaleNames = [
  "Lucía",
  "María",
  "Carmen",
  "Paula",
  "Elena",
  "Marta",
  "Sara",
  "Andrea",
  "Laura",
  "Alba",
  "Claudia",
  "Nuria",
  "Irene",
  "Patricia",
  "Noelia",
];

const surnames = [
  "García",
  "Martín",
  "López",
  "Sánchez",
  "Pérez",
  "Gómez",
  "Ruiz",
  "Fernández",
  "Díaz",
  "Moreno",
  "Muñoz",
  "Romero",
  "Alonso",
  "Navarro",
  "Torres",
  "Domínguez",
  "Vázquez",
  "Ramos",
  "Gil",
  "Serrano",
];

const serviceTemplates = {
  Limpieza: {
    title: "Limpieza a domicilio",
    description:
      "Limpieza general del hogar, cocina, baños y mantenimiento puntual o semanal.",
    min: 12,
    max: 24,
  },
  "Clases particulares": {
    title: "Clases particulares personalizadas",
    description:
      "Apoyo escolar y refuerzo adaptado al nivel del alumno, con seguimiento cercano.",
    min: 12,
    max: 30,
  },
  Reparaciones: {
    title: "Reparaciones del hogar",
    description:
      "Arreglo de pequeñas averías domésticas y mantenimiento básico del hogar.",
    min: 20,
    max: 45,
  },
  Mudanzas: {
    title: "Ayuda para mudanzas",
    description:
      "Servicio de apoyo para mudanzas, carga, descarga y organización de cajas.",
    min: 25,
    max: 60,
  },
  "Cuidado de mayores": {
    title: "Cuidado de mayores a domicilio",
    description:
      "Atención cercana, compañía y apoyo en tareas diarias para personas mayores.",
    min: 14,
    max: 28,
  },
  "Cuidado infantil": {
    title: "Cuidado infantil por horas",
    description:
      "Servicio de cuidado infantil responsable, dinámico y adaptado a cada familia.",
    min: 12,
    max: 22,
  },
  Mascotas: {
    title: "Cuidado y paseo de mascotas",
    description:
      "Paseos, visitas y atención personalizada para perros y otras mascotas.",
    min: 10,
    max: 20,
  },
  Informática: {
    title: "Soporte informático a domicilio",
    description:
      "Ayuda con ordenadores, optimización, instalación de programas y problemas comunes.",
    min: 18,
    max: 40,
  },
  "Diseño gráfico": {
    title: "Diseño gráfico para negocios",
    description:
      "Creación de piezas visuales, carteles, publicaciones y material promocional.",
    min: 20,
    max: 45,
  },
  Fotografía: {
    title: "Sesión de fotografía",
    description:
      "Fotografía para eventos, retratos, redes sociales o pequeños negocios.",
    min: 30,
    max: 70,
  },
  Jardinería: {
    title: "Mantenimiento de jardines",
    description:
      "Cuidado básico de jardines, poda ligera y mantenimiento de zonas exteriores.",
    min: 15,
    max: 35,
  },
  Belleza: {
    title: "Servicio de belleza a domicilio",
    description:
      "Maquillaje, peinado y cuidados de belleza para ocasiones especiales o rutina.",
    min: 18,
    max: 40,
  },
  Pintura: {
    title: "Trabajos de pintura",
    description:
      "Pintura de interiores, retoques y renovación visual de estancias del hogar.",
    min: 25,
    max: 55,
  },
  Electricidad: {
    title: "Servicio básico de electricidad",
    description:
      "Instalaciones y reparaciones eléctricas sencillas en viviendas y locales.",
    min: 25,
    max: 60,
  },
  Fontanería: {
    title: "Servicio de fontanería",
    description:
      "Reparación de grifos, fugas y problemas habituales de fontanería doméstica.",
    min: 25,
    max: 60,
  },
  Carpintería: {
    title: "Trabajos de carpintería",
    description:
      "Montaje, ajustes y pequeñas reparaciones en muebles, puertas y estructuras de madera.",
    min: 25,
    max: 55,
  },
  Eventos: {
    title: "Ayuda para organización de eventos",
    description:
      "Apoyo en la preparación, coordinación y asistencia en eventos y celebraciones.",
    min: 20,
    max: 50,
  },
  Traducción: {
    title: "Servicio de traducción",
    description:
      "Traducción de textos y revisión lingüística para documentos y contenidos digitales.",
    min: 15,
    max: 35,
  },
  "Entrenamiento personal": {
    title: "Entrenamiento personal",
    description:
      "Sesiones personalizadas para mejorar forma física, hábitos y objetivos deportivos.",
    min: 18,
    max: 40,
  },
  Transporte: {
    title: "Servicio de transporte y recados",
    description:
      "Apoyo en desplazamientos, recogidas, entregas y pequeños recados urbanos.",
    min: 15,
    max: 35,
  },
};

const requestMessages = [
  "Necesito este servicio para los próximos días. Me interesa recibir confirmación cuanto antes.",
  "Busco una persona responsable y con experiencia. El horario sería flexible.",
  "Quiero comparar opciones y cerrar el servicio esta semana si todo encaja.",
  "Necesito ayuda puntual y me gustaría saber disponibilidad aproximada.",
  "Estoy buscando a alguien de confianza para este trabajo en mi zona.",
  "Me interesa este servicio y quisiera más información antes de confirmar.",
  "Tengo disponibilidad por las tardes y me gustaría concretar presupuesto.",
  "Querría dejarlo cerrado cuanto antes si hay disponibilidad esta semana.",
  "Es un servicio que necesito pronto y valoro buena comunicación.",
  "Me interesa contratarlo y resolver algunas dudas antes de avanzar.",
];

const reviewCommentsByRating = {
  5: [
    "Muy buen profesional, puntual y todo salió perfecto.",
    "Experiencia excelente. Repetiría sin duda.",
    "Trabajo muy bien hecho y trato muy cercano.",
    "Todo genial, rápido y con muy buena atención.",
    "Muy recomendable. Cumplió exactamente con lo acordado.",
  ],
  4: [
    "Buen servicio y buena atención en general.",
    "Quedé contento con el resultado final.",
    "Profesional serio y trabajo correcto.",
    "La experiencia fue buena y repetiría.",
    "Todo bastante bien y sin problemas.",
  ],
  3: [
    "Servicio aceptable y correcto en líneas generales.",
    "Cumplió con lo básico y el trato fue bueno.",
    "Resultado correcto, aunque mejorable en algunos detalles.",
    "Una experiencia normal, sin incidencias importantes.",
    "Trabajo aceptable y buena disposición.",
  ],
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function upsertDemoUser({ name, email, password, role, city = null }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role,
      city,
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role,
      city,
    },
  });
}

async function upsertDemoService({
  title,
  description,
  categoryName,
  cityName,
  price,
  proId,
}) {
  const category = await prisma.category.findUnique({
    where: { name: categoryName },
    select: { id: true },
  });

  const city = await prisma.city.findUnique({
    where: { name: cityName },
    select: { id: true },
  });

  if (!category || !city) {
    throw new Error(
      `Categoría o ciudad no encontradas para el servicio: ${title}`,
    );
  }

  const existingService = await prisma.service.findFirst({
    where: {
      title,
      proId,
    },
  });

  if (existingService) {
    return prisma.service.update({
      where: { id: existingService.id },
      data: {
        description,
        price,
        categoryId: category.id,
        cityId: city.id,
        isActive: true,
      },
    });
  }

  return prisma.service.create({
    data: {
      title,
      description,
      price,
      categoryId: category.id,
      cityId: city.id,
      proId,
      imageUrl: null,
      imageId: null,
      isActive: true,
    },
  });
}

function buildMassiveUsers(cityRows, hashedPassword) {
  const users = [];

  cityRows.forEach((city, cityIndex) => {
    for (let i = 0; i < 10; i++) {
      const isFemale = i % 2 === 0;
      const role = i < 5 ? "CLIENT" : "PRO";

      const firstName = isFemale
        ? femaleNames[(cityIndex + i) % femaleNames.length]
        : maleNames[(cityIndex + i) % maleNames.length];

      const surname1 = surnames[(cityIndex + i) % surnames.length];
      const surname2 = surnames[(cityIndex + i + 7) % surnames.length];

      const name = `${firstName} ${surname1} ${surname2}`;

      const email = `${slugify(firstName)}.${slugify(surname1)}.${slugify(
        surname2,
      )}.${slugify(city.name)}.${i + 1}@servimeetdemo.com`;

      users.push({
        name,
        email,
        password: hashedPassword,
        role,
        city: city.name,
        avatarUrl: null,
      });
    }
  });

  return users;
}

async function seedMassiveUsers() {
  const PASSWORD_PLAIN = "Demo1234!";
  const hashedPassword = await bcrypt.hash(PASSWORD_PLAIN, 10);

  const cityRows = await prisma.city.findMany({
    orderBy: { id: "asc" },
  });

  const users = buildMassiveUsers(cityRows, hashedPassword);

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  const clientsCount = await prisma.user.count({
    where: { role: "CLIENT" },
  });

  const prosCount = await prisma.user.count({
    where: { role: "PRO" },
  });

  console.log("✅ Usuarios masivos creados correctamente");
  console.log(`➡️ Total usuarios generados: ${users.length}`);
  console.log(`➡️ CLIENT: ${clientsCount}`);
  console.log(`➡️ PRO: ${prosCount}`);
  console.log(`➡️ Password común demo: ${PASSWORD_PLAIN}`);
}

function getServicesCountForCity(cityName) {
  if (BIG_CITIES.has(cityName)) return 14;
  if (MEDIUM_CITIES.has(cityName)) return 10;
  return 6;
}

function buildPrice(min, max, cityIndex, serviceIndex) {
  const steps = (max - min) * 2;
  const variation = (cityIndex * 7 + serviceIndex * 3) % (steps + 1);
  return Number((min + variation / 2).toFixed(2));
}

async function seedMassiveServices() {
  const cityRows = await prisma.city.findMany({
    orderBy: { id: "asc" },
  });

  const pros = await prisma.user.findMany({
    where: { role: "PRO" },
    select: {
      id: true,
      city: true,
    },
    orderBy: [{ city: "asc" }, { id: "asc" }],
  });

  const prosByCity = new Map();

  for (const pro of pros) {
    if (!pro.city) continue;

    if (!prosByCity.has(pro.city)) {
      prosByCity.set(pro.city, []);
    }

    prosByCity.get(pro.city).push(pro);
  }

  const categoryNames = Object.keys(serviceTemplates);
  let expectedServices = 0;

  for (let cityIndex = 0; cityIndex < cityRows.length; cityIndex++) {
    const city = cityRows[cityIndex];
    const cityPros = prosByCity.get(city.name) || [];

    if (!cityPros.length) {
      console.log(`⚠️ No hay PROs en ${city.name}, se omite.`);
      continue;
    }

    const servicesCount = getServicesCountForCity(city.name);
    expectedServices += servicesCount;

    for (let i = 0; i < servicesCount; i++) {
      const categoryName =
        categoryNames[(cityIndex + i) % categoryNames.length];
      const template = serviceTemplates[categoryName];
      const pro = cityPros[i % cityPros.length];
      const price = buildPrice(template.min, template.max, cityIndex, i);

      await upsertDemoService({
        title: template.title,
        description: `${template.description} Disponible en ${city.name} con atención profesional y presupuesto claro.`,
        categoryName,
        cityName: city.name,
        price,
        proId: pro.id,
      });
    }
  }

  const totalServices = await prisma.service.count();

  console.log("✅ Servicios masivos creados correctamente");
  console.log(`➡️ Servicios esperados en esta fase: ${expectedServices}`);
  console.log(`➡️ Total servicios en BD: ${totalServices}`);
}

function getRequestsCountForCity(cityName) {
  if (BIG_CITIES.has(cityName)) return 8;
  if (MEDIUM_CITIES.has(cityName)) return 5;
  return 3;
}

function getRequestStatus(cityIndex, requestIndex) {
  const statuses = [
    "DONE",
    "DONE",
    "DONE",
    "DONE",
    "DONE",
    "DONE",
    "ACCEPTED",
    "PENDING",
    "REJECTED",
    "CANCELLED",
  ];

  return statuses[(cityIndex + requestIndex) % statuses.length];
}

function buildBudget(price, cityIndex, requestIndex) {
  const multipliers = [0.9, 1, 1.05, 1.1, 1.15];
  const multiplier =
    multipliers[(cityIndex + requestIndex) % multipliers.length];
  return Number((price * multiplier).toFixed(2));
}

function buildFutureDate(cityIndex, requestIndex) {
  const date = new Date();
  const offsetDays = ((cityIndex * 11 + requestIndex * 7) % 45) + 1;
  date.setDate(date.getDate() + offsetDays);
  return date;
}

function buildPastDate(cityIndex, requestIndex, extra = 0) {
  const date = new Date();
  const offsetDays = ((cityIndex * 13 + requestIndex * 5 + extra) % 120) + 1;
  date.setDate(date.getDate() - offsetDays);
  return date;
}

function buildReviewRating(cityIndex, requestIndex) {
  const ratings = [5, 5, 4, 5, 4, 3, 5, 4, 5, 4];
  return ratings[(cityIndex + requestIndex) % ratings.length];
}

function buildReviewComment(rating, cityIndex, requestIndex) {
  const comments = reviewCommentsByRating[rating] || reviewCommentsByRating[4];
  return comments[(cityIndex + requestIndex) % comments.length];
}

async function upsertDemoRequest({
  serviceId,
  clientId,
  proId,
  message,
  dateNeeded,
  budget,
  status,
  createdAt,
}) {
  const existingRequest = await prisma.request.findFirst({
    where: {
      serviceId,
      clientId,
      message,
    },
    select: {
      id: true,
    },
  });

  if (existingRequest) {
    return prisma.request.update({
      where: { id: existingRequest.id },
      data: {
        proId,
        dateNeeded,
        budget,
        status,
      },
    });
  }

  return prisma.request.create({
    data: {
      serviceId,
      clientId,
      proId,
      message,
      dateNeeded,
      budget,
      status,
      createdAt,
    },
  });
}

async function upsertDemoReview({
  requestId,
  serviceId,
  clientId,
  proId,
  rating,
  comment,
  createdAt,
}) {
  return prisma.review.upsert({
    where: { requestId },
    update: {
      serviceId,
      clientId,
      proId,
      rating,
      comment,
    },
    create: {
      requestId,
      serviceId,
      clientId,
      proId,
      rating,
      comment,
      createdAt,
    },
  });
}

async function seedMassiveRequestsAndReviews() {
  const cityRows = await prisma.city.findMany({
    orderBy: { id: "asc" },
  });

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    select: {
      id: true,
      city: true,
    },
    orderBy: [{ city: "asc" }, { id: "asc" }],
  });

  const services = await prisma.service.findMany({
    select: {
      id: true,
      title: true,
      price: true,
      proId: true,
      city: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ cityId: "asc" }, { id: "asc" }],
  });

  const clientsByCity = new Map();
  const servicesByCity = new Map();

  for (const client of clients) {
    if (!client.city) continue;

    if (!clientsByCity.has(client.city)) {
      clientsByCity.set(client.city, []);
    }

    clientsByCity.get(client.city).push(client);
  }

  for (const service of services) {
    const cityName = service.city?.name;
    if (!cityName) continue;

    if (!servicesByCity.has(cityName)) {
      servicesByCity.set(cityName, []);
    }

    servicesByCity.get(cityName).push(service);
  }

  let expectedRequests = 0;
  let expectedReviews = 0;

  for (let cityIndex = 0; cityIndex < cityRows.length; cityIndex++) {
    const city = cityRows[cityIndex];
    const cityClients = clientsByCity.get(city.name) || [];
    const cityServices = servicesByCity.get(city.name) || [];

    if (!cityClients.length || !cityServices.length) {
      console.log(`⚠️ Faltan clientes o servicios en ${city.name}, se omite.`);
      continue;
    }

    const requestsCount = getRequestsCountForCity(city.name);
    expectedRequests += requestsCount;

    for (let i = 0; i < requestsCount; i++) {
      const client = cityClients[(cityIndex + i) % cityClients.length];
      const service = cityServices[(cityIndex * 2 + i) % cityServices.length];
      const status = getRequestStatus(cityIndex, i);
      const messageBase =
        requestMessages[(cityIndex + i) % requestMessages.length];
      const message = `Solicitud demo ${city.name} #${i + 1}: ${messageBase}`;
      const budget = buildBudget(service.price, cityIndex, i);
      const dateNeeded =
        status === "REJECTED" || status === "CANCELLED"
          ? null
          : buildFutureDate(cityIndex, i);
      const requestCreatedAt = buildPastDate(cityIndex, i);

      const request = await upsertDemoRequest({
        serviceId: service.id,
        clientId: client.id,
        proId: service.proId,
        message,
        dateNeeded,
        budget,
        status,
        createdAt: requestCreatedAt,
      });

      if (status === "DONE") {
        const rating = buildReviewRating(cityIndex, i);
        const comment = buildReviewComment(rating, cityIndex, i);
        const reviewCreatedAt = buildPastDate(cityIndex, i, 3);

        await upsertDemoReview({
          requestId: request.id,
          serviceId: service.id,
          clientId: client.id,
          proId: service.proId,
          rating,
          comment,
          createdAt: reviewCreatedAt,
        });

        expectedReviews += 1;
      }
    }
  }

  const totalRequests = await prisma.request.count();
  const totalReviews = await prisma.review.count();

  console.log("✅ Requests y reviews creados correctamente");
  console.log(`➡️ Requests esperados en esta fase: ${expectedRequests}`);
  console.log(`➡️ Reviews esperadas en esta fase: ${expectedReviews}`);
  console.log(`➡️ Total requests en BD: ${totalRequests}`);
  console.log(`➡️ Total reviews en BD: ${totalReviews}`);
}

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {
        imageUrl: category.imageUrl,
        imageId: category.imageId,
      },
      create: {
        name: category.name,
        imageUrl: category.imageUrl,
        imageId: category.imageId,
      },
    });
  }

  for (const name of cities) {
    await prisma.city.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  await seedMassiveUsers();

  const admin = await upsertDemoUser({
    name: "Admin Demo",
    email: "admin@servimeet.com",
    password: "Admin1234!",
    role: "ADMIN",
    city: "Madrid",
  });

  await seedMassiveServices();
  await seedMassiveRequestsAndReviews();

  console.log("✅ Seed completado correctamente");
  console.log(`Admin demo: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("❌ Error ejecutando el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
