import { body } from 'express-validator';

export const transactionValidation = [
  body('CardNumber')
    .trim()
    .notEmpty().withMessage('El número de tarjeta es requerido.')
    .isLength({ min: 15, max: 19 }).withMessage('La longitud de la tarjeta es inválida.'),

  body('ExpirationDate')
    .trim()
    .notEmpty().withMessage('La fecha de vencimiento es requerida.'),

  body('CVV')
    .trim()
    .notEmpty().withMessage('El CVV es requerido.')
    .isLength({ min: 3, max: 4 }).withMessage('El CVV debe tener entre 3 y 4 dígitos.')
    .matches(/^\d+$/).withMessage('El CVV solo debe contener dígitos.'),

  body('Amount')
    .notEmpty().withMessage('El monto es requerido.')
    .isFloat({ gt: 0 }).withMessage('El monto de recarga debe ser mayor a cero.'),
];
