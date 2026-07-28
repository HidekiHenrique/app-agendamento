import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { CriarServicoDto } from './dto/criar-servico.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('servicos')
@UseGuards(JwtAuthGuard)
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Get()
  listar() {
    return this.servicosService.listar();
  }

  @Post()
  criar(@Body() dados: CriarServicoDto) {
    return this.servicosService.criar(dados);
  }

  @Delete(':id')
  desativar(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe converte o ":id" da URL (que chega como string) pra number,
    // e já rejeita com 400 se vier algo tipo "/servicos/abc"
    return this.servicosService.desativar(id);
  }
}
