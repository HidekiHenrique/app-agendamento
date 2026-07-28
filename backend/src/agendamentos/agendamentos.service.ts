import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarAgendamentoDto } from './dto/criar-agendamento.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';

type AgendamentoComServico = Prisma.AgendamentoGetPayload<{
  include: { servico: true };
}>;

@Injectable()
export class AgendamentosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista agendamentos de um dia específico, já trazendo cliente e serviço
   * junto (equivalente ao seu padrão de eager loading com $with no PHP).
   */
  async listarPorDia(data: string) {
    const inicioDia = new Date(`${data}T00:00:00`);
    const fimDia = new Date(`${data}T23:59:59`);

    return this.prisma.agendamento.findMany({
      where: { dataHora: { gte: inicioDia, lte: fimDia } },
      include: { cliente: true, servico: true },
      orderBy: { dataHora: 'asc' },
    });
  }

  async criar(dados: CriarAgendamentoDto) {
    const servico = await this.prisma.servico.findUnique({
      where: { id: dados.servicoId },
    });
    if (!servico) {
      throw new NotFoundException('Serviço não encontrado.');
    }

    const inicio = new Date(dados.dataHora);
    const fim = new Date(inicio.getTime() + servico.duracaoMin * 60_000);

    await this.garantirSemConflito(inicio, fim);

    return this.prisma.agendamento.create({
      data: {
        clienteId: dados.clienteId,
        servicoId: dados.servicoId,
        dataHora: inicio,
        observacoes: dados.observacoes,
      },
      include: { cliente: true, servico: true },
    });
  }

  async atualizarStatus(id: number, dados: AtualizarStatusDto) {
    const agendamento = await this.prisma.agendamento.findUnique({ where: { id } });
    if (!agendamento) {
      throw new NotFoundException(`Agendamento ${id} não encontrado.`);
    }

    return this.prisma.agendamento.update({
      where: { id },
      data: { status: dados.status },
      include: { cliente: true, servico: true },
    });
  }

  /**
   * Checa se já existe algum agendamento (não cancelado) que se sobrepõe
   * ao intervalo [inicio, fim). Isso evita sua mãe marcar dois clientes
   * no mesmo horário sem perceber.
   */
  private async garantirSemConflito(inicio: Date, fim: Date) {
    // Como só guardamos o horário de início (não o fim), pegamos os
    // agendamentos próximos e comparamos o intervalo em JS - mais simples
    // de ler do que montar uma query SQL de overlap pra esse volume baixo
    // de agendamentos por dia.
    const todasDoDia = await this.prisma.agendamento.findMany({
      where: {
        status: { not: 'cancelado' },
        dataHora: {
          gte: new Date(inicio.getTime() - 4 * 60 * 60_000),
          lte: fim,
        },
      },
      include: { servico: true },
    });

    const sobrepoe = todasDoDia.some((ag: AgendamentoComServico) => {
      const agInicio = ag.dataHora;
      const agFim = new Date(agInicio.getTime() + ag.servico.duracaoMin * 60_000);
      return inicio < agFim && fim > agInicio;
    });

    if (sobrepoe) {
      throw new BadRequestException(
        'Já existe um agendamento nesse horário. Escolha outro horário.',
      );
    }
  }
}
