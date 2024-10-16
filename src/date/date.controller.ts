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
import { DateService } from './date.service';
import { CreateDateDto } from './dto/create-date.dto';
import { UpdateDateDto } from './dto/update-date.dto';

@Controller('date')
export class DateController {
  constructor(private readonly dateService: DateService) {}

  @Post('/start-new-visit')
  create(@Body() createDateDto: CreateDateDto) {
    return this.dateService.create(createDateDto);
  }

  @Patch('/cancel/visit-regist/:id')
  cancelVisitRegist(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDateDto: UpdateDateDto,
  ) {
    return this.dateService.cancelRegistVisit(id, updateDateDto);
  }

  @Patch('/update/visit-regist/:id')
  updateVisitRegist(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDateDto: UpdateDateDto,
  ) {
    return this.dateService.updateVisitRegist(id, updateDateDto);
  }

  @Get('/regist-open/:id')
  findVisistRegistOpen(@Param('id', ParseIntPipe) id: number) {
    console.log('ENTRANDO AL CONTROLLER DEL GET RECUPERANDO EL REGISTRO, ', id);
    return this.dateService.getRegistOpen(id);
  }

  @Get('/get-visits-regists')
  findVisitsRegis() {
    return this.dateService.findVisitsRegis();
  }

  @Get()
  findAll() {
    return this.dateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dateService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDateDto: UpdateDateDto) {
    return this.dateService.update(+id, updateDateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dateService.remove(+id);
  }
}
