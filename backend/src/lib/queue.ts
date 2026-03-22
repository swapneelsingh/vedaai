// import { Queue, Worker, QueueEvents } from 'bullmq';
// import IORedis from 'ioredis';

// const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// export const redisConnection = new IORedis(REDIS_URL, {
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
// });

// export const assignmentQueue = new Queue('assignment-generation', {
//   connection: redisConnection,
//   defaultJobOptions: {
//     attempts: 3,
//     backoff: { type: 'exponential', delay: 2000 },
//     removeOnComplete: { count: 100 },
//     removeOnFail: { count: 50 },
//   },
// });

// export const assignmentQueueEvents = new QueueEvents('assignment-generation', {
//   connection: new IORedis(REDIS_URL, {
//     maxRetriesPerRequest: null,
//     enableReadyCheck: false,
//   }),
// });

// export async function getCachedResult(key: string): Promise<string | null> {
//   try {
//     return await redisConnection.get(`cache:${key}`);
//   } catch {
//     return null;
//   }
// }

// export async function setCachedResult(key: string, value: string, ttl = 3600): Promise<void> {
//   try {
//     await redisConnection.setex(`cache:${key}`, ttl, value);
//   } catch {
//     // ignore cache errors
//   }
// }


import { Queue, QueueEvents } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = {
  url: REDIS_URL,
};

export const assignmentQueue = new Queue('assignment-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const assignmentQueueEvents = new QueueEvents('assignment-generation', {
  connection,
});

import IORedis from 'ioredis';

const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: REDIS_URL.startsWith('rediss://') ? {} : undefined,
});

export async function getCachedResult(key: string): Promise<string | null> {
  try {
    return await redis.get(`cache:${key}`);
  } catch {
    return null;
  }
}

export async function setCachedResult(key: string, value: string, ttl = 3600): Promise<void> {
  try {
    await redis.setex(`cache:${key}`, ttl, value);
  } catch {
    // ignore
  }
}

export { redis as redisConnection };