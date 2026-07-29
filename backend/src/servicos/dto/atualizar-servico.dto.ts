import { IsString, IsInt, IsPositive, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * Todos os campos são opcionais aqui porque é uma edição PARCIAL - sua mãe
 * pode querer só mudar o preço, sem reenviar nome e duração de novo.
 */
export class AtualizarServicoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  duracaoMin?: number;

  @IsOptional()
  @IsPositive()
  preco?: number;
}
