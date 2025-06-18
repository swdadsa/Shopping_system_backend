// src/middlewares/redisClient.ts
import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

export const initRedis = async (app: any) => {
    if (!redisClient.isOpen) await redisClient.connect();
    app.locals.redis = redisClient;
    console.log("Redis Client Connected");
};
