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
    origin: 'https://frontend-ui-so-production.up.railway.app', // Cambia esto por el dominio que necesites
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Si necesitas enviar cookies o cabeceras de autorización
  });

  await app.listen(port);
}
bootstrap();
