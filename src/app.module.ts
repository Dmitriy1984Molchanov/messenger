import * as path from 'path';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessengerModule } from '@app/messenger';
import { ConfigModule } from '@nestjs/config';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      envFilePath: [path.resolve(__dirname, '../.env')],
    }),
    MessengerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
