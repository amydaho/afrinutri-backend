import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });
  
  // Enable CORS with explicit configuration
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://afrinutri-frontend1.vercel.app',
        process.env.FRONTEND_URL,
        'http://localhost:3000',
      ].filter(Boolean);
      
      console.log('CORS request from origin:', origin);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Origin not allowed:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`CORS enabled for: https://afrinutri-frontend1.vercel.app`);
}
bootstrap();
