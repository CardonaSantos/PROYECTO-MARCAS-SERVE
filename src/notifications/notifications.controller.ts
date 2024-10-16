import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Get('/notifications/for-admin/:id')
  findNotificationsForMyAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.findNotificationsForMyAdmin(id);
  }

  @Get('/delete-all-notifications-admin/:id')
  deleteAllNotificatonsForMyAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.deleteAllNotificatonsForMyAdmin(id);
  }

  @Patch('/update-notify/:id')
  updateNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.updadateCheckedNotification(
      id,
      updateNotificationDto,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
