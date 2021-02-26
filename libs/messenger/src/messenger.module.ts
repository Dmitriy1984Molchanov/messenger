import { Module } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.get('redisUrl'), // or use async method
      inject: [ConfigService],
    }),
  ],
  providers: [MessengerService],
  exports: [MessengerService],
})
export class MessengerModule {}
