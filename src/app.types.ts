import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class Message {
  @Min(Date.now(), {
    message: 'Time must be specified in the future',
  })
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Message time',
    type: Number,
    required: true,
  })
  time: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Message text',
    type: String,
    required: true,
  })
  text: string;
}
