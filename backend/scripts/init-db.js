const pool = require('./src/config/database');
const { createUserTable, createDebtsTable, createIndexes } = require('./src/models/User');

async function initializeDatabase() {
  console.log('Inicializando base de datos...');
  
  try {
    // Crear tablas
    await createUserTable();
    await createDebtsTable();
    await createIndexes();
    
    console.log('✓ Base de datos inicializada correctamente');
    console.log('\nProximos pasos:');
    console.log('1. Inicia el servidor: npm run dev');
    console.log('2. La API estará disponible en http://localhost:5000');
    console.log('3. Usa los endpoints para registrar y crear deudas');
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error inicializando base de datos:', err);
    process.exit(1);
  }
}

initializeDatabase();
