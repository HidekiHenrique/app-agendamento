import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() = qualquer módulo do app pode injetar o PrismaService
// sem precisar importar o PrismaModule explicitamente toda vez.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
