import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarServicoDto } from './dto/criar-servico.dto';
import { AtualizarServicoDto } from './dto/atualizar-servico.dto';

@Injectable()
export class ServicosService {
  constructor(private prisma: PrismaService) {}

  listar() {
    // equivale a: SELECT * FROM Servico WHERE ativo = true ORDER BY nome
    return this.prisma.servico.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }

  criar(dados: CriarServicoDto) {
    return this.prisma.servico.create({ data: dados });
  }

  async atualizar(id: number, dados: AtualizarServicoDto) {
    const servico = await this.prisma.servico.findUnique({ where: { id } });
    if (!servico) {
      throw new NotFoundException(`Serviço ${id} não encontrado.`);
    }

    // Importante: isso NÃO altera agendamentos já criados, porque eles
    // guardam seu próprio snapshot de preço/duração (precoCobrado,
    // duracaoMin no Agendamento). Só afeta agendamentos criados DAQUI PRA
    // FRENTE.
    return this.prisma.servico.update({
      where: { id },
      data: dados,
    });
  }

  async desativar(id: number) {
    // "soft delete" - não apaga do banco, só marca como inativo.
    // Importante porque agendamentos antigos ainda referenciam esse serviço.
    return this.prisma.servico.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
