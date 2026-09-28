import { ApiProperty } from '@nestjs/swagger';

export class GameResponseDto {
    @ApiProperty({
        example: 1,
        description: 'Game ID',
    })
    id: number;

    @ApiProperty({
        example: 'The Witcher 3',
        description: 'Game name',
    })
    name: string;
}
