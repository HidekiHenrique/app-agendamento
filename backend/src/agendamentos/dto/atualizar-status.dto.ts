import { IsIn } from 'class-validator';

export class AtualizarStatusDto {
  @IsIn(['agendado', 'concluido', 'cancelado'])
  status: 'agendado' | 'concluido' | 'cancelado';
}
