import { User } from './user.model.js';
import { hashPassword } from '../helpers/password.js';

/**
 * Seeder de datos iniciales.
 *
 * Replica exactamente el DataSeeder.cs del .NET (DataSeeder.SeedAdminAsync):
 *   1. Admin predeterminado 1 — CUI: 0000000000000 / admin@transmetro.com
 *   2. Admin predeterminado 2 — CUI: 1000000000001 / admin@tconecta.com
 *   3. Usuario ciudadano     — CUI: 2000000000002 / usuario@correo.com
 *
 * Las contraseñas se hashean con bcryptjs (compatible con BCrypt.Net)
 * para que sean idénticas a las del .NET.
 */
export const seedDatabase = async () => {
  // ── Admin predeterminado 1 ────────────────────────────────
  const admin1Exists = await User.findOne({ where: { CUI: '0000000000000' } });
  if (!admin1Exists) {
    await User.create({
      CUI: '0000000000000',
      Email: 'admin@transmetro.com',
      PasswordHash: await hashPassword('AdminTransmetro2026!'),
      Role: 'Admin',
      IsActive: true,
      CreatedAt: new Date(),
    });
    console.log('[TransmetroAuth] Seeder | Admin principal creado.');
  }

  // ── Admin predeterminado 2 (Guía de Pruebas) ─────────────
  const admin2Exists = await User.findOne({ where: { CUI: '1000000000001' } });
  if (!admin2Exists) {
    await User.create({
      CUI: '1000000000001',
      Email: 'admin@tconecta.com',
      PasswordHash: await hashPassword('Admin123!'),
      Role: 'Admin',
      IsActive: true,
      CreatedAt: new Date(),
    });
    console.log('[TransmetroAuth] Seeder | Admin de pruebas creado.');
  }

  // ── Usuario ciudadano predeterminado ─────────────────────
  const userExists = await User.findOne({ where: { CUI: '2000000000002' } });
  if (!userExists) {
    await User.create({
      CUI: '2000000000002',
      Email: 'usuario@correo.com',
      PasswordHash: await hashPassword('Usuario123!'),
      Role: 'User',
      IsActive: true,
      CreatedAt: new Date(),
    });
    console.log('[TransmetroAuth] Seeder | Usuario ciudadano creado.');
  }
};
