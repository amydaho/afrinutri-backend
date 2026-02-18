import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const expressApp = express();
    
    // Increase body size limit to 10MB for image uploads
    expressApp.use(express.json({ limit: '10mb' }));
    expressApp.use(express.urlencoded({ limit: '10mb', extended: true }));
    
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule, adapter);

    // Enable CORS
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

    await app.init();
    cachedApp = expressApp;
  }
  
  return cachedApp;
}

export default async (req: any, res: any) => {
  const app = await bootstrap();
  app(req, res);
};
