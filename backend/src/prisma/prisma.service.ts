import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Isso é basicamente sua conexão PDO, só que injetável em qualquer service
 * via construtor (em vez de você abrir a conexão manualmente em cada lugar
 * que precisa consultar o banco).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
