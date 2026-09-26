import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  // O retorno daqui vira "request.user" em qualquer rota protegida.
  async validate(payload: { sub: string | number; role?: string; email?: string; clienteId?: number; nome?: string }) {
    return {
      sub: payload.sub,
      role: payload.role || 'master',
      email: payload.email || String(payload.sub),
      clienteId: payload.clienteId,
      nome: payload.nome,
    };
  }
}
