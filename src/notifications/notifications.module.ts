// notifications.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from 'src/prisma.service';
import { LocationModule } from 'src/location/location.module'; // Importa el LocationModule

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, PrismaService],
  imports: [forwardRef(() => LocationModule)], // Agrega la importación aquí
})
//xd
export class NotificationsModule {}
