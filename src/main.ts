// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const port = process.env.PORT || 3000;

//   const app = await NestFactory.create(AppModule);
//   app.enableCors();

//   //CAMBIAR EL PUERTO PARA PRODUCCCION
//   // await app.listen(3000);
//   await app.listen(port);
// }
// bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS para permitir solicitudes de tu dominio
  app.enableCors({
    origin: 'https://frontend-ui-so-production.up.railway.app',
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
