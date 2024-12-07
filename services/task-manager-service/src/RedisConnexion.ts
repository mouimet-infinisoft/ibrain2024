import { Service } from "@brainstack/inject";

interface IRedisConfig {
    host: string;
    port: number;
}

@Service
export class RedisConnexion implements IRedisConfig {
    host: string;
    port: number;

    constructor() {
        this.host = process.env.REDIS_HOST || "192.168.10.2";
        this.port = parseInt(process.env.REDIS_PORT || "6379");
    }
}
