type RedisValue = string;

class InMemoryRedisClient {
    private store: Map<string, RedisValue> = new Map();

    async get(key: string): Promise<RedisValue | null> {
        return this.store.has(key) ? this.store.get(key)! : null;
    }

    async set(key: string, value: RedisValue, _options?: { EX?: number }): Promise<void> {
        this.store.set(key, value);
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
    }

    async keys(pattern: string): Promise<string[]> {
        if (pattern === "*") {
            return Array.from(this.store.keys());
        }
        const normalized = pattern.replace(/\*/g, ".*");
        const matcher = new RegExp(`^${normalized}$`);
        return Array.from(this.store.keys()).filter((key) => matcher.test(key));
    }

    async reset(): Promise<void> {
        this.store.clear();
    }
}

const redisStub = new InMemoryRedisClient();

export const getRedisStub = () => redisStub;
export const resetRedisStub = () => redisStub.reset();
