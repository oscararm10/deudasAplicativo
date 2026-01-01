const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  createNewDebt,
  getUserDebts,
  getDebt,
  updateDebtById,
  markAsPaid,
  removeDebt,
  getAggregations,
  exportToJSON,
  exportToCSV,
} = require('../controllers/debtController');
const { validateDebt, handleValidationErrors } = require('../middleware/validators');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD de deudas
router.post('/', validateDebt, handleValidationErrors, createNewDebt);
router.get('/', getUserDebts);
router.get('/aggregations/summary', getAggregations);
router.get('/export/json', exportToJSON);
router.get('/export/csv', exportToCSV);
router.get('/:debtId', getDebt);
router.put('/:debtId', updateDebtById);
router.patch('/:debtId/mark-paid', markAsPaid);
router.delete('/:debtId', removeDebt);

module.exports = router;
