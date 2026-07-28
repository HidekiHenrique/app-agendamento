import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CriarAgendamentoDto } from './dto/criar-agendamento.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('agendamentos')
@UseGuards(JwtAuthGuard)
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  /**
   * GET /agendamentos?data=2026-07-28
   * Lista a agenda de um dia específico (a tela principal do app).
   */
  @Get()
  listarPorDia(@Query('data') data: string) {
    return this.agendamentosService.listarPorDia(data);
  }

  @Post()
  criar(@Body() dados: CriarAgendamentoDto) {
    return this.agendamentosService.criar(dados);
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarStatusDto,
  ) {
    return this.agendamentosService.atualizarStatus(id, dados);
  }
}
