import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async getUsers(): Promise<any[]> {
        return await this.usersService.getUsers();
    }

    @Get(':id')
    async getUserById(@Param('id') id: string): Promise<any> {
        return await this.usersService.getUserById(id);
    }
}
