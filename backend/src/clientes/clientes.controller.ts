import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CriarClienteDto } from './dto/criar-cliente.dto';
import { DefinirCredenciaisDto } from './dto/definir-credenciais.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('master')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  listar(@Query('busca') busca?: string) {
    if (busca) {
      return this.clientesService.buscarPorNome(busca);
    }
    return this.clientesService.listar();
  }

  @Post()
  criar(@Body() dados: CriarClienteDto) {
    return this.clientesService.criar(dados);
  }

  @Patch(':id/credenciais')
  definirCredenciais(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: DefinirCredenciaisDto,
  ) {
    return this.clientesService.definirCredenciais(id, dados);
  }
}
