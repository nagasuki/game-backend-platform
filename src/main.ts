import 'dotenv/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) =>
          error.constraints ? Object.values(error.constraints) : [],
        );

        return new BadRequestException(messages);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Game Backend Platform API')
    .setDescription('Auth and user APIs for the game backend platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
