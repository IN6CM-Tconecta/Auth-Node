import { body } from 'express-validator';

/**
 * Validaciones de auth.
 * Se asume que el request body ya fue normalizado a PascalCase por el
 * middleware normalizeAuthBody para cumplir el contrato del .NET original.
 */

export const registerValidation = [
  body('CUI')
    .trim()
    .notEmpty().withMessage('El CUI es requerido.')
    .isLength({ min: 13, max: 13 }).withMessage('El CUI debe tener exactamente 13 dígitos.')
    .matches(/^[0-9]+$/).withMessage('El CUI solo debe contener números.'),

  body('Email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es requerido.')
    .isEmail().withMessage('El formato del correo electrónico es inválido.')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('Password')
    .notEmpty().withMessage('La contraseña es requerida.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
];

export const loginValidation = [
  body('CUI')
    .trim()
    .notEmpty().withMessage('El CUI es requerido.')
    .isLength({ min: 13, max: 13 }).withMessage('El CUI debe tener exactamente 13 dígitos.')
    .matches(/^[0-9]+$/).withMessage('El CUI solo debe contener números.'),

  body('Password')
    .notEmpty().withMessage('La contraseña es requerida.'),
];

export const recoverPasswordValidation = [
  body('Email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es requerido.')
    .isEmail().withMessage('El formato del correo electrónico es inválido.')
    .normalizeEmail({ gmail_remove_dots: false }),
];

export const resetPasswordValidation = [
  body('Email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es requerido.')
    .isEmail().withMessage('El formato del correo electrónico es inválido.')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('Token')
    .trim()
    .notEmpty().withMessage('El token de restablecimiento es requerido.'),

  body('NewPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida.')
    .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres.'),
];
