import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarBloqueioDto } from './dto/criar-bloqueio.dto';

@Injectable()
export class BloqueiosService {
  constructor(private prisma: PrismaService) {}

  async listarPorDia(data?: string) {
    if (!data) {
      return this.prisma.bloqueioAgenda.findMany({
        orderBy: { inicio: 'asc' },
      });
    }

    const inicioDia = new Date(`${data}T00:00:00`);
    const fimDia = new Date(`${data}T23:59:59`);

    return this.prisma.bloqueioAgenda.findMany({
      where: {
        inicio: { lte: fimDia },
        fim: { gte: inicioDia },
      },
      orderBy: { inicio: 'asc' },
    });
  }

  async criar(dados: CriarBloqueioDto) {
    const inicio = new Date(dados.inicio);
    const fim = new Date(dados.fim);

    if (fim <= inicio) {
      throw new BadRequestException('O horário final do bloqueio deve ser posterior ao horário inicial.');
    }

    return this.prisma.bloqueioAgenda.create({
      data: {
        inicio,
        fim,
        motivo: dados.motivo?.trim() || null,
      },
    });
  }

  async remover(id: number) {
    const existe = await this.prisma.bloqueioAgenda.findUnique({ where: { id } });
    if (!existe) {
      throw new NotFoundException(`Bloqueio ${id} não encontrado.`);
    }

    return this.prisma.bloqueioAgenda.delete({
      where: { id },
    });
  }
}
