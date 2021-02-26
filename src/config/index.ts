export default (): any => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  interval: parseInt(process.env.INTERVAL, 10) || 100,
  queueName: process.env.QUEUE_NAME || 'messages',
});
