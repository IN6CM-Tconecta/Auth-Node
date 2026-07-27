import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

/**
 * Modelo Sequelize de la entidad User.
 *
 * Replica 1:1 la entidad User.cs del dominio y la configuración
 * del AppDbContext.cs (HasKey, HasIndex IsUnique):
 *
 *   public Guid Id { get; set; }
 *   public string CUI { get; set; }       — UNIQUE
 *   public string Email { get; set; }     — UNIQUE
 *   public string PasswordHash { get; set; }
 *   public Role Role { get; set; }        — "User" | "Admin"
 *   public bool IsActive { get; set; }    — DEFAULT true
 *   public DateTime CreatedAt { get; set; }
 *
 * Tabla: transmetro_users (PostgreSQL)
 */
export const User = sequelize.define(
  'User',
  {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id',
    },
    CUI: {
      type: DataTypes.STRING(13),
      allowNull: false,
      unique: {
        name: 'uq_users_cui',
        msg: 'El CUI ya está registrado.',
      },
      field: 'cui',
    },
    Email: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: {
        name: 'uq_users_email',
        msg: 'El correo ya está en uso.',
      },
      field: 'email',
    },
    PasswordHash: {
      type: DataTypes.STRING(512),
      allowNull: false,
      field: 'password_hash',
    },
    Role: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'User',
      field: 'role',
      validate: {
        isIn: {
          args: [['User', 'Admin']],
          msg: 'El rol debe ser "User" o "Admin".',
        },
      },
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    tableName: 'transmetro_users',
    timestamps: false, // Gestionamos CreatedAt manualmente (igual que el .NET)
    indexes: [
      { unique: true, fields: ['cui'], name: 'uq_users_cui' },
      { unique: true, fields: ['email'], name: 'uq_users_email' },
    ],
  }
);
