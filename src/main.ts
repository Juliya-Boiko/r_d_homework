import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    abortOnError: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  //app.useGlobalFilters(new AllExceptionFilter())
  // app.useGlobalInterceptors(new ResponseTimeInterseptor(), new HttpLoggerInterseptor())

  const port = process.env.PORT || 4422;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
