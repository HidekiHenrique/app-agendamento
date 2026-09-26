import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CriarClienteDto } from './dto/criar-cliente.dto';
import { DefinirCredenciaisDto } from './dto/definir-credenciais.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async listar() {
    const clientes = await this.prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        observacoes: true,
        criadoEm: true,
        senhaHash: true,
      },
    });

    return clientes.map((c) => ({
      id: c.id,
      nome: c.nome,
      email: c.email,
      telefone: c.telefone,
      observacoes: c.observacoes,
      criadoEm: c.criadoEm,
      possuiLogin: Boolean(c.senhaHash),
    }));
  }

  async criar(dados: CriarClienteDto) {
    if (dados.email) {
      const emailNormalizado = dados.email.toLowerCase().trim();
      const existente = await this.prisma.cliente.findUnique({
        where: { email: emailNormalizado },
      });
      if (existente) {
        throw new ConflictException('Já existe um cliente cadastrado com este e-mail.');
      }
      dados.email = emailNormalizado;
    }
    return this.prisma.cliente.create({ data: dados });
  }

  buscarPorNome(termo: string) {
    return this.prisma.cliente.findMany({
      where: { nome: { contains: termo, mode: 'insensitive' } },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        observacoes: true,
      },
      take: 10,
    });
  }

  async definirCredenciais(id: number, dados: DefinirCredenciaisDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
    }

    const emailNormalizado = dados.email.toLowerCase().trim();
    const clienteComMesmoEmail = await this.prisma.cliente.findFirst({
      where: {
        email: emailNormalizado,
        NOT: { id },
      },
    });

    if (clienteComMesmoEmail) {
      throw new ConflictException('Este e-mail já está sendo utilizado por outro cliente.');
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    await this.prisma.cliente.update({
      where: { id },
      data: {
        email: emailNormalizado,
        senhaHash,
      },
    });

    return {
      message: 'Login de acesso vinculado ao cliente com sucesso.',
      email: emailNormalizado,
    };
  }
}
