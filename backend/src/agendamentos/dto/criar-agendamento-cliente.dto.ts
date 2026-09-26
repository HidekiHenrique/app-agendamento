import { IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CriarAgendamentoClienteDto {
  @IsInt()
  @IsPositive()
  servicoId: number;

  @IsDateString()
  dataHora: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
