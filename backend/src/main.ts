import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://sementesplay.vercel.app',
      'https://sementesplay-frontend.vercel.app',
      'https://frontend-amr3xhwhk-favelaas-projects.vercel.app',
      'https://frontend-xi-beryl-69.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap(); 