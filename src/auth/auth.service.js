import { User } from '../../models/user.model.js';
import { hashPassword, verifyPassword } from '../../helpers/password.js';
import {
  generateAccessToken,
  generatePasswordResetToken,
  validatePasswordResetToken,
} from '../../helpers/jwt.js';

/**
 * Servicio de autenticación — replica la lógica de AuthService.cs del .NET.
 *
 * NOTA DE COMPATIBILIDAD:
 * Los frontends (Client-Admin y Client-User) envían los campos en camelCase:
 *   { cui, email, password, token, newPassword }
 * El .NET original usaba PascalCase:
 *   { CUI, Email, Password, Token, NewPassword }
 *
 * Este servicio normaliza ambas convenciones usando destructuring con alias.
 */

// Helper: extrae el valor del campo aceptando PascalCase y camelCase
const pick = (obj, pascal, camel) => obj[pascal] ?? obj[camel];

/**
 * Registra un nuevo usuario validando unicidad de CUI y Email.
 * Replica RegisterAsync(RegisterRequestDto).
 *
 * @param {object} dto - { CUI|cui, Email|email, Password|password }
 * @returns {{ token, userId, role }}
 */
export const register = async (dto) => {
  const CUI      = pick(dto, 'CUI', 'cui');
  const Email    = pick(dto, 'Email', 'email');
  const Password = pick(dto, 'Password', 'password');

  const existingByCui = await User.findOne({ where: { CUI } });
  if (existingByCui) throw new Error('El CUI ya está registrado.');

  const existingByEmail = await User.findOne({ where: { Email } });
  if (existingByEmail) throw new Error('El correo ya está en uso.');

  const user = await User.create({
    CUI,
    Email,
    PasswordHash: await hashPassword(Password),
    Role: 'User',
    IsActive: true,
    CreatedAt: new Date(),
  });

  const token = await generateAccessToken(user);

  // Payload idéntico al AuthResponseDto del .NET: { token, userId, role }
  return { token, userId: user.Id, role: user.Role };
};

/**
 * Autentica un usuario verificando CUI y contraseña BCrypt.
 * Replica LoginAsync(LoginRequestDto).
 *
 * @param {object} dto - { CUI|cui, Password|password }
 * @returns {{ token, userId, role }}
 */
export const login = async (dto) => {
  const CUI      = pick(dto, 'CUI', 'cui');
  const Password = pick(dto, 'Password', 'password');

  const user = await User.findOne({ where: { CUI } });

  const isValid = user ? await verifyPassword(Password, user.PasswordHash) : false;
  if (!user || !isValid) {
    const err = new Error('Credenciales inválidas.');
    err.statusCode = 401;
    throw err;
  }

  const token = await generateAccessToken(user);

  return { token, userId: user.Id, role: user.Role };
};

/**
 * Genera token temporal JWT de 15min para recuperación de contraseña.
 * Replica RequestPasswordResetAsync(PasswordRecoveryDto).
 *
 * @param {object} dto - { Email|email }
 * @returns {{ message, token }}
 */
export const requestPasswordReset = async (dto) => {
  const Email = pick(dto, 'Email', 'email');

  const user = await User.findOne({ where: { Email } });
  if (!user) throw new Error('Usuario no encontrado.');

  const token = await generatePasswordResetToken(user);

  return { message: 'Token generado exitosamente.', token };
};

/**
 * Valida el token de reset y actualiza la contraseña hasheada.
 * Replica ResetPasswordAsync(PasswordResetDto).
 *
 * @param {object} dto - { Email|email, Token|token, NewPassword|newPassword }
 */
export const resetPassword = async (dto) => {
  const Email       = pick(dto, 'Email', 'email');
  const Token       = pick(dto, 'Token', 'token');
  const NewPassword = pick(dto, 'NewPassword', 'newPassword');

  const user = await User.findOne({ where: { Email } });
  if (!user) throw new Error('Usuario no encontrado.');

  const isValid = validatePasswordResetToken(Token, Email);
  if (!isValid) {
    const err = new Error('Token inválido o expirado.');
    err.statusCode = 401;
    throw err;
  }

  user.PasswordHash = await hashPassword(NewPassword);
  await user.save();
};

/**
 * Obtiene todos los usuarios mapeados al formato UserResponseDto.
 * Replica GetAllUsersAsync() [Admin only].
 *
 * @returns {Array<{ id, cui, email, role, isActive, createdAt }>}
 */
export const getAllUsers = async () => {
  const users = await User.findAll({
    attributes: ['Id', 'CUI', 'Email', 'Role', 'IsActive', 'CreatedAt'],
    order: [['CreatedAt', 'ASC']],
  });

  return users.map((u) => ({
    id: u.Id,
    cui: u.CUI,
    email: u.Email,
    role: u.Role,
    isActive: u.IsActive,
    createdAt: u.CreatedAt,
  }));
};

/**
 * Registra un nuevo usuario con rol Admin.
 * Replica RegisterAdminAsync(RegisterRequestDto) [Admin only].
 *
 * @param {object} dto - { CUI|cui, Email|email, Password|password }
 * @returns {{ token, userId, role }}
 */
export const registerAdmin = async (dto) => {
  const CUI      = pick(dto, 'CUI', 'cui');
  const Email    = pick(dto, 'Email', 'email');
  const Password = pick(dto, 'Password', 'password');

  const existingByCui = await User.findOne({ where: { CUI } });
  if (existingByCui) throw new Error('El CUI ya está registrado.');

  const existingByEmail = await User.findOne({ where: { Email } });
  if (existingByEmail) throw new Error('El correo ya está en uso.');

  const user = await User.create({
    CUI,
    Email,
    PasswordHash: await hashPassword(Password),
    Role: 'Admin',
    IsActive: true,
    CreatedAt: new Date(),
  });

  const token = await generateAccessToken(user);

  return { token, userId: user.Id, role: user.Role };
};
