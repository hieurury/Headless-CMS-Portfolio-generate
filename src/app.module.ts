import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { PagesModule } from './pages/pages.module';
import { ComponentsModule } from './components/components.module';
import { AiModule } from './ai/ai.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    // ─── Global Config ───────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // ─── Database ────────────────────────────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodbUri'),
      }),
    }),

    // ─── Feature Modules ─────────────────────────────────────────────
    UsersModule,
    AuthModule,
    PortfoliosModule,
    PagesModule,
    ComponentsModule,
    AiModule,
    PublicModule,
  ],
})
export class AppModule {}
