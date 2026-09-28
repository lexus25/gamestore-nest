import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );

        await app.init();
    });

    it('POST /games creates a game', () => {
        return request(app.getHttpServer())
            .post('/games')
            .send({
                name: 'E2E Test Game',
            })
            .expect(201)
            .expect((response) => {
                expect(response.body).toEqual({
                    id: expect.any(Number),
                    name: 'E2E Test Game',
                });
            });
    });

    it('GET /games returns games', () => {
        return request(app.getHttpServer())
            .get('/games')
            .expect(200)
            .expect((response) => {
                expect(Array.isArray(response.body)).toBe(true);
            });
    });

    it('GET /games/:id returns a game', async () => {
        const createResponse = await request(app.getHttpServer())
            .post('/games')
            .send({
                name: 'Game for GET by ID',
            })
            .expect(201);

        const gameId = createResponse.body.id;

        return request(app.getHttpServer())
            .get(`/games/${gameId}`)
            .expect(200)
            .expect((response) => {
                expect(response.body).toEqual({
                    id: gameId,
                    name: 'Game for GET by ID',
                });
            });
    });

    it('GET /games/:id returns 404 for a non-existing game', () => {
        return request(app.getHttpServer()).get('/games/999999').expect(404);
    });

    it('PATCH /games/:id updates a game', async () => {
        const createResponse = await request(app.getHttpServer())
            .post('/games')
            .send({
                name: 'Game before update',
            })
            .expect(201);

        const gameId = createResponse.body.id;

        return request(app.getHttpServer())
            .patch(`/games/${gameId}`)
            .send({
                name: 'Game after update',
            })
            .expect(200)
            .expect((response) => {
                expect(response.body).toEqual({
                    id: gameId,
                    name: 'Game after update',
                });
            });
    });

    it('DELETE /games/:id deletes a game', async () => {
        const createResponse = await request(app.getHttpServer())
            .post('/games')
            .send({
                name: 'Game to delete',
            })
            .expect(201);

        const gameId = createResponse.body.id;

        await request(app.getHttpServer())
            .delete(`/games/${gameId}`)
            .expect(204);

        return request(app.getHttpServer()).get(`/games/${gameId}`).expect(404);
    });

    it('POST /games returns 400 for invalid data', () => {
        return request(app.getHttpServer())
            .post('/games')
            .send({
                name: '',
            })
            .expect(400);
    });

    it('POST /games returns 400 for unknown fields', () => {
        return request(app.getHttpServer())
            .post('/games')
            .send({
                name: 'Valid Game',
                unknownField: 'should be rejected',
            })
            .expect(400);
    });

    it('GET /games/:id returns 400 for invalid id', () => {
        return request(app.getHttpServer()).get('/games/abc').expect(400);
    });

    afterEach(async () => {
        await app.close();
    });
});
