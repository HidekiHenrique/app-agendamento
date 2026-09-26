import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CriarBloqueioDto {
  @IsDateString({}, { message: 'Início deve ser uma data/hora ISO válida.' })
  @IsNotEmpty()
  inicio: string;

  @IsDateString({}, { message: 'Fim deve ser uma data/hora ISO válida.' })
  @IsNotEmpty()
  fim: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}
