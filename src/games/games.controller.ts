import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GamesService } from './games.service';
import type { Game } from './interfaces/game.interface';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameResponseDto } from './dto/game-response.dto';

@ApiTags('games')
@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @ApiOperation({ summary: 'Get all games' })
    @ApiResponse({
        status: 200,
        description: 'List of games',
        type: GameResponseDto,
        isArray: true,
    })
    @Get()
    getGames(): Promise<Game[]> {
        return this.gamesService.getGames();
    }

    @ApiOperation({ summary: 'Get a game by ID' })
    @ApiResponse({
        status: 200,
        description: 'Game found',
        type: GameResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Game not found' })
    @Get(':id')
    getGame(@Param('id', ParseIntPipe) id: number): Promise<Game> {
        return this.gamesService.getGame(id);
    }

    @ApiOperation({ summary: 'Create a game' })
    @ApiResponse({
        status: 201,
        description: 'Game created',
        type: GameResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @Post()
    createGame(@Body() createGameDto: CreateGameDto): Promise<Game> {
        return this.gamesService.createGame(createGameDto);
    }

    @ApiOperation({ summary: 'Update a game' })
    @ApiResponse({
        status: 200,
        description: 'Game updated',
        type: GameResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Game not found' })
    @Patch(':id')
    updateGame(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateGameDto: UpdateGameDto,
    ): Promise<Game> {
        return this.gamesService.updateGame(id, updateGameDto);
    }

    @ApiOperation({ summary: 'Delete a game' })
    @ApiResponse({ status: 204, description: 'Game deleted' })
    @ApiResponse({ status: 404, description: 'Game not found' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteGame(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.gamesService.deleteGame(id);
    }
}
