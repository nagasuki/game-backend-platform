import { Injectable, OnModuleInit } from '@nestjs/common';
import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = require(path.join(
  process.cwd(),
  'generated/prisma',
)) as typeof import('../../generated/prisma');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
