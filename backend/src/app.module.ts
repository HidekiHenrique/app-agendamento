import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { ServicosModule } from './servicos/servicos.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';

@Module({
  imports: [PrismaModule, AuthModule, ClientesModule, ServicosModule, AgendamentosModule],
})
export class AppModule {}
