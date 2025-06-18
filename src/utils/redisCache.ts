// src/utils/redisCache.ts
import { RedisClientType } from "redis";

export const getCache = async (redis: RedisClientType, key: string) => {
    const raw = await redis.get(key);
    if (raw) {
        console.log(`${key}使用快取`);
        return JSON.parse(raw);
    } else {
        return false
    }
};


export const setCache = async (
    redis: RedisClientType,
    key: string,
    data: any,
    ttl = 600 // 秒
) => {
    await redis.set(key, JSON.stringify(data), { EX: ttl });
};

export const deleteCache = async (redis: RedisClientType, key: string) => {
    await redis.del(key);
};

// 拿到所有key
export const getAllKeys = async (redis: RedisClientType) => {
    const keys = await redis.keys("*");
    return keys;
};
