import { Module } from '@nestjs/common';
import { BloqueiosService } from './bloqueios.service';
import { BloqueiosController } from './bloqueios.controller';

@Module({
  controllers: [BloqueiosController],
  providers: [BloqueiosService],
  exports: [BloqueiosService],
})
export class BloqueiosModule {}
