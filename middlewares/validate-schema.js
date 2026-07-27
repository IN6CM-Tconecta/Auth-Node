import { validationResult } from 'express-validator';

/**
 * Middleware de validación de esquema de request body.
 *
 * Replica el ValidationFilterAttribute.cs del .NET que devuelve 400
 * con un listado estructurado de errores cuando ModelState no es válido.
 *
 * Debe usarse DESPUÉS de los arrays de validaciones de express-validator.
 *
 * Respuesta de error compatible con los clientes existentes:
 *   { message: "Validation failed.", errors: [{ field, message }] }
 */
export const validateSchema = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));

    return res.status(400).json({
      message: 'Validation failed.',
      errors: formatted,
    });
  }

  next();
};
