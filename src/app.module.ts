import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { AiModule } from './modules/ai/ai.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    AiModule,
    NutritionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
