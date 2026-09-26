import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { CadastroClienteDto } from './dto/cadastro-cliente.dto';
import { LoginClienteDto } from './dto/login-cliente.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * Login da Administradora (Master)
   * Credenciais no .env
   */
  async login(dados: LoginDto) {
    const emailEsperado = process.env.MASTER_USER_EMAIL;
    const hashEsperado = process.env.MASTER_USER_PASSWORD_HASH;

    if (!emailEsperado || !hashEsperado) {
      throw new UnauthorizedException('Usuário mestre não configurado no servidor.');
    }

    const emailBate = dados.email.toLowerCase().trim() === emailEsperado.toLowerCase().trim();
    const senhaBate = await bcrypt.compare(dados.senha, hashEsperado);

    if (!emailBate || !senhaBate) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const token = await this.jwtService.signAsync({
      sub: 'master',
      role: 'master',
      email: emailEsperado,
    });

    return {
      access_token: token,
      user: {
        role: 'master',
        email: emailEsperado,
      },
    };
  }

  /**
   * Autocadastro de cliente pelo site
   */
  async cadastrarCliente(dados: CadastroClienteDto) {
    const emailNormalizado = dados.email.toLowerCase().trim();

    const clienteExistente = await this.prisma.cliente.findUnique({
      where: { email: emailNormalizado },
    });

    if (clienteExistente) {
      if (!clienteExistente.senhaHash) {
        throw new ConflictException(
          'Este e-mail já foi pré-cadastrado no salão. Entre em contato com a profissional para vincular sua conta e definir sua senha.',
        );
      }
      throw new ConflictException('Este e-mail já está cadastrado. Por favor, faça login.');
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const novoCliente = await this.prisma.cliente.create({
      data: {
        nome: dados.nome.trim(),
        email: emailNormalizado,
        senhaHash,
        telefone: dados.telefone?.trim() || null,
      },
    });

    const token = await this.jwtService.signAsync({
      sub: novoCliente.id,
      role: 'cliente',
      clienteId: novoCliente.id,
      nome: novoCliente.nome,
      email: novoCliente.email,
    });

    return {
      access_token: token,
      user: {
        id: novoCliente.id,
        nome: novoCliente.nome,
        email: novoCliente.email,
        role: 'cliente',
      },
    };
  }

  /**
   * Login do cliente com e-mail e senha
   */
  async loginCliente(dados: LoginClienteDto) {
    const emailNormalizado = dados.email.toLowerCase().trim();

    const cliente = await this.prisma.cliente.findUnique({
      where: { email: emailNormalizado },
    });

    if (!cliente) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    if (!cliente.senhaHash) {
      throw new BadRequestException(
        'Este cadastro ainda não possui senha de acesso à internet. Entre em contato com a profissional para ativar seu login.',
      );
    }

    const senhaValida = await bcrypt.compare(dados.senha, cliente.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const token = await this.jwtService.signAsync({
      sub: cliente.id,
      role: 'cliente',
      clienteId: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
    });

    return {
      access_token: token,
      user: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        role: 'cliente',
      },
    };
  }
}
