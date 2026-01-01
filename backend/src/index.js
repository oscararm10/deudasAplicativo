const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const debtRoutes = require('./routes/debtRoutes');
const { createUserTable, createDebtsTable, createIndexes } = require('./models/User');
const cacheService = require('./utils/cache');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/debts', debtRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error del servidor', error: err.message });
});

// Inicializar base de datos
const initDatabase = async () => {
  try {
    await createUserTable();
    await createDebtsTable();
    await createIndexes();
    console.log('Base de datos inicializada correctamente');
  } catch (err) {
    console.error('Error inicializando base de datos:', err);
  }
};

// Inicializar caché
const initCache = async () => {
  try {
    await cacheService.connect();
    console.log('Caché inicializado correctamente');
  } catch (err) {
    console.error('Error inicializando caché:', err);
  }
};

// Iniciar servidor
const startServer = async () => {
  await initDatabase();
  await initCache();

  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = app;
