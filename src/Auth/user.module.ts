import { jwtConstants } from './constant';
import { UserServices } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { Admin } from './entities/user.entity';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';



@Module({
   imports: [TypeOrmModule.forFeature([Admin]),

   JwtModule.register({
      secret: jwtConstants.secret,
      signOptions:{expiresIn:'1d'},
   }),

   ],
   controllers:[UserController],
   providers:[UserServices, JwtStrategy,]

})

export class UserModule{}