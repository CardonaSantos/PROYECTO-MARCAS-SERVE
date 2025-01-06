import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrismaService } from 'src/prisma.service';
import * as ExcelJS from 'exceljs';
import { EstadoProspecto, EstadoVisita, MotivoVisita } from '@prisma/client';
import * as bcrypt from 'bcrypt';

//
const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha);

  // Validar que la fecha es válida
  if (isNaN(date.getTime())) {
    throw new Error('Fecha inválida');
  }

  // Obtener componentes de la fecha
  const dia = date.getUTCDate().toString().padStart(2, '0');
  const mes = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Mes comienza en 0
  const anio = date.getUTCFullYear();

  // Obtener componentes de la hora
  let horas = date.getUTCHours();
  const minutos = date.getUTCMinutes().toString().padStart(2, '0');
  const amPm = horas >= 12 ? 'PM' : 'AM';
  horas = horas % 12 || 12; // Convertir a formato 12 horas

  return `${dia}/${mes}/${anio} ${horas.toString().padStart(2, '0')}:${minutos} ${amPm}`;
};

// const DesHashearContrasena = (contraseña:string)=>{
//   const hasheada = bcrypt.
// }

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createReportDto: CreateReportDto) {}

  findAll() {
    return `This action returns all reports`;
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }

  // Reports Service
  async generarExcelVentas(
    from: string | undefined,
    to: string | undefined,
    minTotal: number,
    maxTotal: number,
    useDiscounted: boolean,
  ): Promise<Buffer> {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const ventas = await this.prisma.venta.findMany({
      where: {
        timestamp: {
          gte: fromDate,
          lte: toDate,
        },
        ...(useDiscounted
          ? {
              montoConDescuento: {
                gte: minTotal,
                ...(maxTotal !== Infinity && { lte: maxTotal }),
              },
            }
          : {
              monto: {
                gte: minTotal,
                ...(maxTotal !== Infinity && { lte: maxTotal }),
              },
            }),
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            municipio: { select: { nombre: true } },
            departamento: { select: { nombre: true } },
            tipoCliente: true,
            // comentarios: true,
          },
        },
        vendedor: {
          select: { nombre: true },
        },
        productos: {
          select: {
            cantidad: true,
            producto: {
              select: { nombre: true },
            },
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Ventas');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Vendedor', key: 'vendedor', width: 30 },
      { header: 'Productos', key: 'productos', width: 50 },
      { header: 'Monto Total', key: 'monto', width: 15 },
      { header: 'Monto con Descuento', key: 'montoConDescuento', width: 20 },
      { header: 'Descuento (%)', key: 'descuento', width: 15 },
      { header: 'Método de Pago', key: 'metodoPago', width: 20 },
      { header: 'Municipio', key: 'municipio', width: 25 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'Tipo de Cliente', key: 'tipoCliente', width: 20 },
      // { header: 'Comentarios', key: 'comentarios', width: 50 },
    ];

    ventas.forEach((venta) => {
      sheet.addRow({
        id: venta.id,
        fecha: formatearFecha(venta?.timestamp.toString()) || 'Sin fecha',
        cliente:
          `${venta.cliente?.nombre || 'N/A'} ${venta.cliente?.apellido || ''}`.trim(),
        vendedor: venta.vendedor?.nombre || 'N/A',
        productos: venta.productos
          .map((p) => `${p.producto.nombre} (x${p.cantidad})`)
          .join(', '),
        monto: venta.monto?.toFixed(2) || '0.00',
        montoConDescuento: venta.montoConDescuento?.toFixed(2) || '0.00',
        descuento: venta.descuento ? `${venta.descuento}%` : '0%',
        metodoPago: venta.metodoPago || 'N/A',
        municipio: venta.cliente?.municipio?.nombre || 'N/A',
        departamento: venta.cliente?.departamento?.nombre || 'N/A',
        tipoCliente: venta.cliente?.tipoCliente || 'N/A',
        // comentarios: venta.cliente?.comentarios || 'Sin comentarios',
      });
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }
  // REPORTE DE CLIENTES
  async generarExcelClientesFiltrados(
    fromDate?: Date,
    toDate?: Date,
    minCompras?: number,
    maxCompras?: number,
    minGastado?: number,
    maxGastado?: number,
    municipio?: string,
    departamento?: string,
  ): Promise<Buffer> {
    // Buscar clientes según los filtros
    const clientes = await this.prisma.cliente.findMany({
      where: {
        AND: [
          fromDate && toDate
            ? {
                creadoEn: {
                  gte: fromDate,
                  lte: toDate,
                },
              }
            : {},
          municipio
            ? {
                municipio: {
                  nombre: municipio,
                },
              }
            : {},
          departamento
            ? {
                departamento: {
                  nombre: departamento,
                },
              }
            : {},
        ],
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        correo: true,
        direccion: true,
        municipio: { select: { nombre: true } },
        departamento: { select: { nombre: true } },
        tipoCliente: true,
        volumenCompra: true,
        presupuestoMensual: true,
        creadoEn: true,
        ventas: {
          select: {
            id: true, // Para contar ventas
            monto: true, // Para calcular el total gastado
          },
        },
      },
    });

    // Filtrar por número de compras y monto gastado
    const clientesFiltrados = clientes.filter((cliente) => {
      const numCompras = cliente.ventas.length;
      const totalGastado = cliente.ventas.reduce(
        (sum, venta) => sum + venta.monto,
        0,
      );

      const cumpleCompras =
        (minCompras === undefined || numCompras >= minCompras) &&
        (maxCompras === undefined || numCompras <= maxCompras);

      const cumpleGastado =
        (minGastado === undefined || totalGastado >= minGastado) &&
        (maxGastado === undefined || totalGastado <= maxGastado);

      return cumpleCompras && cumpleGastado;
    });

    // Generar el Excel con los clientes filtrados
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Clientes Filtrados');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre Completo', key: 'nombreCompleto', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Correo Electrónico', key: 'correo', width: 30 },
      { header: 'Dirección', key: 'direccion', width: 50 },
      { header: 'Municipio', key: 'municipio', width: 25 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'Tipo de Cliente', key: 'tipoCliente', width: 20 },
      { header: 'Volumen de Compra', key: 'volumenCompra', width: 20 },
      { header: 'Presupuesto Mensual', key: 'presupuestoMensual', width: 20 },
      { header: 'Fecha de Creación', key: 'fechaCreacion', width: 20 },
      { header: 'Número de Compras', key: 'numCompras', width: 20 },
      { header: 'Monto Total Gastado', key: 'montoTotal', width: 20 },
    ];

    clientesFiltrados.forEach((cliente) => {
      const numCompras = cliente.ventas.length;
      const totalGastado = cliente.ventas.reduce(
        (sum, venta) => sum + venta.monto,
        0,
      );

      sheet.addRow({
        id: cliente.id,
        nombreCompleto: `${cliente.nombre} ${cliente.apellido}`.trim(),
        telefono: cliente.telefono || 'N/A',
        correo: cliente.correo || 'N/A',
        direccion: cliente.direccion || 'N/A',
        municipio: cliente.municipio?.nombre || 'N/A',
        departamento: cliente.departamento?.nombre || 'N/A',
        tipoCliente: cliente.tipoCliente || 'N/A',
        volumenCompra: cliente.volumenCompra || 'N/A',
        presupuestoMensual: cliente.presupuestoMensual || 'N/A',
        fechaCreacion: formatearFecha(cliente?.creadoEn?.toString()),
        numCompras: numCompras,
        montoTotal: totalGastado.toFixed(2),
      });
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  //PROSPECTOS REPORT
  async generarExcelProspectos(
    from: Date,
    to: Date,
    estado?: EstadoProspecto,
  ): Promise<Buffer> {
    try {
      const prospectos = await this.prisma.prospecto.findMany({
        where: {
          inicio: {
            gte: from,
            lte: to,
          },
          ...(estado && { estado }), // Filtro opcional por estado
        },
        include: {
          vendedor: { select: { nombre: true, correo: true } },
          municipio: { select: { nombre: true } },
          departamento: { select: { nombre: true } },
          cliente: {
            select: {
              nombre: true,
              apellido: true,
              telefono: true,
              correo: true,
            },
          },
          ubicacion: { select: { latitud: true, longitud: true } },
        },
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Prospectos');

      sheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Inicio', key: 'inicio', width: 20 },
        { header: 'Fin', key: 'fin', width: 20 },
        { header: 'Nombre Completo', key: 'nombreCompleto', width: 30 },
        { header: 'Empresa/Tienda', key: 'empresaTienda', width: 30 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Correo', key: 'correo', width: 30 },
        { header: 'Dirección', key: 'direccion', width: 40 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Vendedor', key: 'vendedor', width: 30 },
        { header: 'Municipio', key: 'municipio', width: 20 },
        { header: 'Departamento', key: 'departamento', width: 20 },
        { header: 'Coordenadas', key: 'coordenadas', width: 20 },
        { header: 'Tipo Cliente', key: 'tipoCliente', width: 20 },
        { header: 'Volumen de Compra', key: 'volumenCompra', width: 20 },
        { header: 'Presupuesto Mensual', key: 'presupuestoMensual', width: 20 },
        { header: 'Comentarios', key: 'comentarios', width: 50 },
      ];

      prospectos.forEach((prospecto) => {
        const inicio = prospecto.inicio
          ? formatearFecha(prospecto.inicio.toISOString())
          : 'N/A';
        const fin = prospecto.fin
          ? formatearFecha(prospecto.fin.toISOString())
          : 'N/A';

        sheet.addRow({
          id: prospecto.id,
          inicio,
          fin,
          nombreCompleto:
            `${prospecto.nombreCompleto || ''} ${prospecto.apellido || ''}`.trim() ||
            'N/A',
          empresaTienda: prospecto.empresaTienda || 'N/A',
          telefono: prospecto.telefono || prospecto.cliente?.telefono || 'N/A',
          correo: prospecto.correo || prospecto.cliente?.correo || 'N/A',
          direccion: prospecto.direccion || 'N/A',
          estado: prospecto.estado,
          vendedor: `${prospecto.vendedor?.nombre || 'N/A'} (${prospecto.vendedor?.correo || 'N/A'})`,
          municipio: prospecto.municipio?.nombre || 'N/A',
          departamento: prospecto.departamento?.nombre || 'N/A',
          coordenadas:
            prospecto.ubicacion?.latitud && prospecto.ubicacion?.longitud
              ? `${prospecto.ubicacion.latitud}, ${prospecto.ubicacion.longitud}`
              : 'N/A',
          tipoCliente: prospecto.tipoCliente || 'N/A',
          volumenCompra: prospecto.volumenCompra || 'N/A',
          presupuestoMensual: prospecto.presupuestoMensual || 'N/A',
          comentarios: prospecto.comentarios || 'N/A',
        });
      });

      const uint8Array = await workbook.xlsx.writeBuffer();
      return Buffer.from(uint8Array);
    } catch (error) {
      console.error('Error al generar Excel de prospectos:', error);
      throw new Error('Hubo un problema generando el Excel de prospectos.');
    }
  }

  //REPORTE VISITAS
  // REPORTE VISITAS
  // REPORTE VISITAS
  async generarExcelVisitas(
    from?: Date,
    to?: Date,
    estado?: EstadoVisita,
    motivo?: MotivoVisita,
  ): Promise<Buffer> {
    const visitas = await this.prisma.visita.findMany({
      where: {
        inicio: {
          gte: from,
          lte: to,
        },
        ...(estado && { estadoVisita: estado }), // Filtro por estado
        ...(motivo && { motivoVisita: motivo }), // Filtro por motivo
      },
      include: {
        vendedor: { select: { nombre: true, correo: true } },
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            telefono: true,
            correo: true,
          },
        },
        ventas: {
          select: {
            id: true,
            monto: true,
            montoConDescuento: true,
            descuento: true,
            productos: {
              select: {
                cantidad: true,
                producto: {
                  select: {
                    id: true,
                    nombre: true,
                    precio: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Visitas');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Inicio', key: 'inicio', width: 20 },
      { header: 'Fin', key: 'fin', width: 20 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Correo', key: 'correo', width: 30 },
      { header: 'Vendedor', key: 'vendedor', width: 30 },
      { header: 'Observaciones', key: 'observaciones', width: 40 },
      { header: 'Motivo Visita', key: 'motivoVisita', width: 20 },
      { header: 'Tipo Visita', key: 'tipoVisita', width: 20 },
      { header: 'Estado Visita', key: 'estadoVisita', width: 15 },
      { header: 'Ventas Asociadas', key: 'ventas', width: 50 },
    ];

    visitas.forEach((visita) => {
      const inicio = visita.inicio
        ? formatearFecha(visita.inicio.toISOString())
        : 'N/A';
      const fin = visita.fin ? formatearFecha(visita.fin.toISOString()) : 'N/A';

      const cliente =
        `${visita.cliente?.nombre || ''} ${visita.cliente?.apellido || ''}`.trim() ||
        'N/A';
      const vendedor = `${visita.vendedor?.nombre || 'N/A'})`;

      const ventas =
        visita.ventas.length > 0
          ? visita.ventas
              .map((venta) => {
                const productos = venta.productos
                  .map(
                    (producto) =>
                      `${producto.producto.nombre} (x${producto.cantidad})`,
                  )
                  .join(', ');

                return `Venta ID: ${venta.id}, Monto: Q${venta.monto.toFixed(
                  2,
                )}, Monto con Descuento: Q${venta.montoConDescuento?.toFixed(
                  2,
                )}, Descuento: ${venta.descuento || 0}%, Productos: [${productos}]`;
              })
              .join('; ')
          : 'Sin ventas';

      sheet.addRow({
        id: visita.id,
        inicio,
        fin,
        cliente,
        telefono: visita.cliente?.telefono || 'N/A',
        correo: visita.cliente?.correo || 'N/A',
        vendedor,
        observaciones: visita.observaciones || 'N/A',
        motivoVisita: visita.motivoVisita || 'N/A',
        tipoVisita: visita.tipoVisita || 'N/A',
        estadoVisita: visita.estadoVisita,
        ventas,
      });
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  // SERVICE PARA GENERAR REPORTE DE INVENTARIO
  async generarExcelInventario(
    from?: Date,
    to?: Date,
    categoria?: string,
    proveedor?: string,
    minStock?: number,
    maxStock?: number,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<Buffer> {
    const productos = await this.prisma.producto.findMany({
      where: {
        AND: [
          from && to
            ? {
                creadoEn: { gte: from },
                actualizadoEn: { lte: to },
              }
            : {},
          categoria
            ? {
                categorias: {
                  some: { categoria: { nombre: categoria } },
                },
              }
            : {},
          proveedor
            ? {
                stock: {
                  proveedor: { nombre: proveedor },
                },
              }
            : {},
          minStock || maxStock
            ? {
                stock: {
                  cantidad: {
                    ...(minStock !== undefined ? { gte: minStock } : {}),
                    ...(maxStock !== undefined ? { lte: maxStock } : {}),
                  },
                },
              }
            : {},
          minPrice || maxPrice
            ? {
                precio: {
                  ...(minPrice !== undefined ? { gte: minPrice } : {}),
                  ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
                },
              }
            : {},
        ],
      },
      include: {
        stock: {
          include: {
            proveedor: {
              select: {
                nombre: true,
                telefono: true,
                correo: true,
              },
            },
          },
        },
        categorias: {
          include: {
            categoria: { select: { nombre: true } },
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Inventario');

    sheet.columns = [
      { header: 'ID Producto', key: 'id', width: 15 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Código', key: 'codigo', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 50 },
      { header: 'Precio Venta', key: 'precio', width: 15 },
      { header: 'Cantidad Stock', key: 'cantidadStock', width: 20 },
      { header: 'Proveedor', key: 'proveedor', width: 30 },
      { header: 'Teléfono Proveedor', key: 'telefonoProveedor', width: 20 },
      { header: 'Correo Proveedor', key: 'correoProveedor', width: 30 },
      { header: 'Categorías', key: 'categorias', width: 40 },
      { header: 'Creado En', key: 'creadoEn', width: 20 },
      { header: 'Actualizado En', key: 'actualizadoEn', width: 20 },
    ];

    productos.forEach((producto) => {
      sheet.addRow({
        id: producto.id,
        nombre: producto.nombre,
        codigo: producto.codigoProducto,
        descripcion: producto.descripcion || 'Sin descripción',
        precio: producto.precio.toFixed(2),
        cantidadStock: producto.stock?.cantidad || 0,
        proveedor: producto.stock?.proveedor?.nombre || 'Sin proveedor',
        telefonoProveedor: producto.stock?.proveedor?.telefono || 'N/A',
        correoProveedor: producto.stock?.proveedor?.correo || 'N/A',
        categorias: producto.categorias
          .map((cat) => cat.categoria.nombre)
          .join(', '),
        creadoEn: formatearFecha(producto.creadoEn.toString()),
        actualizadoEn: formatearFecha(producto.actualizadoEn.toString()),
      });
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  async generarExcelEntregas(
    from?: Date,
    to?: Date,
    proveedorId?: number,
  ): Promise<Buffer> {
    const entregas = await this.prisma.entregaStock.findMany({
      where: {
        ...(from && to && { timestamp: { gte: from, lte: to } }),
        ...(proveedorId && { proveedorId }),
      },
      include: {
        proveedor: {
          select: { nombre: true, telefono: true, correo: true },
        },
        productos: {
          include: {
            producto: {
              select: { nombre: true, codigoProducto: true },
            },
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Historial de Entregas');

    sheet.columns = [
      { header: 'ID Entrega', key: 'id', width: 15 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Proveedor', key: 'proveedor', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Correo', key: 'correo', width: 30 },
      { header: 'Productos Entregados', key: 'productos', width: 50 },
      { header: 'Total Pagado', key: 'totalPagado', width: 20 },
    ];

    entregas.forEach((entrega) => {
      const productos = entrega.productos
        .map(
          (p) =>
            `${p.producto.nombre} (Código: ${p.producto.codigoProducto}), Cantidad: ${
              p.cantidad
            }, Costo Unitario: Q${p.costoUnitario.toFixed(2)}`,
        )
        .join('; ');

      sheet.addRow({
        id: entrega.id,
        fecha: formatearFecha(entrega.timestamp.toISOString()),
        proveedor: entrega.proveedor?.nombre || 'Sin Proveedor',
        telefono: entrega.proveedor?.telefono || 'N/A',
        correo: entrega.proveedor?.correo || 'N/A',
        productos,
        totalPagado: `Q${entrega.total_pagado.toFixed(2)}`,
      });
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  //GENERAR ASISTENCIAS REPORTE
  //GENERAR ASISTENCIAS REPORTE
  async generarAsistenciasReport(from?: Date, to?: Date): Promise<Buffer> {
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        ...(from && to && { creadoEn: { gte: from, lte: to } }),
      },
      include: {
        usuario: {
          select: { nombre: true, rol: true },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Historial de Entregas');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: 'Fecha Creación', key: 'fecha', width: 30 },
      { header: 'Usuario', key: 'usuario', width: 30 },
      { header: 'Rol', key: 'rol', width: 10 },

      { header: 'Entrada', key: 'entrada', width: 20 },
      { header: 'Salida', key: 'salida', width: 30 },
    ];

    asistencias.forEach((asistencia) => {
      sheet.addRow({
        id: asistencia.id,
        fecha: asistencia.entrada
          ? formatearFecha(asistencia.entrada.toISOString())
          : 'N/A',
        usuario: asistencia.usuario?.nombre || 'Sin usuario',
        rol: asistencia.usuario?.rol || 'Sin usuario',
        entrada: asistencia.entrada
          ? formatearFecha(asistencia.entrada.toISOString())
          : 'N/A',
        salida: asistencia.salida
          ? formatearFecha(asistencia.salida.toISOString())
          : 'N/A',
      });
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  //GENERAR REPORTE DE EMPLEADOS
  async generarReporteUsuarios(from?: Date, to?: Date): Promise<Buffer> {
    // Obtener usuarios con datos relacionados
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        activo: true,
        ...(from &&
          to && {
            creadoEn: {
              gte: from,
              lte: to,
            },
          }),
      },
      include: {
        ventas: true,
        prospectos: true,
        visitas: true,
        registrosAsistencia: true,
      },
    });

    // Crear workbook y hoja
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Usuarios');

    // Configurar columnas
    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Correo', key: 'correo', width: 30 },
      { header: 'Contraseña', key: 'contraseña', width: 30 },
      { header: 'Rol', key: 'rol', width: 20 },
      { header: 'Número de Prospectos', key: 'numProspectos', width: 20 },
      { header: 'Número de Ventas', key: 'numVentas', width: 20 },
      { header: 'Número de Visitas', key: 'numVisitas', width: 20 },
      { header: 'Asistencias Abiertas', key: 'asistenciasAbiertas', width: 20 },
      { header: 'Asistencias Cerradas', key: 'asistenciasCerradas', width: 20 },
      { header: 'Fecha de Creación', key: 'creadoEn', width: 30 },
    ];

    // Agregar filas
    usuarios.forEach((usuario) => {
      const asistenciasAbiertas = usuario.registrosAsistencia.filter(
        (a) => !a.salida,
      ).length;
      const asistenciasCerradas = usuario.registrosAsistencia.filter(
        (a) => !!a.salida,
      ).length;

      sheet.addRow({
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        contraseña: usuario.contrasena,

        rol: usuario.rol,
        numProspectos: usuario.prospectos.length,
        numVentas: usuario.ventas.length,
        numVisitas: usuario.visitas.length,
        asistenciasAbiertas,
        asistenciasCerradas,
        creadoEn: usuario.creadoEn.toISOString(),
      });
    });

    // Escribir buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
