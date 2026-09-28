import { Injectable, NotFoundException } from '@nestjs/common';
import type { Game } from './interfaces/game.interface';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
    constructor(private readonly prisma: PrismaService) {}

    async getGames(): Promise<Game[]> {
        return await this.prisma.game.findMany();
    }

    async getGame(id: number): Promise<Game> {
        const game = await this.prisma.game.findUnique({
            where: {
                id,
            },
        });

        if (game === null) {
            throw new NotFoundException(`Game with id ${id} not found`);
        }

        return game;
    }

    async createGame(createGameDto: CreateGameDto): Promise<Game> {
        return await this.prisma.game.create({
            data: {
                name: createGameDto.name,
            },
        });
    }

    async updateGame(id: number, updateGameDto: UpdateGameDto): Promise<Game> {
        try {
            return await this.prisma.game.update({
                where: {
                    id,
                },
                data: updateGameDto,
            });
        } catch (error) {
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException(`Game with id ${id} not found`);
            }

            throw error;
        }
    }

    async deleteGame(id: number): Promise<void> {
        try {
            await this.prisma.game.delete({
                where: {
                    id,
                },
            });
        } catch (error) {
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException(`Game with id ${id} not found`);
            }

            throw error;
        }
    }
}
