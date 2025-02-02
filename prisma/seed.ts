// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1) Crear (o asegurar) la empresa por defecto
  const defaultEmpresa = await prisma.empresa.upsert({
    where: { email: 'default@empresa.com' },
    update: {}, // si ya existe, no la modificamos
    create: {
      nombre: 'Empresa por Defecto',
      telefono: '000-0000',
      email: 'default@empresa.com',
      direccion: 'Dirección base',
    },
  });

  console.log('La empresa default es: ', defaultEmpresa);

  // 2) Crear un usuario Admin por defecto vinculado a esa empresa
  //   await prisma.usuario.upsert({
  //     where: { correo: 'admin@empresa.com' },
  //     update: {},
  //     create: {
  //       nombre: 'Admin',
  //       correo: 'admin@empresa.com',
  //       contrasena: '123456', // en la vida real, encriptarla
  //       rol: 'ADMIN',
  //       empresaId: defaultEmpresa.id, // Asigna la FK a la empresa creada
  //     },
  //   });

  console.log('Seeding finished!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
