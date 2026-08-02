# TransmetroConecta Auth-Node

API REST de autenticación para TransmetroConecta. Esta es una reescritura en Node.js del Auth-Server originalmente desarrollado en .NET. Gestiona la autenticación de usuarios, roles, y permite realizar transacciones básicas integradas con otros servicios del sistema.

## Tech Stack

- **Entorno:** Node.js, Express.js 5
- **Base de Datos:** PostgreSQL con ORM Sequelize
- **Autenticación:** JSON Web Tokens (JWT), bcryptjs
- **Seguridad y Middlewares:** cors, helmet, express-rate-limit, express-validator
- **Herramientas de Desarrollo:** nodemon, cross-env, dotenv, morgan

## Estructura del Proyecto

```text
Auth-Node/
├── configs/            # Configuraciones globales (app, db, cors, helmet)
├── helpers/            # Funciones auxiliares y utilidades compartidas
├── middlewares/        # Middlewares de Express (validaciones, auth, rate limit)
├── models/             # Definiciones de modelos Sequelize (User, etc.)
├── src/                # Lógica principal de negocio
│   ├── auth/           # Módulo de Autenticación (Rutas, Controladores, Servicios)
│   └── transaction/    # Módulo de Transacciones (Recargas, Compra de tarjetas)
├── .env.example        # Ejemplo de variables de entorno requeridas
├── docker-compose.yml  # Configuración para entorno de contenedores
├── Dockerfile          # Instrucciones para la construcción de la imagen Docker
├── index.js            # Punto de entrada de la aplicación
└── package.json        # Dependencias y scripts de Node.js
```

## Configuración y Arranque

1. Clona el repositorio.
2. Instala las dependencias: `npm install` o `pnpm install`
3. Copia el archivo `.env.example` a `.env` y configura tus variables (conexión a DB, secretos JWT, etc.).
4. Ejecuta el servidor en modo desarrollo: `npm run dev`
5. O en modo producción: `npm run start`

## Endpoints de la API

La ruta base para la API es `/api`.

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registro de nuevos usuarios.
- `POST /api/auth/login` - Inicio de sesión (Retorna JWT).
- `POST /api/auth/recover-password` - Solicitud de recuperación de contraseña.
- `POST /api/auth/reset-password` - Restablecimiento de contraseña.
- `GET /api/auth/users` - Listado de usuarios (Requiere rol Admin y JWT).
- `POST /api/auth/register-admin` - Registro de un nuevo administrador (Requiere rol Admin y JWT).

### Transacciones (`/api/transaction`)
- `POST /api/transaction/recharge` - Recarga de saldo (Requiere JWT).
- `POST /api/transaction/purchase-card` - Compra de tarjeta (Requiere JWT).

### Salud y Estado
- `GET /` - Retorna un mensaje de bienvenida y estado general.
- `GET /api/health` - Health check del servicio.
