import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGameDto {
    @ApiPropertyOptional({
        example: 'The Witcher 3',
        description: 'New game name',
    })
    @IsOptional()
    @IsString()
    name?: string;
}
