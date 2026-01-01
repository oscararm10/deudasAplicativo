const {
  createDebt,
  getDebtById,
  getDebtsByUser,
  updateDebt,
  markDebtAsPaid,
  deleteDebt,
  getDebtAggregations,
} = require('../models/Debt');
const cacheService = require('../utils/cache');
const Papa = require('papaparse');

// Crear deuda
const createNewDebt = async (req, res) => {
  try {
    const { description, amount, dueDate } = req.body;
    const userId = req.userId;

    // Validación de monto positivo
    if (amount <= 0) {
      return res.status(400).json({ message: 'El monto debe ser mayor a 0' });
    }

    const debt = await createDebt(userId, description, amount, dueDate);

    // Invalidar caché
    await cacheService.invalidateUserCache(userId);

    res.status(201).json({
      message: 'Deuda creada exitosamente',
      debt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear deuda', error: err.message });
  }
};

// Obtener deudas del usuario
const getUserDebts = async (req, res) => {
  try {
    const userId = req.userId;
    const { isPaid } = req.query;

    // Intentar obtener del caché
    const cacheKey = `user:${userId}:debts:${isPaid || 'all'}`;
    const cachedDebts = await cacheService.get(cacheKey);

    if (cachedDebts) {
      return res.json({
        message: 'Deudas obtenidas (caché)',
        debts: cachedDebts,
      });
    }

    const debts = await getDebtsByUser(userId, isPaid === 'true' ? true : isPaid === 'false' ? false : null);

    // Guardar en caché
    await cacheService.set(cacheKey, debts);

    res.json({
      message: 'Deudas obtenidas',
      debts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener deudas', error: err.message });
  }
};

// Obtener deuda por ID
const getDebt = async (req, res) => {
  try {
    const { debtId } = req.params;
    const userId = req.userId;

    const debt = await getDebtById(debtId, userId);
    if (!debt) {
      return res.status(404).json({ message: 'Deuda no encontrada' });
    }

    res.json({
      message: 'Deuda obtenida',
      debt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener deuda', error: err.message });
  }
};

// Actualizar deuda
const updateDebtById = async (req, res) => {
  try {
    const { debtId } = req.params;
    const userId = req.userId;
    const { description, amount, dueDate } = req.body;

    // Validación de monto positivo si se proporciona
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: 'El monto debe ser mayor a 0' });
    }

    const updates = {};
    if (description !== undefined) updates.description = description;
    if (amount !== undefined) updates.amount = amount;
    if (dueDate !== undefined) updates.due_date = dueDate;

    const updatedDebt = await updateDebt(debtId, userId, updates);

    // Invalidar caché
    await cacheService.invalidateUserCache(userId);

    res.json({
      message: 'Deuda actualizada',
      debt: updatedDebt,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error al actualizar deuda', error: err.message });
  }
};

// Marcar como pagada
const markAsPaid = async (req, res) => {
  try {
    const { debtId } = req.params;
    const userId = req.userId;

    const paidDebt = await markDebtAsPaid(debtId, userId);

    if (!paidDebt) {
      return res.status(404).json({ message: 'Deuda no encontrada' });
    }

    // Invalidar caché
    await cacheService.invalidateUserCache(userId);

    res.json({
      message: 'Deuda marcada como pagada',
      debt: paidDebt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al marcar como pagada', error: err.message });
  }
};

// Eliminar deuda
const removeDebt = async (req, res) => {
  try {
    const { debtId } = req.params;
    const userId = req.userId;

    const deletedDebt = await deleteDebt(debtId, userId);

    // Invalidar caché
    await cacheService.invalidateUserCache(userId);

    res.json({
      message: 'Deuda eliminada',
      debt: deletedDebt,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error al eliminar deuda', error: err.message });
  }
};

// Obtener agregaciones
const getAggregations = async (req, res) => {
  try {
    const userId = req.userId;

    const cacheKey = `user:${userId}:aggregations`;
    const cachedAggregations = await cacheService.get(cacheKey);

    if (cachedAggregations) {
      return res.json({
        message: 'Agregaciones obtenidas (caché)',
        aggregations: cachedAggregations,
      });
    }

    const aggregations = await getDebtAggregations(userId);

    // Guardar en caché por 1 hora
    await cacheService.set(cacheKey, aggregations, 3600);

    res.json({
      message: 'Agregaciones obtenidas',
      aggregations,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener agregaciones', error: err.message });
  }
};

// Exportar deudas a JSON
const exportToJSON = async (req, res) => {
  try {
    const userId = req.userId;
    const debts = await getDebtsByUser(userId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=deudas.json');
    res.json(debts);
  } catch (err) {
    res.status(500).json({ message: 'Error al exportar deudas', error: err.message });
  }
};

// Exportar deudas a CSV
const exportToCSV = async (req, res) => {
  try {
    const userId = req.userId;
    const debts = await getDebtsByUser(userId);

    // Transformar datos para CSV
    const csvData = debts.map(debt => ({
      'ID': debt.id,
      'Descripción': debt.description,
      'Monto': debt.amount,
      'Monto Pagado': debt.paid_amount,
      'Pagado': debt.is_paid ? 'Sí' : 'No',
      'Fecha Vencimiento': debt.due_date || 'N/A',
      'Fecha Creación': debt.created_at,
    }));

    // Generar CSV
    const csv = Papa.unparse(csvData);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=deudas.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Error al exportar deudas', error: err.message });
  }
};

module.exports = {
  createNewDebt,
  getUserDebts,
  getDebt,
  updateDebtById,
  markAsPaid,
  removeDebt,
  getAggregations,
  exportToJSON,
  exportToCSV,
};
