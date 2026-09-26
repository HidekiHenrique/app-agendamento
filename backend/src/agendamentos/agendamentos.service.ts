import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarAgendamentoDto } from './dto/criar-agendamento.dto';
import { CriarAgendamentoClienteDto } from './dto/criar-agendamento-cliente.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';

type Agendamento = Prisma.AgendamentoGetPayload<{}>;

@Injectable()
export class AgendamentosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista agendamentos de um dia específico (Visão da Master)
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

  /**
   * Lista agendamentos do cliente autenticado (Visão do Cliente)
   */
  async listarPorCliente(clienteId: number) {
    return this.prisma.agendamento.findMany({
      where: { clienteId },
      include: { servico: true },
      orderBy: { dataHora: 'desc' },
    });
  }

  /**
   * Criação de agendamento pela Master
   */
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
        precoCobrado: servico.preco,
        duracaoMin: servico.duracaoMin,
      },
      include: { cliente: true, servico: true },
    });
  }

  /**
   * Criação de agendamento pelo próprio Cliente autenticado
   */
  async criarPeloCliente(clienteId: number, dados: CriarAgendamentoClienteDto) {
    const servico = await this.prisma.servico.findUnique({
      where: { id: dados.servicoId },
    });
    if (!servico || !servico.ativo) {
      throw new NotFoundException('Serviço não encontrado ou inativo.');
    }

    const inicio = new Date(dados.dataHora);
    if (inicio.getTime() < Date.now()) {
      throw new BadRequestException('Não é possível agendar em uma data ou horário que já passou.');
    }

    const fim = new Date(inicio.getTime() + servico.duracaoMin * 60_000);

    await this.garantirSemConflito(inicio, fim);

    return this.prisma.agendamento.create({
      data: {
        clienteId,
        servicoId: dados.servicoId,
        dataHora: inicio,
        observacoes: dados.observacoes,
        precoCobrado: servico.preco,
        duracaoMin: servico.duracaoMin,
      },
      include: { cliente: true, servico: true },
    });
  }

  /**
   * Cancelamento de agendamento pelo próprio Cliente
   */
  async cancelarPeloCliente(id: number, clienteId: number) {
    const agendamento = await this.prisma.agendamento.findUnique({ where: { id } });
    if (!agendamento) {
      throw new NotFoundException(`Agendamento ${id} não encontrado.`);
    }

    if (agendamento.clienteId !== clienteId) {
      throw new ForbiddenException('Você não tem permissão para cancelar este agendamento.');
    }

    if (agendamento.status === 'cancelado') {
      throw new BadRequestException('Este agendamento já está cancelado.');
    }

    if (agendamento.dataHora.getTime() < Date.now()) {
      throw new BadRequestException('Não é possível cancelar agendamentos passados.');
    }

    return this.prisma.agendamento.update({
      where: { id },
      data: { status: 'cancelado' },
      include: { cliente: true, servico: true },
    });
  }

  /**
   * Atualização de status pela Master (concluir, cancelar, etc)
   */
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
   * Calcula horários livres para atendimento (08:00 às 18:00, slots de 30min)
   */
  async obterHorariosDisponiveis(servicoId: number, data: string) {
    const servico = await this.prisma.servico.findUnique({ where: { id: servicoId } });
    if (!servico || !servico.ativo) {
      throw new NotFoundException('Serviço não encontrado ou inativo.');
    }

    const inicioDia = new Date(`${data}T00:00:00`);
    const fimDia = new Date(`${data}T23:59:59`);

    const [agendamentosDoDia, bloqueiosDoDia] = await Promise.all([
      this.prisma.agendamento.findMany({
        where: {
          status: { not: 'cancelado' },
          dataHora: { gte: inicioDia, lte: fimDia },
        },
      }),
      this.prisma.bloqueioAgenda.findMany({
        where: {
          inicio: { lte: fimDia },
          fim: { gte: inicioDia },
        },
      }),
    ]);

    const horariosDisponiveis: string[] = [];
    const agora = Date.now();

    for (let hora = 8; hora < 18; hora++) {
      for (const minuto of [0, 30]) {
        const hh = String(hora).padStart(2, '0');
        const mm = String(minuto).padStart(2, '0');
        const slotInicio = new Date(`${data}T${hh}:${mm}:00`);
        const slotFim = new Date(slotInicio.getTime() + servico.duracaoMin * 60_000);

        if (slotInicio.getTime() <= agora) {
          continue;
        }

        const conflitaAgendamento = agendamentosDoDia.some((ag) => {
          const agInicio = ag.dataHora;
          const agFim = new Date(agInicio.getTime() + ag.duracaoMin * 60_000);
          return slotInicio < agFim && slotFim > agInicio;
        });

        if (conflitaAgendamento) {
          continue;
        }

        const conflitaBloqueio = bloqueiosDoDia.some((b) => {
          return slotInicio < b.fim && slotFim > b.inicio;
        });

        if (conflitaBloqueio) {
          continue;
        }

        horariosDisponiveis.push(`${hh}:${mm}`);
      }
    }

    return {
      data,
      servicoId: servico.id,
      duracaoMin: servico.duracaoMin,
      horariosDisponiveis,
    };
  }

  /**
   * Checa sobreposição com outros agendamentos e com bloqueios da master
   */
  private async garantirSemConflito(inicio: Date, fim: Date) {
    const bloqueios = await this.prisma.bloqueioAgenda.findMany({
      where: {
        inicio: { lt: fim },
        fim: { gt: inicio },
      },
    });

    if (bloqueios.length > 0) {
      const motivo = bloqueios[0].motivo ? ` (${bloqueios[0].motivo})` : '';
      throw new BadRequestException(
        `Horário indisponível devido a um bloqueio na agenda da profissional${motivo}.`,
      );
    }

    const todasDoDia = await this.prisma.agendamento.findMany({
      where: {
        status: { not: 'cancelado' },
        dataHora: {
          gte: new Date(inicio.getTime() - 4 * 60 * 60_000),
          lte: fim,
        },
      },
    });

    const sobrepoe = todasDoDia.some((ag: Agendamento) => {
      const agInicio = ag.dataHora;
      const agFim = new Date(agInicio.getTime() + ag.duracaoMin * 60_000);
      return inicio < agFim && fim > agInicio;
    });

    if (sobrepoe) {
      throw new BadRequestException(
        'Já existe um agendamento nesse horário. Escolha outro horário.',
      );
    }
  }
}
