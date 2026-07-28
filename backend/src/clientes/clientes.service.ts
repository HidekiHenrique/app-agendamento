import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarClienteDto } from './dto/criar-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  listar() {
    return this.prisma.cliente.findMany({ orderBy: { nome: 'asc' } });
  }

  criar(dados: CriarClienteDto) {
    return this.prisma.cliente.create({ data: dados });
  }

  buscarPorNome(termo: string) {
    // busca simples pra autocomplete no front (ex: digitar "Mari" e achar "Maria")
    return this.prisma.cliente.findMany({
      where: { nome: { contains: termo, mode: 'insensitive' } },
      take: 10,
    });
  }
}
