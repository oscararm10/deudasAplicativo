const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

client.on('error', (err) => {
  console.error('Error en Redis:', err);
});

client.on('connect', () => {
  console.log('Conectado a Redis');
});

// Conectar al iniciarse
client.connect().catch(err => console.error('Error al conectar a Redis:', err));

module.exports = client;
