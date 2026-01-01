const pool = require('../config/database');
const { hashPassword } = require('../utils/auth');

// Crear tabla de usuarios
const createUserTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla users creada');
  } catch (err) {
    console.error('Error creando tabla users:', err);
  }
};

// Crear tabla de deudas
const createDebtsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS debts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
        paid_amount DECIMAL(10, 2) DEFAULT 0,
        is_paid BOOLEAN DEFAULT FALSE,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla debts creada');
  } catch (err) {
    console.error('Error creando tabla debts:', err);
  }
};

// Crear índices
const createIndexes = async () => {
  try {
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
      CREATE INDEX IF NOT EXISTS idx_debts_is_paid ON debts(is_paid);
    `);
    console.log('Índices creados');
  } catch (err) {
    console.error('Error creando índices:', err);
  }
};

// Registrar usuario
const registerUser = async (email, password, name) => {
  try {
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, hashedPassword, name]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Obtener usuario por email
const getUserByEmail = async (email) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Obtener usuario por ID
const getUserById = async (id) => {
  try {
    const result = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createUserTable,
  createDebtsTable,
  createIndexes,
  registerUser,
  getUserByEmail,
  getUserById,
};
