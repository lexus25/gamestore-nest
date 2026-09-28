import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
    @ApiProperty({
        example: 'The Witcher 3',
        description: 'Game name',
    })
    @IsString()
    @IsNotEmpty()
    name: string;
}
