const redis = require('redis');
require('dotenv').config();

class CacheService {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (err) {
      console.error('No se pudo conectar a Redis, usando modo sin caché:', err.message);
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('Error en get cache:', err);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (err) {
      console.error('Error en set cache:', err);
    }
  }

  async delete(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Error en delete cache:', err);
    }
  }

  async invalidateUserCache(userId) {
    try {
      const pattern = `user:${userId}:*`;
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (err) {
      console.error('Error invalidating cache:', err);
    }
  }
}

module.exports = new CacheService();
