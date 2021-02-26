import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { Message } from '@app/messenger/messanger.types';
import * as Redis from 'ioredis';

@Injectable()
export class MessengerService {
  private client: Redis.Redis;
  private readonly queueName: string;
  private readonly interval: number;
  private timeout: NodeJS.Timeout;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.queueName = this.configService.get('queueName');
    this.interval = this.configService.get('interval');
  }

  async init() {
    this.client = await this.redisService.getClient();
    let rangeStartTime: number;

    this.timeout = setInterval(async () => {
      const rangeEndTime = Date.now();
      const res = await this.client
        .multi()
        .zrangebyscore(this.queueName, rangeStartTime ?? '-inf', rangeEndTime)
        .zremrangebyscore(
          this.queueName,
          rangeStartTime ?? '-inf',
          rangeEndTime,
        )
        .exec();
      if (res[0][1].length) {
        res[0][1].forEach((value) => console.log(value));
      }
      rangeStartTime = rangeEndTime + 1;
    }, this.interval);
  }

  async addMessage(message: Message): Promise<void> {
    await this.client.zadd(this.queueName, message.time, message.text);
  }

  getAllMessages(): Promise<string[]> {
    return this.client.zrange(this.queueName, 0, -1);
  }

  async clearMessages(): Promise<void> {
    await this.client.del(this.queueName);
  }

  async closeConnection(): Promise<void> {
    await this.client.quit();
  }

  clearInterval(): void {
    clearInterval(this.timeout);
  }
}
