import { Redis } from 'ioredis';

export const publishEventFactory = (redis: Redis) =>
  async (event: any): Promise<void> => {
    await redis.publish('tasks', JSON.stringify(event));
  };

export const subscribeToEventsFactory = (redis: Redis) =>
  (handler: (event: any) => void): (() => void) => {
    const subscriber = redis.duplicate();

    subscriber.subscribe('tasks');
    subscriber.on('message', (_, message) => {
      handler(JSON.parse(message));
    });

    return () => {
      subscriber.unsubscribe();
      subscriber.quit();
    };
  };
