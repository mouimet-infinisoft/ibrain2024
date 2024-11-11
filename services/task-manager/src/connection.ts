import logger from "./monitoring/logger";
import IORedis from "ioredis";

export const connection = {
    host: process.env.REDIS_HOST || "192.168.10.2",
    port: Number(process.env.REDIS_PORT) || 6379,
};

export const redisClient = new IORedis(connection);

redisClient.on("error", (error) => {
    logger.error("Redis Client Error:", error);
});

redisClient.on("connect", () => {
    logger.info("Redis Client Connected");
});
