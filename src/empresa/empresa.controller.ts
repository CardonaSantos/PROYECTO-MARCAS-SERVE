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
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { EmpresaUpdateDTO } from './dto/empresa-update.dto';
import { EmpresaDTO } from './dto/empresa.dto';

@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Post()
  create(@Body() createEmpresaDto: EmpresaDTO) {
    return this.empresaService.createEmpresa(createEmpresaDto);
  }

  @Get()
  findAll() {
    return this.empresaService.findAll();
  }

  @Get('/verify-empresa')
  verifyEmpresa() {
    return this.empresaService.createEmpresaToVerify();
  }

  @Get('/get-empresa-info/:id')
  getEmpresaInfo(@Param('id', ParseIntPipe) id: number) {
    return this.empresaService.getEmpresaInfo(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empresaService.findOne(+id);
  }

  @Patch('/update-empresa/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpresaDto: EmpresaUpdateDTO,
  ) {
    return this.empresaService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empresaService.remove(+id);
  }
}
