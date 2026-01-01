const pool = require('../config/database');

// Crear deuda
const createDebt = async (userId, description, amount, dueDate = null) => {
  try {
    const result = await pool.query(
      'INSERT INTO debts (user_id, description, amount, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, description, amount, dueDate]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Obtener deuda por ID
const getDebtById = async (debtId, userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM debts WHERE id = $1 AND user_id = $2',
      [debtId, userId]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Obtener todas las deudas de un usuario
const getDebtsByUser = async (userId, isPaid = null) => {
  try {
    let query = 'SELECT * FROM debts WHERE user_id = $1';
    const params = [userId];

    if (isPaid !== null) {
      query += ' AND is_paid = $2';
      params.push(isPaid);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    throw err;
  }
};

// Actualizar deuda
const updateDebt = async (debtId, userId, updates) => {
  try {
    // Verificar si la deuda existe y pertenece al usuario
    const debt = await getDebtById(debtId, userId);
    if (!debt) {
      throw new Error('Deuda no encontrada');
    }

    // No permitir editar deudas pagadas
    if (debt.is_paid) {
      throw new Error('No se puede editar una deuda pagada');
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    // Construir query dinámicamente
    Object.keys(updates).forEach(key => {
      if (key !== 'is_paid' || !debt.is_paid) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return debt;
    }

    values.push(debtId, userId);
    const query = `
      UPDATE debts 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Marcar deuda como pagada
const markDebtAsPaid = async (debtId, userId) => {
  try {
    const result = await pool.query(
      'UPDATE debts SET is_paid = TRUE, paid_amount = amount, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [debtId, userId]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Eliminar deuda
const deleteDebt = async (debtId, userId) => {
  try {
    const debt = await getDebtById(debtId, userId);
    if (!debt) {
      throw new Error('Deuda no encontrada');
    }

    const result = await pool.query(
      'DELETE FROM debts WHERE id = $1 AND user_id = $2 RETURNING *',
      [debtId, userId]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Obtener agregaciones de deudas
const getDebtAggregations = async (userId) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_debts,
        COUNT(CASE WHEN is_paid = FALSE THEN 1 END) as pending_count,
        COUNT(CASE WHEN is_paid = TRUE THEN 1 END) as paid_count,
        SUM(CASE WHEN is_paid = FALSE THEN amount ELSE 0 END) as pending_total,
        SUM(CASE WHEN is_paid = TRUE THEN amount ELSE 0 END) as paid_total,
        SUM(amount) as total_amount
      FROM debts
      WHERE user_id = $1
    `, [userId]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createDebt,
  getDebtById,
  getDebtsByUser,
  updateDebt,
  markDebtAsPaid,
  deleteDebt,
  getDebtAggregations,
};
