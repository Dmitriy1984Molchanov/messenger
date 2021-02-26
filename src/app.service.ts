import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from '@app/messenger/messanger.types';
import { MessengerService } from '@app/messenger';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly messengerService: MessengerService,
  ) {}

  async printMeAt(message: Message): Promise<void> {
    await this.messengerService.addMessage(message);
  }
}
