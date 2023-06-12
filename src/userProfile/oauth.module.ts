import { GoogleStrategy } from './google.strategy';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OauthController } from './oauth.controller';
import { oauthService } from './oauth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entitties/user.entity';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([User])],
  controllers: [OauthController],
  providers: [oauthService, GoogleStrategy],
})
export class oauthModule {}