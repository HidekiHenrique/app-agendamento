import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { CriarServicoDto } from './dto/criar-servico.dto';
import { AtualizarServicoDto } from './dto/atualizar-servico.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('servicos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Get()
  listar() {
    return this.servicosService.listar();
  }

  @Post()
  @Roles('master')
  criar(@Body() dados: CriarServicoDto) {
    return this.servicosService.criar(dados);
  }

  @Patch(':id')
  @Roles('master')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: AtualizarServicoDto) {
    return this.servicosService.atualizar(id, dados);
  }

  @Delete(':id')
  @Roles('master')
  desativar(@Param('id', ParseIntPipe) id: number) {
    return this.servicosService.desativar(id);
  }
}
