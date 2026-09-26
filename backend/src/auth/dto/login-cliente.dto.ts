import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginClienteDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  senha: string;
}
