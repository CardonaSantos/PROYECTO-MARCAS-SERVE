import { Injectable } from '@nestjs/common';
import { CreateRecoveryDto } from './dto/create-recovery.dto';
import { UpdateRecoveryDto } from './dto/update-recovery.dto';
import { PrismaService } from 'src/prisma.service';

import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';

const GMAIL_USER = 'reshevskys@gmail.com';
const GMAIL_PASSWORD = 'kjjo iypx vwbw ssse';

@Injectable()
export class RecoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async restablecerContrasena(
    token: string,
    nuevaContrasena: string,
  ): Promise<void> {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        tokenRecuperacion: token,
        expiracionToken: { gte: new Date() }, // Validar que el token no haya expirado
      },
    });

    if (!usuario) {
      throw new Error('Token inválido o expirado');
    }

    const hashedContrasena = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizar la contraseña y eliminar el token
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        contrasena: hashedContrasena,
        tokenRecuperacion: null,
        expiracionToken: null,
      },
    });

    console.log(
      'El usuario: ',
      usuario,
      ' Se le ha cambiado la contraseña a : ',
      nuevaContrasena,
    );
  }

  async solicitarRecuperacion(correo: string): Promise<void> {
    console.log('Entrando al servicio de recuperación con correo:', correo);

    // Buscar el usuario en la base de datos
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      console.log('El correo no existe en la base de datos:', correo);
      throw new Error('Usuario no encontrado');
    }

    console.log('Usuario encontrado:', usuario);

    // Generar un token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1); // El token expira en 1 hora

    // Guardar el token y su expiración en la base de datos
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tokenRecuperacion: token,
        expiracionToken: expiracion,
      },
    });

    console.log('Token generado y guardado en la base de datos:', token);

    // Configuración del transporte de correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASSWORD,
      },
      logger: true, // Habilitar logs
      debug: true, // Ver detalles en consola
    });

    // Crear el enlace de recuperación
    const baseUrl = 'https://frontend-ui-so-production.up.railway.app/';
    const enlaceRecuperacion = `${baseUrl}/restablecer-contraseña?token=${token}`;

    try {
      console.log('Intentando enviar correo...');
      await transporter.sendMail({
        from: GMAIL_USER,
        to: correo,
        subject: 'Recuperación de contraseña',
        html: `
          <p>Hola ${usuario.nombre},</p>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${enlaceRecuperacion}">${enlaceRecuperacion}</a>
          <p>El enlace es válido por 1 hora.</p>
        `,
      });
      console.log('Correo enviado exitosamente.');
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw new Error('No se pudo enviar el correo.');
    }
  }
}
