# Gestor de Deudas entre amigos

Una aplicación para gestionar deudas entre amigos con una API REST backend y frontend React.

## Características

### Backend
- **Autenticación segura**: Registro y login con contraseñas encriptadas (bcryptjs)
- **API REST**: Endpoints completos para CRUD de deudas
- **Base de datos**: PostgreSQL para persistencia de datos
- **Caché**: Redis para optimizar consultas frecuentes
- **Validaciones**: Validaciones de datos en tiempo de creación y actualización
- **Autorización**: Middleware JWT para proteger endpoints
- **Agregaciones**: Endpoints para obtener estadísticas de deudas
- **Exportación**: Descargar deudas en JSON y CSV
- **Tests**: Tests unitarios con Jest

### Frontend
- **Login/Registro**: Pantalla de autenticación completa
- **Dashboard**: Vista principal con estadísticas
- **CRUD completo**: Crear, leer, editar y eliminar deudas
- **Filtros**: Filtrar por pendientes/pagadas/todas
- **Diseño responsivo**: Adaptable a dispositivos móviles
- **UI moderna**: Interfaz minimalista y limpia
- **Iconos**: React Icons para mejor UX

## Requisitos

- Node.js >= 14
- PostgreSQL >= 12
- Redis (opcional, se ejecutará en modo degradado sin él)
- npm o yarn

## Creación de la base de datos (PostgreSQL)

Para crear la base de datos y tablas manualmente o con Docker.

1) Opción manual (psql como usuario postgres):
```sql
-- Conectar como postgres y crear DB/usuario
CREATE DATABASE deudas_db;
CREATE USER deudas_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE deudas_db TO deudas_user;

-- Conectarse a la DB
\c deudas_db;

-- Crear tablas
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS debts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_is_paid ON debts(is_paid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

2) Opción con Docker (rápido):
```bash
# Postgres con usuario y base ya creados
docker run --name postgres-deudas \
  -e POSTGRES_USER=deudas_user \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=deudas_db \
  -p 5432:5432 -d postgres:13
```

3) Opción automática (script Node):
- Si existe backend/scripts/init-db.js o con init-db.js (esta en la raiz del proyecto)
```bash
cd backend
node scripts/init-db.js
```

O

```bash
cd backend
node init-db.js
```

4) Ajustes y permisos
- Si creaste tablas como otro usuario, conecta como postgres y otorga permisos:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO deudas_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO deudas_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO deudas_user;
```

5) Variables .env (asegurarse de actualizar):
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=deudas_user
DB_PASSWORD=secure_password
DB_NAME=deudas_db
```

Nota: Si se usa Docker, esperar unos segundos tras levantar el contenedor antes de ejecutar el init script o iniciar el backend.

## Instalación

### Backend

1. Navega a la carpeta backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

4. Edita `.env` con tus credenciales de PostgreSQL y Redis

5. Inicia el servidor:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Frontend

1. Navega a la carpeta frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevos usuarios
- `POST /api/auth/login` - Iniciar sesión

### Deudas
- `POST /api/debts` - Crear una deuda
- `GET /api/debts` - Obtener deudas del usuario (con parámetro `isPaid` para filtrar)
- `GET /api/debts/:debtId` - Obtener una deuda específica
- `PUT /api/debts/:debtId` - Actualizar una deuda
- `PATCH /api/debts/:debtId/mark-paid` - Marcar deuda como pagada
- `DELETE /api/debts/:debtId` - Eliminar una deuda
- `GET /api/debts/aggregations/summary` - Obtener estadísticas
- `GET /api/debts/export/json` - Exportar deudas a JSON
- `GET /api/debts/export/csv` - Exportar deudas a CSV

## Validaciones

- No se pueden registrar deudas con valores negativos
- Una deuda pagada no puede ser modificada
- El email debe ser único
- La contraseña tiene mínimo 6 caracteres
- Autenticación mediante JWT

## Estructura del Proyecto

```
deudasAplicativo/
├── backend/
│   ├── src/
│   │   ├── config/        # Configuración de BD y Redis
│   │   ├── controllers/   # Lógica de negocios
│   │   ├── middleware/    # Autenticación y validaciones
│   │   ├── models/        # Interacción con base de datos
│   │   ├── routes/        # Rutas de la API
│   │   ├── utils/         # Funciones auxiliares
│   │   └── index.js       # Archivo principal
│   ├── tests/             # Tests unitarios
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Servicios API
│   │   ├── store/         # Estado global (Zustand)
│   │   ├── utils/         # Funciones auxiliares
│   │   ├── App.jsx
│   │   └── index.js
│   ├── public/
│   └── package.json
└── README.md
```

## Tests

Para ejecutar los tests del backend:

```bash
cd backend
npm test
```

## Tecnologías utilizadas

### Backend
- Express.js
- PostgreSQL
- Redis
- JWT (jsonwebtoken)
- bcryptjs

### Frontend
- React 18
- React Router v6
- Zustand (state management)
- Axios (HTTP client)
- React Icons

## Notas de Desarrollo

- La aplicación usa JWT para autenticación
- Los tokens expiran en 24 horas
- Redis se usa para caché con TTL de 1 hora
- Las contraseñas se encriptan con bcrypt (salt rounds: 10)
- Las deudas pagadas no pueden ser editadas
- Los montos deben ser mayores a 0

## Mejoras Futuras

- Autenticación con Google/GitHub
- Notificaciones de vencimiento de deudas
- Historial de pagos
- Categorías de deudas
- Compartir deudas con otros usuarios
- Aplicación móvil nativa
- Gráficos y reportes avanzados
