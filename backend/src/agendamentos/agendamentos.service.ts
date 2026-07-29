import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarAgendamentoDto } from './dto/criar-agendamento.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';

type Agendamento = Prisma.AgendamentoGetPayload<{}>;

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
        // Snapshot: copia o preço/duração ATUAIS do serviço pro agendamento.
        // Se o serviço mudar de preço depois, esse agendamento mantém o
        // valor que foi combinado no momento em que foi marcado.
        precoCobrado: servico.preco,
        duracaoMin: servico.duracaoMin,
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
   *
   * Importante: usamos o `duracaoMin` SALVO em cada agendamento (o
   * snapshot), não o duracaoMin atual do Servico - assim, se você editar
   * a duração de um serviço hoje, isso não altera silenciosamente o
   * cálculo de conflito de agendamentos já marcados no passado.
   */
  private async garantirSemConflito(inicio: Date, fim: Date) {
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
