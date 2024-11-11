import { publishEventFactory, subscribeToEventsFactory } from './factories/eventsFactory';
import { redisClient } from './connection';

export const publishEvent = publishEventFactory(redisClient);
export const subscribeToEvents = subscribeToEventsFactory(redisClient)