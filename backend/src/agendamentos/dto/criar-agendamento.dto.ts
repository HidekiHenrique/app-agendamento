import { IsInt, IsPositive, IsDateString, IsOptional, IsString } from 'class-validator';

export class CriarAgendamentoDto {
  @IsInt()
  @IsPositive()
  clienteId: number;

  @IsInt()
  @IsPositive()
  servicoId: number;

  @IsDateString()
  dataHora: string; // ISO string, ex: "2026-07-28T14:00:00"

  @IsOptional()
  @IsString()
  observacoes?: string;
}
