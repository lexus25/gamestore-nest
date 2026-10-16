import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const frontendDir = join(process.cwd(), 'public');
    if (existsSync(join(frontendDir, 'index.html'))) {
        // Keep Vue's /games routes separate from the REST API.
        app.setGlobalPrefix('backend');
        app.useStaticAssets(frontendDir, { index: false });
        app.use((req, res, next) => {
            if (
                (req.method === 'GET' || req.method === 'HEAD') &&
                /^\/(?:games(?:\/[^/]+)?|about)?\/?$/.test(req.path)
            ) {
                return res.sendFile(join(frontendDir, 'index.html'));
            }
            next();
        });
    }

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.enableCors({
        origin: 'http://localhost:5173',
    });

    const config = new DocumentBuilder()
        .setTitle('GameStore API')
        .setDescription('GameStore REST API')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
