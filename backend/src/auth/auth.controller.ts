import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CadastroClienteDto } from './dto/cadastro-cliente.dto';
import { LoginClienteDto } from './dto/login-cliente.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dados: LoginDto) {
    return this.authService.login(dados);
  }

  @Post('cliente/cadastro')
  cadastrarCliente(@Body() dados: CadastroClienteDto) {
    return this.authService.cadastrarCliente(dados);
  }

  @Post('cliente/login')
  loginCliente(@Body() dados: LoginClienteDto) {
    return this.authService.loginCliente(dados);
  }
}
