import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

/**
 * App de uso pessoal - só existe UM usuário (sua mãe), então não tem
 * tabela de usuários no banco. As credenciais ficam no .env:
 *   MASTER_USER_EMAIL       -> email de login
 *   MASTER_USER_PASSWORD_HASH -> hash bcrypt da senha (nunca a senha em texto puro)
 */
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(dados: LoginDto) {
    const emailEsperado = process.env.MASTER_USER_EMAIL;
    const hashEsperado = process.env.MASTER_USER_PASSWORD_HASH;

    if (!emailEsperado || !hashEsperado) {
      throw new UnauthorizedException('Usuário mestre não configurado no servidor.');
    }

    const emailBate = dados.email === emailEsperado;
    const senhaBate = await bcrypt.compare(dados.senha, hashEsperado);

    if (!emailBate || !senhaBate) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const token = await this.jwtService.signAsync({ sub: emailEsperado });
    return { access_token: token };
  }
}
