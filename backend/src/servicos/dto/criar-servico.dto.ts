import { IsString, IsInt, IsPositive, IsNotEmpty } from 'class-validator';

export class CriarServicoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsInt()
  @IsPositive()
  duracaoMin: number;

  @IsPositive()
  preco: number;
}
