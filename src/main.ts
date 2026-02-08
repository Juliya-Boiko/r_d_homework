import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    abortOnError: false,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      // exceptionFactory: (errors) => {
      //   return new (require('@nestjs/common').BadRequestException)({
      //     code: 'VALIDATION_FAILED',
      //     message: 'Validation failed',
      //     details: mapValidationErrors(errors as any[]),
      //   });
      // },
      // transformOptions: {
      //   enableImplicitConversion: true,
      // },
      // validationError: {
      //   target: false,
      //   value: false,
      // },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Lesson 03')
    .setDescription('Swagger contract')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 4422;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
