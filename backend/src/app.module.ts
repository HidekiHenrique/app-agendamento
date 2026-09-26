import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { ServicosModule } from './servicos/servicos.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';
import { BloqueiosModule } from './bloqueios/bloqueios.module';

@Module({
  imports: [PrismaModule, AuthModule, ClientesModule, ServicosModule, AgendamentosModule, BloqueiosModule],
})
export class AppModule {}
