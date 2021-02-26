import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Message } from './app.types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/printMeAt')
  @ApiBody({
    type: Message,
  })
  @ApiOperation({
    description: 'Sends message to queue.',
  })
  @ApiOkResponse({
    type: String,
  })
  printMeAt(@Body() message: Message): Promise<void> {
    return this.appService.printMeAt(message);
  }
}
