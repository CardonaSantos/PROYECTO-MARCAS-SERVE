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
import { ProspectoService } from './prospecto.service';
import { CreateProspectoDto } from './dto/create-prospecto.dto';
import { UpdateProspectoDto } from './dto/update-prospecto.dto';

@Controller('prospecto')
export class ProspectoController {
  constructor(private readonly prospectoService: ProspectoService) {}

  @Post()
  async create(@Body() createProspectoDto: CreateProspectoDto) {
    console.log('entrando a ruta prospecto...');

    return await this.prospectoService.create(createProspectoDto);
  }

  @Get()
  async findAll() {
    return await this.prospectoService.findAll();
  }

  //VERIFICAR PROSPECTO ABIERTO Y RETORNAR PARA HACER LA VALIDACION
  @Get('/abierto/:id')
  async finLastProspect(@Param('id', ParseIntPipe) id: number) {
    return await this.prospectoService.ultimoProspectoAbierto(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prospectoService.findOne(+id);
  }

  @Patch('/actualizar-prospecto/:id')
  updateProspecto(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProspectoDto: UpdateProspectoDto,
  ) {
    console.log('Entrando al controller');
    console.log('La data del prospecto es: ', updateProspectoDto);

    return this.prospectoService.updateProspecto(id, updateProspectoDto);
  }

  @Delete('/delete-all')
  removeAll() {
    return this.prospectoService.removeAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prospectoService.remove(+id);
  }
}
