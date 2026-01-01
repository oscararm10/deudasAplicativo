// Mock del pool de PostgreSQL
const mockPool = {
  query: jest.fn(),
};

jest.mock('../../src/config/database', () => mockPool);
jest.mock('../../src/utils/auth', () => ({
  hashPassword: jest.fn(async (pwd) => `hashed_${pwd}`),
  comparePassword: jest.fn(async (pwd, hash) => hash === `hashed_${pwd}`),
}));

const { createDebt, getDebtById, updateDebt, markDebtAsPaid } = require('../../src/models/Debt');

describe('Debt Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDebt', () => {
    it('debería crear una deuda correctamente', async () => {
      const mockDebt = {
        id: 1,
        user_id: 1,
        description: 'Préstamo',
        amount: 100,
        is_paid: false,
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockDebt] });

      const debt = await createDebt(1, 'Préstamo', 100);

      expect(debt).toEqual(mockDebt);
      expect(mockPool.query).toHaveBeenCalled();
    });

    it('debería rechazar monto negativo en base de datos', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Violación de restricción'));

      await expect(createDebt(1, 'Deuda', -50)).rejects.toThrow();
    });
  });

  describe('updateDebt', () => {
    it('debería rechazar actualizar deuda pagada', async () => {
      const paidDebt = {
        id: 1,
        user_id: 1,
        is_paid: true,
      };

      mockPool.query.mockResolvedValueOnce({ rows: [paidDebt] });

      await expect(updateDebt(1, 1, { description: 'Nueva descripción' })).rejects.toThrow(
        'No se puede editar una deuda pagada'
      );
    });
  });

  describe('markDebtAsPaid', () => {
    it('debería marcar deuda como pagada', async () => {
      const paidDebt = {
        id: 1,
        user_id: 1,
        is_paid: true,
        paid_amount: 100,
      };

      mockPool.query.mockResolvedValueOnce({ rows: [paidDebt] });

      const debt = await markDebtAsPaid(1, 1);

      expect(debt.is_paid).toBe(true);
    });
  });
});
