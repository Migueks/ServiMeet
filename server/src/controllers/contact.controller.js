const prisma = require("../config/prisma");
const { createContactSchema } = require("../schemas/contact.schema");

// Controlador para crear un nuevo mensaje de contacto
async function createContactMessage(req, res, next) {
  try {
    // Validamos los datos que llegan en el body de la petición
    const result = createContactSchema.safeParse(req.body);

    // Si la validación falla, devolvemos error 400 con los campos que tienen errores
    if (!result.success) {
      return res.status(400).json({
        message: "Datos no válidos",
        errors: result.error.flatten().fieldErrors,
      });
    }

    // Si los datos son válidos, guardamos el mensaje en la base de datos
    const contactMessage = await prisma.contactMessage.create({
      data: result.data,
    });

    // Responde con un 201 indicando que se ha creado correctamente
    // y devuelve solo algunos datos del mensaje guardado
    return res.status(201).json({
      message: "Mensaje enviado correctamente",
      contactMessage: {
        id: contactMessage.id,
        name: contactMessage.name,
        city: contactMessage.city,
        email: contactMessage.email,
        createdAt: contactMessage.createdAt,
      },
    });
  } catch (error) {
    // Si ocurre un error inesperado, lo paso al middleware global de errores
    next(error);
  }
}

module.exports = { createContactMessage };
