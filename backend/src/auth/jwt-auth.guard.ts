import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Coloca @UseGuards(JwtAuthGuard) em qualquer controller/rota pra exigir
 * um token JWT válido no header "Authorization: Bearer <token>".
 * Sem esse guard, qualquer pessoa na internet poderia acessar a agenda
 * da sua mãe sem login.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('Token inválido ou ausente.');
    }
    return user;
  }
}
