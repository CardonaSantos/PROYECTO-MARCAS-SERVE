import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrismaService } from 'src/prisma.service';
import * as ExcelJS from 'exceljs';
import { EstadoProspecto, EstadoVisita, MotivoVisita } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { format } from 'date-fns';
// import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
//
const formatearFecha = (fecha) => {
  const zonaHoraria = 'America/Guatemala'; // Zona horaria de Guatemala
  const date = new Date(fecha);

  // Validar que la fecha es válida
  if (isNaN(date.getTime())) {
    throw new Error('Fecha inválida');
  }

  // Convertir la fecha UTC a la zona horaria de Guatemala
  const fechaLocal = toZonedTime(date, zonaHoraria);

  // Formatear la fecha local
  return format(fechaLocal, 'dd/MM/yyyy hh:mm a');
};

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
    from?: string,
    to?: string,
    minTotal: number = 0,
    maxTotal: number = Infinity,
    useDiscounted: boolean = false,
  ): Promise<Buffer> {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    if (toDate) {
      // Ajustar `toDate` para que incluya todo el día
      toDate.setHours(23, 59, 59, 999);
    }

    const whereConditions: any = {};

    if (fromDate && toDate) {
      whereConditions.timestamp = {
        gte: fromDate, // Desde la fecha de inicio
        lte: toDate, // Hasta la fecha de fin a las 23:59:59
      };
    } else if (fromDate) {
      whereConditions.timestamp = { gte: fromDate };
    } else if (toDate) {
      whereConditions.timestamp = { lte: toDate };
    }

    console.log('El where condicion es: ', whereConditions);

    // Filtrar por monto total o con descuento según useDiscounted
    const montoKey = useDiscounted ? 'montoConDescuento' : 'monto';
    whereConditions[montoKey] = { gte: minTotal };
    if (maxTotal !== Infinity) {
      whereConditions[montoKey].lte = maxTotal;
    }

    const ventas = await this.prisma.venta.findMany({
      where: whereConditions,
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            municipio: { select: { nombre: true } },
            departamento: { select: { nombre: true } },
            tipoCliente: true,
          },
        },
        vendedor: { select: { nombre: true } },
        productos: {
          select: {
            cantidad: true,
            producto: { select: { nombre: true } },
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
      });
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  // REPORTE DE CLIENTES
  async generarExcelClientesFiltrados(
    from?: string,
    to?: string,
    minCompras?: number,
    maxCompras?: number,
    minGastado?: number,
    maxGastado?: number,
    municipio?: string,
    departamento?: string,
  ): Promise<Buffer> {
    try {
      console.log('Entrando al servicio de generación de Excel de clientes');

      // Convertir fechas a objetos Date
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      const whereConditions: any = {};

      if (fromDate && toDate) {
        // Rango de fechas
        toDate.setHours(23, 59, 59, 999);
        whereConditions.creadoEn = { gte: fromDate, lte: toDate };
      } else if (fromDate) {
        // Filtrar desde `from` en adelante
        whereConditions.creadoEn = { gte: fromDate };
      } else if (toDate) {
        // Filtrar SOLO los clientes creados en la fecha `to`
        toDate.setHours(23, 59, 59, 999);
        const startOfDay = new Date(to);
        startOfDay.setHours(0, 0, 0, 0);
        whereConditions.creadoEn = { gte: startOfDay, lte: toDate };
      }

      if (municipio) {
        whereConditions.municipio = { nombre: municipio };
      }

      if (departamento) {
        whereConditions.departamento = { nombre: departamento };
      }

      console.log(
        'Condiciones de búsqueda:',
        JSON.stringify(whereConditions, null, 2),
      );

      // Buscar clientes según los filtros
      const clientes = await this.prisma.cliente.findMany({
        where: whereConditions,
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
              id: true,
              monto: true,
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
    } catch (error) {
      console.error('Error al generar Excel de clientes filtrados:', error);
      throw new Error(
        'Hubo un problema generando el Excel de clientes filtrados.',
      );
    }
  }

  //PROSPECTOS REPORT

  async generarExcelProspectos(
    from?: string,
    to?: string,
    estado?: EstadoProspecto,
  ): Promise<Buffer> {
    try {
      // Convertir fechas a objetos Date
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      if (toDate) {
        // Ajustar `toDate` para que sea inclusiva (último milisegundo del día)
        toDate.setHours(23, 59, 59, 999);
      }

      // Construcción del filtro
      const whereConditions: any = {};

      if (fromDate && toDate) {
        whereConditions.inicio = { gte: fromDate, lte: toDate };
      } else if (fromDate) {
        whereConditions.inicio = { gte: fromDate };
      } else if (toDate) {
        whereConditions.inicio = { lte: toDate };
      }

      if (estado) {
        whereConditions.estado = estado;
      }

      console.log(
        'El where generado es:',
        JSON.stringify(whereConditions, null, 2),
      );

      // Obtener prospectos desde la base de datos
      const prospectos = await this.prisma.prospecto.findMany({
        where: whereConditions,
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

      // Crear archivo Excel
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

      // Llenar el Excel con los datos
      prospectos.forEach((prospecto) => {
        sheet.addRow({
          id: prospecto.id,
          inicio: prospecto.inicio
            ? formatearFecha(prospecto.inicio.toISOString())
            : 'N/A',
          fin: prospecto.fin
            ? formatearFecha(prospecto.fin.toISOString())
            : 'N/A',
          nombreCompleto:
            `${prospecto?.nombreCompleto || ''} ${prospecto?.apellido || ''}`.trim() ||
            'N/A',
          empresaTienda: prospecto.empresaTienda || 'N/A',
          telefono: prospecto.telefono || prospecto.cliente?.telefono || 'N/A',
          correo: prospecto.correo || prospecto.cliente?.correo || 'N/A',
          direccion: prospecto.direccion || 'N/A',
          estado: prospecto.estado || 'N/A',
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

      // Convertir el Excel a buffer y devolverlo
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
    from?: string,
    to?: string,
    estado?: EstadoVisita,
    motivo?: MotivoVisita,
  ): Promise<Buffer> {
    try {
      // Convertir fechas a objetos Date
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      if (toDate) {
        // Ajustar `toDate` para que sea inclusiva (último milisegundo del día)
        toDate.setHours(23, 59, 59, 999);
      }

      // Construcción del filtro
      const whereConditions: any = {};

      if (fromDate && toDate) {
        whereConditions.inicio = { gte: fromDate, lte: toDate };
      } else if (fromDate) {
        whereConditions.inicio = { gte: fromDate };
      } else if (toDate) {
        whereConditions.inicio = { lte: toDate };
      }

      if (estado) {
        whereConditions.estadoVisita = estado;
      }

      if (motivo) {
        whereConditions.motivoVisita = motivo;
      }

      console.log(
        'El where generado es:',
        JSON.stringify(whereConditions, null, 2),
      );

      // Obtener visitas desde la base de datos
      const visitas = await this.prisma.visita.findMany({
        where: whereConditions,
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
                  producto: { select: { nombre: true } },
                },
              },
            },
          },
        },
      });

      // Crear archivo Excel
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

      // Llenar el Excel con los datos
      visitas.forEach((visita) => {
        sheet.addRow({
          id: visita.id,
          inicio: visita.inicio
            ? formatearFecha(visita.inicio.toISOString())
            : 'N/A',
          fin: visita.fin ? formatearFecha(visita.fin.toISOString()) : 'N/A',
          cliente:
            `${visita.cliente?.nombre || ''} ${visita.cliente?.apellido || ''}`.trim() ||
            'N/A',
          telefono: visita.cliente?.telefono || 'N/A',
          correo: visita.cliente?.correo || 'N/A',
          vendedor: `${visita.vendedor?.nombre || 'N/A'}`,
          observaciones: visita.observaciones || 'N/A',
          motivoVisita: visita.motivoVisita || 'N/A',
          tipoVisita: visita.tipoVisita || 'N/A',
          estadoVisita: visita.estadoVisita || 'N/A',
          ventas: visita.ventas.length
            ? visita.ventas
                .map(
                  (venta) =>
                    `Venta ID: ${venta.id}, Monto: Q${venta.monto.toFixed(2)}, ` +
                    `Monto con Descuento: Q${venta.montoConDescuento?.toFixed(2)}, ` +
                    `Descuento: ${venta.descuento || 0}%, ` +
                    `Productos: [${venta.productos
                      .map((p) => `${p.producto.nombre} (x${p.cantidad})`)
                      .join(', ')}]`,
                )
                .join('; ')
            : 'Sin ventas',
        });
      });

      // Convertir el Excel a buffer y devolverlo
      const uint8Array = await workbook.xlsx.writeBuffer();
      return Buffer.from(uint8Array);
    } catch (error) {
      console.error('Error al generar Excel de visitas:', error);
      throw new Error('Hubo un problema generando el Excel de visitas.');
    }
  }

  // SERVICE PARA GENERAR REPORTE DE INVENTARIO
  async generarExcelInventario(
    from?: string,
    to?: string,
    categoria?: string,
    proveedor?: string,
    minStock: number = 0,
    maxStock: number = Infinity,
    minPrice: number = 0,
    maxPrice: number = Infinity,
  ): Promise<Buffer> {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    if (toDate) {
      // Ajustar `toDate` para incluir todo el día
      toDate.setHours(23, 59, 59, 999);
    }

    const whereConditions: any = {};

    // Filtro por fechas
    if (fromDate && toDate) {
      whereConditions.creadoEn = { gte: fromDate, lte: toDate };
    } else if (fromDate) {
      whereConditions.creadoEn = { gte: fromDate };
    } else if (toDate) {
      whereConditions.creadoEn = { lte: toDate }; // ✅ Esto estaba mal antes
    }

    // Filtrar por categoría
    if (categoria) {
      whereConditions.categorias = {
        some: { categoria: { nombre: categoria } },
      };
    }

    // Filtrar por proveedor
    if (proveedor) {
      whereConditions.stock = {
        proveedor: { nombre: proveedor },
      };
    }

    // Filtrar por stock, pero incluir productos sin stock
    if (minStock > 0 || maxStock !== Infinity) {
      whereConditions.OR = [
        { stock: { cantidad: { gte: minStock, lte: maxStock } } }, // Productos con stock dentro del rango
        { stock: null }, // Productos sin stock
      ];
    }

    // Filtrar por precio
    whereConditions.precio = { gte: minPrice };
    if (maxPrice !== Infinity) {
      whereConditions.precio.lte = maxPrice;
    }

    console.log('El where condicion es: ', whereConditions);
    console.log(
      'El where generado es: ',
      JSON.stringify(whereConditions, null, 2),
    );

    const productos = await this.prisma.producto.findMany({
      where: whereConditions,
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
    from?: string,
    to?: string,
    proveedorId?: number,
  ): Promise<Buffer> {
    try {
      console.log('Entrando al servicio de generación de Excel de entregas');

      // Convertir fechas a objetos Date
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      const whereConditions: any = {};

      if (fromDate && toDate) {
        // Si se proporciona ambas fechas, aplicar un rango de fechas
        toDate.setHours(23, 59, 59, 999);
        whereConditions.timestamp = { gte: fromDate, lte: toDate };
      } else if (fromDate) {
        // Si solo hay `from`, filtrar desde esa fecha en adelante
        whereConditions.timestamp = { gte: fromDate };
      } else if (toDate) {
        // Si solo hay `to`, filtrar SOLO registros de esa fecha
        toDate.setHours(23, 59, 59, 999);
        const startOfDay = new Date(to);
        startOfDay.setHours(0, 0, 0, 0);
        whereConditions.timestamp = { gte: startOfDay, lte: toDate };
      }

      if (proveedorId) {
        whereConditions.proveedorId = proveedorId;
      }

      console.log(
        'Condiciones de búsqueda:',
        JSON.stringify(whereConditions, null, 2),
      );

      // Buscar entregas con los filtros aplicados
      const entregas = await this.prisma.entregaStock.findMany({
        where: whereConditions,
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

      // Creación del Excel
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

      // Convertir a Buffer
      const uint8Array = await workbook.xlsx.writeBuffer();
      return Buffer.from(uint8Array);
    } catch (error) {
      console.error('Error al generar el Excel de entregas:', error);
      throw new Error('Hubo un problema generando el Excel de entregas.');
    }
  }

  //GENERAR ASISTENCIAS REPORTE
  //GENERAR ASISTENCIAS REPORTE
  async generarAsistenciasReport(from?: Date, to?: Date): Promise<Buffer> {
    try {
      console.log('Generando reporte de asistencias...');

      // Convertir fechas a objetos Date y ajustar rangos
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      const whereConditions: any = {};

      if (fromDate && toDate) {
        // Rango de fechas
        toDate.setHours(23, 59, 59, 999);
        whereConditions.creadoEn = { gte: fromDate, lte: toDate };
      } else if (fromDate) {
        // Filtrar desde `from` en adelante
        whereConditions.creadoEn = { gte: fromDate };
      } else if (toDate) {
        // Filtrar SOLO las asistencias de la fecha `to`
        toDate.setHours(23, 59, 59, 999);
        const startOfDay = new Date(to);
        startOfDay.setHours(0, 0, 0, 0);
        whereConditions.creadoEn = { gte: startOfDay, lte: toDate };
      }

      console.log(
        'Condiciones de búsqueda:',
        JSON.stringify(whereConditions, null, 2),
      );

      // Buscar asistencias según los filtros
      const asistencias = await this.prisma.asistencia.findMany({
        where: whereConditions,
        include: {
          usuario: {
            select: { nombre: true, rol: true },
          },
        },
      });

      // Crear el archivo Excel
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Historial de Asistencias');

      sheet.columns = [
        { header: 'ID', key: 'id', width: 15 },
        { header: 'Fecha Creación', key: 'fecha', width: 30 },
        { header: 'Usuario', key: 'usuario', width: 30 },
        { header: 'Rol', key: 'rol', width: 15 },
        { header: 'Entrada', key: 'entrada', width: 20 },
        { header: 'Salida', key: 'salida', width: 20 },
      ];

      asistencias.forEach((asistencia) => {
        sheet.addRow({
          id: asistencia.id,
          fecha: asistencia.entrada
            ? formatearFecha(asistencia.entrada.toISOString())
            : 'N/A',
          usuario: asistencia.usuario?.nombre || 'Sin usuario',
          rol: asistencia.usuario?.rol || 'Sin rol',
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
    } catch (error) {
      console.error('Error al generar reporte de asistencias:', error);
      throw new Error('Hubo un problema generando el reporte de asistencias.');
    }
  }

  //GENERAR REPORTE DE EMPLEADOS
  async generarReporteUsuarios(from?: string, to?: string): Promise<Buffer> {
    try {
      console.log('Generando reporte de usuarios...');

      // Convertir fechas a objetos Date
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
      }

      // Construcción del filtro
      const whereConditions: any = { activo: true };

      if (fromDate && toDate) {
        whereConditions.creadoEn = { gte: fromDate, lte: toDate };
      } else if (fromDate) {
        whereConditions.creadoEn = { gte: fromDate };
      } else if (toDate) {
        whereConditions.creadoEn = { lte: toDate };
      }

      console.log(
        'Condiciones de búsqueda:',
        JSON.stringify(whereConditions, null, 2),
      );

      // Obtener usuarios con datos relacionados
      const usuarios = await this.prisma.usuario.findMany({
        where: whereConditions,
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

        { header: 'Total Prospectos', key: 'numProspectos', width: 20 },
        {
          header: 'Prospectos Cancelados',
          key: 'prospectosCancelados',
          width: 25,
        },
        {
          header: 'Prospectos Concretados',
          key: 'prospectosConcretados',
          width: 25,
        },
        {
          header: 'Prospectos Finalizados',
          key: 'prospectosFinalizados',
          width: 25,
        },

        { header: 'Total Ventas', key: 'numVentas', width: 20 },

        { header: 'Total Visitas', key: 'numVisitas', width: 20 },
        { header: 'Visitas Canceladas', key: 'visitasCanceladas', width: 25 },
        { header: 'Visitas Realizadas', key: 'visitasRealizadas', width: 25 },
        { header: 'Visitas Finalizadas', key: 'visitasFinalizadas', width: 25 },

        {
          header: 'Asistencias Abiertas',
          key: 'asistenciasAbiertas',
          width: 20,
        },
        {
          header: 'Asistencias Cerradas',
          key: 'asistenciasCerradas',
          width: 20,
        },
        {
          header: 'Asistencias Completadas',
          key: 'asistenciasCompletadas',
          width: 25,
        },

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
        const asistenciasCompletadas = usuario.registrosAsistencia.filter(
          (a) => a.entrada && a.salida,
        ).length;

        const prospectosCancelados = usuario.prospectos.filter(
          (p) => p.estado === 'CERRADO',
        ).length;
        const prospectosConcretados = usuario.prospectos.filter(
          (p) => p.estado !== 'FINALIZADO',
        ).length;
        const prospectosFinalizados = usuario.prospectos.filter(
          (p) => p.estado === 'FINALIZADO',
        ).length;

        const visitasCanceladas = usuario.visitas.filter(
          (v) => v.estadoVisita === 'CANCELADA',
        ).length;
        const visitasRealizadas = usuario.visitas.filter(
          (v) => v.estadoVisita !== 'CANCELADA',
        ).length;
        const visitasFinalizadas = usuario.visitas.filter(
          (v) => v.estadoVisita === 'FINALIZADA',
        ).length;

        sheet.addRow({
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          contraseña: usuario.contrasena,
          rol: usuario.rol,

          numProspectos: usuario.prospectos.length,
          prospectosCancelados,
          prospectosConcretados,
          prospectosFinalizados,

          numVentas: usuario.ventas.length,

          numVisitas: usuario.visitas.length,
          visitasCanceladas,
          visitasRealizadas,
          visitasFinalizadas,

          asistenciasAbiertas,
          asistenciasCerradas,
          asistenciasCompletadas,

          creadoEn: formatearFecha(usuario.creadoEn.toISOString()),
        });
      });

      // Escribir buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Error al generar reporte de usuarios:', error);
      throw new Error('Hubo un problema generando el reporte de usuarios.');
    }
  }

  async generarCreditosReport(from?: Date, to?: Date): Promise<Buffer> {
    try {
      console.log('Generando reporte de créditos...');

      // Convertir fechas a objetos Date y ajustar rangos
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      const whereConditions: any = {};

      if (fromDate && toDate) {
        // Rango de fechas
        toDate.setHours(23, 59, 59, 999);
        whereConditions.createdAt = { gte: fromDate, lte: toDate };
      } else if (fromDate) {
        // Filtrar desde `from` en adelante
        whereConditions.createdAt = { gte: fromDate };
      } else if (toDate) {
        // Filtrar SOLO los créditos de la fecha `to`
        toDate.setHours(23, 59, 59, 999);
        const startOfDay = new Date(to);
        startOfDay.setHours(0, 0, 0, 0);
        whereConditions.createdAt = { gte: startOfDay, lte: toDate };
      }

      console.log(
        'Condiciones de búsqueda:',
        JSON.stringify(whereConditions, null, 2),
      );

      // Buscar créditos según los filtros
      const creditos = await this.prisma.credito.findMany({
        where: whereConditions,
        include: {
          cliente: {
            select: { nombre: true, telefono: true },
          },
          pagos: {
            select: {
              id: true,
              monto: true,
              timestamp: true,
              metodoPago: true,
            },
          },
        },
      });

      // Crear el archivo Excel
      const workbook = new ExcelJS.Workbook();
      const creditosSheet = workbook.addWorksheet('Historial de Créditos');
      const pagosSheet = workbook.addWorksheet('Pagos de Créditos');

      creditosSheet.columns = [
        { header: 'ID Crédito', key: 'id', width: 15 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Monto Total', key: 'montoTotal', width: 15 },
        { header: 'Monto con Interés', key: 'montoConInteres', width: 20 },
        { header: 'Interés (%)', key: 'interes', width: 15 },
        { header: 'Saldo Pendiente', key: 'saldoPendiente', width: 20 },
        { header: 'Fecha Inicio', key: 'fechaInicio', width: 20 },
        { header: 'Estado', key: 'estado', width: 15 },
      ];

      pagosSheet.columns = [
        { header: 'ID Crédito', key: 'creditoId', width: 15 },
        { header: 'ID Pago', key: 'id', width: 15 },
        { header: 'Monto', key: 'monto', width: 15 },
        { header: 'Fecha Pago', key: 'timestamp', width: 20 },
        { header: 'Método Pago', key: 'metodoPago', width: 20 },
      ];

      creditos.forEach((credito) => {
        creditosSheet.addRow({
          id: credito.id,
          cliente: credito.cliente?.nombre || 'Sin cliente',
          telefono: credito.cliente?.telefono || 'N/A',
          montoTotal: credito.montoTotal,
          montoConInteres: credito.montoTotalConInteres,
          interes: credito.interes,
          saldoPendiente: credito.saldoPendiente,
          fechaInicio: formatearFecha(credito.fechaInicio.toISOString()),
          estado: credito.estado,
        });

        credito.pagos.forEach((pago) => {
          pagosSheet.addRow({
            creditoId: credito.id,
            id: pago.id,
            monto: pago.monto,
            timestamp: formatearFecha(pago.timestamp.toISOString()),
            metodoPago: pago.metodoPago,
          });
        });
      });

      const uint8Array = await workbook.xlsx.writeBuffer();
      return Buffer.from(uint8Array);
    } catch (error) {
      console.error('Error al generar reporte de créditos:', error);
      throw new Error('Hubo un problema generando el reporte de créditos.');
    }
  }
}
