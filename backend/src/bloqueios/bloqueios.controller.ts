import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { BloqueiosService } from './bloqueios.service';
import { CriarBloqueioDto } from './dto/criar-bloqueio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('bloqueios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('master')
export class BloqueiosController {
  constructor(private readonly bloqueiosService: BloqueiosService) {}

  @Get()
  listar(@Query('data') data?: string) {
    return this.bloqueiosService.listarPorDia(data);
  }

  @Post()
  criar(@Body() dados: CriarBloqueioDto) {
    return this.bloqueiosService.criar(dados);
  }

  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.bloqueiosService.remover(id);
  }
}
