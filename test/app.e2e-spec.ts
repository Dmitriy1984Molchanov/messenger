import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MessengerService } from '@app/messenger';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let anotherApp: INestApplication;
  let messengerService: MessengerService;
  let anotherMessengerService: MessengerService;
  const timeout = 1000;
  const message1 = {
    time: Date.now() + timeout,
    text: 'Some message 1',
  };
  const message2 = {
    time: Date.now() + timeout + 1,
    text: 'Some message 2',
  };
  const message3 = {
    time: Date.now() + timeout + 2,
    text: 'Some message 3',
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    messengerService = app.get(MessengerService);
    await messengerService.init();
    await messengerService.clearMessages();

    anotherApp = moduleRef.createNestApplication();
    await anotherApp.init();
    anotherMessengerService = anotherApp.get(MessengerService);
    await anotherMessengerService.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  afterAll(() => {
    messengerService.clearInterval();
    anotherMessengerService.clearInterval();
  });

  it('/printMeAt (POST) success', async (done) => {
    // checks simple add message request
    await request(app.getHttpServer())
      .post('/printMeAt')
      .send(message1)
      .expect(201)
      .expect({});

    // add the second message  to check if messages order is correct in the messages queue after
    await request(app.getHttpServer())
      .post('/printMeAt')
      .send(message2)
      .expect(201)
      .expect({});

    // checks if it's possible to send requests to multiple applications
    await request(anotherApp.getHttpServer())
      .post('/printMeAt')
      .send(message3)
      .expect(201)
      .expect({});

    // add the same message to  check that it's not added to the messages queue
    await request(anotherApp.getHttpServer())
      .post('/printMeAt')
      .send(message3)
      .expect(201)
      .expect({});

    // checks the messages order in the messages queue before they are deleted
    expect(await messengerService.getAllMessages()).toEqual([
      message1.text,
      message2.text,
      message3.text,
    ]);

    // checks that all messages are deleted from the messages queue and that console.log called correctly having multiple app instances
    setTimeout(async () => {
      expect(await messengerService.getAllMessages()).toEqual([]);
      expect(console.log).toHaveBeenCalledWith(message1.text);
      expect(console.log).toHaveBeenCalledWith(message2.text);
      expect(console.log).toHaveBeenCalledWith(message3.text);
      expect(console.log).toHaveBeenCalledTimes(3);
      done();
    }, timeout + 2000);
  });

  it('/printMeAt (POST) fails with expired time', async () => {
    await request(app.getHttpServer())
      .post('/printMeAt')
      .send({
        time: 1,
        text: 'Some text',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['Time must be specified in the future'],
        error: 'Bad Request',
      });

    expect(await messengerService.getAllMessages()).toEqual([]);
    expect(console.log).toHaveBeenCalledTimes(0);
  });

  it('/printMeAt (POST) fails with extra fields', async () => {
    await request(app.getHttpServer())
      .post('/printMeAt')
      .send({ ...message1, extraField: 'someValue' })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['property extraField should not exist'],
        error: 'Bad Request',
      });

    expect(await messengerService.getAllMessages()).toEqual([]);
    expect(console.log).toHaveBeenCalledTimes(0);
  });

  it('/printMeAt (POST) fails with empty params', async () => {
    await request(app.getHttpServer())
      .post('/printMeAt')
      .send()
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'time should not be empty',
          'time must be a number conforming to the specified constraints',
          'Time must be specified in the future',
          'text should not be empty',
          'text must be a string',
        ],
        error: 'Bad Request',
      });

    expect(await messengerService.getAllMessages()).toEqual([]);
    expect(console.log).toHaveBeenCalledTimes(0);
  });

  it('/printMeAt (POST) fails with wrong type params', async () => {
    await request(app.getHttpServer())
      .post('/printMeAt')
      .send({
        time: String(message1.time),
        text: 1,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'time must be a number conforming to the specified constraints',
          'Time must be specified in the future',
          'text must be a string',
        ],
        error: 'Bad Request',
      });

    expect(await messengerService.getAllMessages()).toEqual([]);
    expect(console.log).toHaveBeenCalledTimes(0);
  });
});
