import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CriarClienteDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
