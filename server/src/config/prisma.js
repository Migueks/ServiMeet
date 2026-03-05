// Creo una instancia de PrismaClient para toda la app.
// En Prisma v7, para MySQL se usa un "driver adapter" (mariadb adapter funciona con MySQL también).
// Actúa como puente/traductor entre Prisma Client y el driver de JavaScript que conecta con la base de datos.

require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { DATABASE_URL } = process.env;

// Hago uso de la DATABASE_URL que está en "server/.env".
const adapter = new PrismaMariaDb(DATABASE_URL);

// Evito crear múltiples conexiones en desarrollo (si nodemon recarga, no se crea otro PrismaClient)

// 1º Guardo una referencia al objeto global de Node
const globalForPrisma = global;

// 2º Si existe globalForPrisma.prisma, reutilizo esa instancia; si no, creo una nueva.
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// 3º En desarrollo, guardo la instancia para que en la próxima recarga no se cree otra.
// En producción no la guardo en global para evitar usar globals innecesarios.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
