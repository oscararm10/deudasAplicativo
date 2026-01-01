const { hashPassword, comparePassword, generateToken, verifyToken } = require('../../src/utils/auth');

describe('Auth Utils', () => {
  describe('hashPassword y comparePassword', () => {
    it('debería hashear y verificar contraseña correctamente', async () => {
      const password = 'miContraseña123';
      const hash = await hashPassword(password);
      
      expect(hash).not.toBe(password);
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('debería rechazar contraseña incorrecta', async () => {
      const password = 'miContraseña123';
      const hash = await hashPassword(password);
      
      const isValid = await comparePassword('contraseñaIncorrecta', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken y verifyToken', () => {
    it('debería generar y verificar token correctamente', () => {
      const userId = 123;
      const token = generateToken(userId);
      
      expect(token).toBeDefined();
      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
    });

    it('debería rechazar token inválido', () => {
      const decoded = verifyToken('tokenInvalido');
      expect(decoded).toBeNull();
    });
  });
});
