import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CriarClienteDto } from './dto/criar-cliente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
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
}
