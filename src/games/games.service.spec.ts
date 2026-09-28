import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GamesService } from './games.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GamesService', () => {
    let service: GamesService;

    const prismaMock = {
        game: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GamesService,
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();

        service = module.get<GamesService>(GamesService);
    });

    describe('getGames', () => {
        it('should return all games', async () => {
            const games = [
                { id: 1, name: 'Game 1' },
                { id: 2, name: 'Game 2' },
            ];

            prismaMock.game.findMany.mockResolvedValue(games);

            const result = await service.getGames();

            expect(result).toEqual(games);
            expect(prismaMock.game.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.game.findMany).toHaveBeenCalledWith();
        });
    });

    describe('getGame', () => {
        it('should return a game by id', async () => {
            const game = {
                id: 1,
                name: 'Game 1',
            };

            prismaMock.game.findUnique.mockResolvedValue(game);

            const result = await service.getGame(1);

            expect(result).toEqual(game);
            expect(prismaMock.game.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
            });
        });

        it('should throw NotFoundException when game does not exist', async () => {
            prismaMock.game.findUnique.mockResolvedValue(null);

            await expect(service.getGame(999)).rejects.toThrow(
                new NotFoundException('Game with id 999 not found'),
            );
        });
    });

    describe('createGame', () => {
        it('should create a game', async () => {
            const dto = {
                name: 'New Game',
            };

            const createdGame = {
                id: 1,
                name: 'New Game',
            };

            prismaMock.game.create.mockResolvedValue(createdGame);

            const result = await service.createGame(dto);

            expect(result).toEqual(createdGame);

            expect(prismaMock.game.create).toHaveBeenCalledWith({
                data: {
                    name: 'New Game',
                },
            });
        });
    });

    describe('updateGame', () => {
        it('should update a game', async () => {
            const dto = {
                name: 'Updated Game',
            };

            const updatedGame = {
                id: 1,
                name: 'Updated Game',
            };

            prismaMock.game.update.mockResolvedValue(updatedGame);

            const result = await service.updateGame(1, dto);

            expect(result).toEqual(updatedGame);

            expect(prismaMock.game.update).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
                data: dto,
            });
        });

        it('should throw NotFoundException when game does not exist', async () => {
            prismaMock.game.update.mockRejectedValue({
                code: 'P2025',
            });

            await expect(
                service.updateGame(999, { name: 'Updated Game' }),
            ).rejects.toThrow('Game with id 999 not found');
        });

        it('should rethrow unexpected errors', async () => {
            const error = new Error('Database connection failed');

            prismaMock.game.update.mockRejectedValue(error);

            await expect(
                service.updateGame(1, { name: 'Updated Game' }),
            ).rejects.toThrow(error);
        });
    });

    describe('deleteGame', () => {
        it('should delete a game', async () => {
            prismaMock.game.delete.mockResolvedValue({
                id: 1,
                name: 'Game 1',
            });

            await expect(service.deleteGame(1)).resolves.toBeUndefined();

            expect(prismaMock.game.delete).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
            });
        });

        it('should throw NotFoundException when game does not exist', async () => {
            prismaMock.game.delete.mockRejectedValue({
                code: 'P2025',
            });

            await expect(service.deleteGame(999)).rejects.toThrow(
                'Game with id 999 not found',
            );
        });

        it('should rethrow unexpected errors', async () => {
            const error = new Error('Database connection failed');

            prismaMock.game.delete.mockRejectedValue(error);

            await expect(service.deleteGame(1)).rejects.toThrow(error);
        });
    });
});
