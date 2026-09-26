import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CriarAgendamentoDto } from './dto/criar-agendamento.dto';
import { CriarAgendamentoClienteDto } from './dto/criar-agendamento-cliente.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('agendamentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  /**
   * GET /agendamentos/meus
   * Retorna os agendamentos do cliente autenticado
   */
  @Get('meus')
  @Roles('cliente')
  listarMeus(@Req() req: any) {
    return this.agendamentosService.listarPorCliente(req.user.clienteId);
  }

  /**
   * GET /agendamentos/horarios-disponiveis?servicoId=1&data=2026-09-26
   * Retorna horários livres para agendamento
   */
  @Get('horarios-disponiveis')
  obterHorariosDisponiveis(
    @Query('servicoId', ParseIntPipe) servicoId: number,
    @Query('data') data: string,
  ) {
    return this.agendamentosService.obterHorariosDisponiveis(servicoId, data);
  }

  /**
   * GET /agendamentos?data=2026-09-26
   * Lista a agenda de um dia específico (visão da Master)
   */
  @Get()
  @Roles('master')
  listarPorDia(@Query('data') data: string) {
    return this.agendamentosService.listarPorDia(data);
  }

  /**
   * POST /agendamentos
   * Cria agendamento pela Master
   */
  @Post()
  @Roles('master')
  criar(@Body() dados: CriarAgendamentoDto) {
    return this.agendamentosService.criar(dados);
  }

  /**
   * POST /agendamentos/cliente
   * Cliente agenda seu próprio horário
   */
  @Post('cliente')
  @Roles('cliente')
  criarPeloCliente(@Req() req: any, @Body() dados: CriarAgendamentoClienteDto) {
    return this.agendamentosService.criarPeloCliente(req.user.clienteId, dados);
  }

  /**
   * PATCH /agendamentos/:id/status
   * Master atualiza status (concluido, cancelado, agendado)
   */
  @Patch(':id/status')
  @Roles('master')
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarStatusDto,
  ) {
    return this.agendamentosService.atualizarStatus(id, dados);
  }

  /**
   * PATCH /agendamentos/:id/cancelar-cliente
   * Cliente cancela seu próprio agendamento futuro
   */
  @Patch(':id/cancelar-cliente')
  @Roles('cliente')
  cancelarPeloCliente(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.agendamentosService.cancelarPeloCliente(id, req.user.clienteId);
  }
}
