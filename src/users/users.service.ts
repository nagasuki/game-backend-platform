import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const safeUserSelect = {
    id: true,
    email: true,
    username: true,
    createdAt: true,
} as const;

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async getUsers(): Promise<any[]> {
        return await this.prisma.user.findMany({
            select: safeUserSelect,
        });
    }

    async getUserById(id: string): Promise<any> {
        return await this.prisma.user.findUnique({
            where: { id },
            select: safeUserSelect,
        });
    }
}
