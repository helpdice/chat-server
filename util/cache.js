const redis = require('redis');
const client = redis.createClient();

client.connect().catch(console.error);

const getCache = async (key) => {
    const data = await client.get(key);
    return JSON.parse(data);
};

const setCache = async (key, value, ttl = 300) => {
    await client.set(key, JSON.stringify(value), { EX: ttl });
};

module.exports = { getCache, setCache };
