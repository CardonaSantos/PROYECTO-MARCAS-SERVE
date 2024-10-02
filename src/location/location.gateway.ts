import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { LocationDto } from './dto/location.dto';
import { Server, Socket } from 'socket.io';
import { time } from 'console';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationService } from './location.service';
import { forwardRef, Inject } from '@nestjs/common';
import { ProspectoService } from 'src/prospecto/prospecto.service';

// const allowedSocketOrigin = process.env.CORS_ORIGIN;
const allowedSocketOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'; // Asegúrate de que esto incluya tu dominio real

interface location {
  latitud: number;
  longitud: number;
  usuarioId: number;
  prospectos: Prospectos;
}

enum Estado {
  EN_PROSPECTO = 'EN_PROSPECTO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

interface Prospectos {
  estado: Estado;
  inicio: string;
  nombreCompleto: string;
  empresaTienda: string;
}

//---------------------------------
@WebSocketGateway({
  cors: {
    // origin: allowedSocketOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
})
export class LocationGateway {
  @WebSocketServer()
  server: Server;

  private users: Map<number, string> = new Map();
  private employees: Map<number, string> = new Map();
  private admins: Map<number, string> = new Map();

  constructor(
    @Inject(forwardRef(() => LocationService))
    private readonly locationService: LocationService,
  ) {}

  // Actualizamos a los admins con los usuarios conectados
  private updateAdmins() {
    const totalConnectedUsers = this.getTotalConnectedUsers();
    const totalEmployees = this.getConnectedEmployees();
    const totalAdmins = this.getConnectedAdmins();

    const data = {
      totalConnectedUsers,
      totalEmployees,
      totalAdmins,
    };

    this.admins.forEach((socketId) => {
      this.server.to(socketId).emit('updateConnectedUsers', data);
    });
  }

  handleConnection(client: Socket) {
    const userId = this.getUserIdFromClient(client);
    const role = client.handshake.query.role as string;

    if (!isNaN(userId)) {
      if (role === 'ADMIN') {
        this.admins.set(userId, client.id);
      } else {
        this.employees.set(userId, client.id);
      }
      console.log(`${role} conectado: ${client.id} Usuario ID: ${userId}`);
    } else {
      console.log(`Cliente conectado ${client.id} Usuario ID NaN`);
    }

    console.log('Usuario conectado..');

    this.updateAdmins(); // Notificar después de la conexión
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromClient(client);
    const role = client.handshake.query.role as string;

    if (!isNaN(userId)) {
      if (role === 'ADMIN') {
        this.admins.delete(userId);
      } else {
        this.employees.delete(userId);
      }
      console.log(`${role} desconectado: ${client.id} Usuario ID: ${userId}`);
    }

    this.updateAdmins(); // Notificar después de la desconexión
  }

  // @SubscribeMessage('sendLocation')
  // async handleSendLocationToAdmin(
  //   client: Socket,
  //   locationData: CreateLocationDto,
  // ) {
  //   console.log('Ubicación recibida: ', locationData);

  //   // Intentar encontrar una ubicación existente para este usuario
  //   const existingLocation = await this.locationService.findLocationByUserId(
  //     locationData.usuarioId,
  //   );

  //   if (existingLocation) {
  //     // Si existe, actualizar el registro
  //     console.log(
  //       'Actualizando anterior registro de ubicacion de los usuarios...',
  //     );
  //     console.log('EL ID DEL REGISTRO ANTERIOR ES:  ', existingLocation.id);
  //     console.log('EL registro con info del user es: ', existingLocation);

  //     console.log('==================>');

  //     await this.locationService.updateLocation(
  //       existingLocation.id,
  //       locationData,
  //     );
  //   } else {
  //     // Si no existe, crear una nueva ubicación
  //     await this.locationService.createLocation(locationData);
  //   }

  //   // Enviar la ubicación solo a los administradores conectados
  //   this.admins.forEach((socketId) => {
  //     if (this.server.sockets.sockets.get(socketId)) {
  //       this.server.to(socketId).emit('receiveLocation', locationData);
  //     }
  //   });
  // }

  @SubscribeMessage('sendLocation')
  async handleSendLocationToAdmin(client: Socket, locationData: location) {
    console.log('Ubicación recibida: ', locationData);

    // Intentar encontrar una ubicación existente para este usuario
    const existingLocation = await this.locationService.findLocationByUserId(
      locationData.usuarioId,
    );

    let locationToSend;

    if (existingLocation) {
      // Si existe, actualizar el registro
      await this.locationService.updateLocation(
        existingLocation.id,
        locationData,
      );

      // Asigna la información completa a locationToSend
      locationToSend = {
        ...existingLocation,
        latitud: existingLocation.latitud,
        longitud: existingLocation.longitud,
        usuario: {
          id: existingLocation.usuario.id,
          nombre: existingLocation.usuario.nombre,
          rol: existingLocation.usuario.rol,
          prospecto: existingLocation.usuario.prospectos[0] || null, // Incluye el prospecto
          asistencia: existingLocation.usuario.registrosAsistencia[0] || null, // Incluye la asistencia
        },
      };
    } else {
      // Si no existe, crea una nueva ubicación
      const newLocation =
        await this.locationService.createLocation(locationData);
      const userInfo = await this.locationService.finUnique(
        Number(locationData.usuarioId),
      );

      // Asigna la información completa a locationToSend
      locationToSend = {
        ...newLocation,
        usuario: {
          id: locationData.usuarioId,
          nombre: userInfo?.nombre || 'Desconocido',
          rol: userInfo?.rol || 'Desconocido',
          prospecto: userInfo?.prospectos[0] || null,
          asistencia: userInfo?.registrosAsistencia[0] || null,
        },
      };
    }

    // Enviar la ubicación con la información del usuario solo a los administradores conectados
    this.admins.forEach((socketId) => {
      if (this.server.sockets.sockets.get(socketId)) {
        this.server.to(socketId).emit('receiveLocation', locationToSend);
      }
    });
  }
  //   @SubscribeMessage('sendLocation')
  // async handleSendLocationToAdmin(client: Socket, locationData: location) {
  //   console.log('Ubicación recibida: ', locationData);

  //   // Intentar encontrar una ubicación existente para este usuario
  //   const existingLocation = await this.locationService.findLocationByUserId(
  //     locationData.usuarioId,
  //   );

  //   let locationToSend;

  //   if (existingLocation) {
  //     // Si existe, actualizar el registro
  //     await this.locationService.updateLocation(
  //       existingLocation.id,
  //       locationData,
  //     );

  //     // Obtener información actualizada del usuario con prospecto y asistencia
  //     const userInfo = await this.locationService.finUnique(
  //       locationData.usuarioId,
  //     );

  //     // Asigna la información completa a locationToSend
  //     locationToSend = {
  //       ...existingLocation,
  //       latitud: locationData.latitud, // Actualiza la latitud/longitud recibida
  //       longitud: locationData.longitud,
  //       usuario: {
  //         id: userInfo?.id || existingLocation.usuario.id,
  //         nombre: userInfo?.nombre || existingLocation.usuario.nombre,
  //         rol: userInfo?.rol || existingLocation.usuario.rol,
  //         prospecto: userInfo?.prospectos[0] || null, // Incluye el prospecto
  //         asistencia: userInfo?.registrosAsistencia[0] || null, // Incluye la asistencia
  //       },
  //     };
  //   } else {
  //     // Si no existe, crea una nueva ubicación
  //     const newLocation = await this.locationService.createLocation(locationData);
  //     const userInfo = await this.locationService.finUnique(
  //       Number(locationData.usuarioId),
  //     );

  //     // Asigna la información completa a locationToSend
  //     locationToSend = {
  //       ...newLocation,
  //       usuario: {
  //         id: locationData.usuarioId,
  //         nombre: userInfo?.nombre || 'Desconocido',
  //         rol: userInfo?.rol || 'Desconocido',
  //         prospecto: userInfo?.prospectos[0] || null,
  //         asistencia: userInfo?.registrosAsistencia[0] || null,
  //       },
  //     };
  //   }

  //   // Enviar la ubicación con la información del usuario solo a los administradores conectados
  //   this.admins.forEach((socketId) => {
  //     if (this.server.sockets.sockets.get(socketId)) {
  //       this.server.to(socketId).emit('receiveLocation', locationToSend);
  //     }
  //   });
  // }

  private getUserIdFromClient(client: Socket): number {
    return parseInt(client.handshake.query.userId as string, 10);
  }

  getTotalConnectedUsers(): number {
    return this.admins.size + this.employees.size;
  }

  getConnectedEmployees(): number {
    return this.employees.size;
  }

  getConnectedAdmins(): number {
    return this.admins.size;
  }
}
