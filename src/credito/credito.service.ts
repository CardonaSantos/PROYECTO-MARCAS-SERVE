import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCreditoDto } from './dto/create-credito.dto';
import { UpdateCreditoDto } from './dto/update-credito.dto';
import { PrismaService } from 'src/prisma.service';
import { createPaymentDto } from './dto/createPaymentDto.dto';
import { deleteCreditDto } from './dto/delete-credit.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreditoService {
  constructor(private readonly prisma: PrismaService) {}

  async getCredits() {
    return this.prisma.credito.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true,
            direccion: true,
          },
        },
        pagos: {
          select: {
            id: true,
            monto: true,
            timestamp: true,
            metodoPago: true,
          },
        },
        venta: {
          select: {
            id: true,
            monto: true,
            montoConDescuento: true,
            descuento: true,
            metodoPago: true,
            timestamp: true,
            vendedor: {
              select: {
                id: true,
                nombre: true,
                correo: true,
              },
            },
          },
        },
      },
    });
  }

  async getOnePaymentToPDF(paymentID: number) {
    try {
      const pagoConCredito = await this.prisma.pagoCredito.findUnique({
        where: {
          id: paymentID,
        },
        include: {
          credito: {
            include: {
              cliente: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  direccion: true,
                  telefono: true,
                },
              },
              empresa: {
                select: {
                  id: true,
                  nombre: true,
                  direccion: true,
                  telefono: true,
                  pbx: true,
                  email: true,
                  website: true,
                },
              },
            },
          },
        },
      });

      if (!pagoConCredito) {
        throw new BadRequestException('El pago no existe.');
      }

      return pagoConCredito;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al conseguir datos');
    }
  }

  async createPaymetCredit(createPayment: createPaymentDto) {
    // Crear el registro de pago
    const pago = await this.prisma.pagoCredito.create({
      data: {
        metodoPago: createPayment.metodoPago,
        monto: Number(createPayment.monto),
        creditoId: createPayment.creditoId,
      },
    });

    console.log('El pago creado es: ', pago);

    // Obtener el crédito relacionado para calcular el nuevo saldo pendiente
    const credito = await this.prisma.credito.findUnique({
      where: { id: createPayment.creditoId },
    });

    if (!credito) {
      throw new Error(
        `El crédito con ID ${createPayment.creditoId} no existe.`,
      );
    }

    // Calcular el nuevo saldo pendiente
    const nuevoSaldoPendiente = credito.saldoPendiente - createPayment.monto;

    // Actualizar el crédito con el nuevo total pagado y saldo pendiente
    const creditoActualizar = await this.prisma.credito.update({
      where: {
        id: createPayment.creditoId,
      },
      data: {
        totalPagado: {
          increment: createPayment.monto, // Incrementar el total pagado
        },
        saldoPendiente: nuevoSaldoPendiente < 0 ? 0 : nuevoSaldoPendiente, // Asegurar que no sea negativo
      },
    });

    console.log('El crédito actualizado es: ', creditoActualizar);

    console.log('Actualizamos la venta');
    const ventaUpdate = await this.prisma.venta.findUnique({
      where: {
        id: createPayment.ventaId,
      },
    });

    if (!ventaUpdate) {
      throw new BadRequestException('Faltan datos para el registro');
    }

    await this.prisma.venta.update({
      where: {
        id: ventaUpdate.id,
      },
      data: {
        monto: {
          increment: createPayment.monto,
        },
      },
    });

    console.log('Actualizar los ingresos de la empresa...');
    await this.prisma.ingresosEmpresa.update({
      where: {
        id: createPayment.empresaId,
      },
      data: {
        ingresosTotales: {
          increment: createPayment.monto,
        },
        saldoActual: {
          increment: createPayment.monto,
        },
      },
    });

    return { pago, creditoActualizado: creditoActualizar };
  }

  //TERMINAR DE HACER LOS AJUSTES, PARA QUE EL PAGO ELIMINADO CUADRE CON EL CREDITO, Y LOS INGRESOS DE LA EMPRESA
  async deletePaymetCredit(deletePaymentDTO: createPaymentDto) {
    console.log('Los datos son: ', deletePaymentDTO);

    const admin = await this.prisma.usuario.findUnique({
      where: {
        id: deletePaymentDTO.userId,
      },
    });

    if (!admin) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Validar la contraseña
    const isValidPassword = await bcrypt.compare(
      deletePaymentDTO.password,
      admin.contrasena,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Sin permiso para eliminar');
    }

    const pago = await this.prisma.pagoCredito.findUnique({
      where: {
        id: deletePaymentDTO.creditoId,
      },
    });

    if (!pago) {
      throw new BadRequestException('El pago no existe');
    }

    // Eliminar el pago
    const deletedPago = await this.prisma.pagoCredito.delete({
      where: {
        id: deletePaymentDTO.creditoId,
      },
    });

    await this.prisma.credito.update({
      where: {
        id: pago.creditoId,
      },
      data: {
        totalPagado: {
          decrement: pago.monto,
        },
      },
    });

    console.log('El pago a eliminar es: ', deletedPago);

    await this.prisma.ingresosEmpresa.update({
      where: {
        id: deletePaymentDTO.empresaId,
      },
      data: {
        saldoActual: {
          decrement: deletedPago.monto,
        },
        egresosTotales: {
          decrement: deletedPago.monto,
        },
      },
    });

    // Retornar una respuesta más descriptiva
    return {
      message: 'Pago eliminado con éxito',
      deletedPago,
    };
  }

  async deleteCreditRegist(deleteCreditDto: deleteCreditDto) {
    try {
      console.log('Los datos entrantes al service son: ', deleteCreditDto);

      // Verificar que el usuario administrador existe
      const admin = await this.prisma.usuario.findUnique({
        where: {
          id: deleteCreditDto.userId,
        },
      });

      // Validar la contraseña del administrador
      const contraseñaValida = await bcrypt.compare(
        deleteCreditDto.adminPassword,
        admin.contrasena,
      );

      if (!contraseñaValida) {
        throw new BadRequestException('Usuario no autenticado');
      }

      // Obtener la venta asociada al crédito
      const creditToDelete = await this.prisma.credito.findUnique({
        where: {
          id: deleteCreditDto.creditoId,
        },
        include: {
          venta: true, // Asegurarnos de que obtenemos la venta asociada al crédito
        },
      });

      if (!creditToDelete || !creditToDelete.venta) {
        throw new BadRequestException(
          'Error al encontrar el registro de crédito o la venta asociada',
        );
      }

      // Obtener el monto pagado de la venta
      const montoPagado = creditToDelete.venta.monto; // En este caso, monto pagado es 150
      console.log(`Monto pagado por la venta: Q${montoPagado}`);

      // Eliminar el crédito
      await this.prisma.credito.delete({
        where: {
          id: deleteCreditDto.creditoId,
        },
      });

      console.log(
        `Crédito con ID ${creditToDelete.id} eliminado correctamente`,
      );

      // Actualizar los saldos de la empresa
      await this.prisma.ingresosEmpresa.update({
        where: {
          id: deleteCreditDto.empresaId,
        },
        data: {
          saldoActual: {
            // Decrementar solo el monto pagado en la venta
            decrement: montoPagado,
          },
          egresosTotales: {
            // Decrementar solo el monto pagado en la venta
            increment: montoPagado,
          },
          numeroVentas: {
            // Decrementar el número de ventas
            decrement: 1,
          },
        },
      });

      console.log('Saldo de la empresa actualizado correctamente');
      return creditToDelete;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al procesar la eliminación del crédito',
      );
    }
  }
}
