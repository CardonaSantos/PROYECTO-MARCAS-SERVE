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
  // const port = process.env.PORT || 3000;
  const port = process.env.PORT || 3000;

  const allowedOrigins = process.env.CORS_ORIGIN; // Variable para definir el origen permitido

  const app = await NestFactory.create(AppModule);

  // Configuración de CORS para permitir solicitudes de tu dominio
  app.enableCors({
    // origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  await app.listen(port);
}
bootstrap();

// Ver la eliminacion de usuarios desactivados
// ver el envio de informacion de localizacion para ver primero, si el usuario existe o no

//NOTIFICACIONES AL CREAR REGISTRO DE VISTIA, NO SE PUSO, TAMBIEN PONERLE NOTIFICACIONES A OTROS REGISTRO
//ARREGLAR LAS NOTFICACIONES PARA EMPLEADOS
