import { Repository } from 'typeorm/repository/Repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/user.entity';
import { CreateUserDto } from './Dto/create-user.dto';
import * as bcrypt from 'bcrypt';

import { updateUserDto } from './Dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class UserServices{
   constructor(@InjectRepository(Admin) private userRepo:Repository<Admin>,
   private readonly jwtService:JwtService){}

   // Register user
   async Register(userDto:CreateUserDto){
      const hashedPassword= await bcrypt.hash(userDto.Password, 10)
      const newuser= await this.userRepo.create({...userDto, Password: hashedPassword});
      await this.userRepo.save(newuser);
      return this.generateToken(newuser)
   }
    

   // generate token 
   async generateToken(userdto: CreateUserDto): Promise<string> {
      const payload = { email: userdto.Email };
      const token = await this.jwtService.signAsync(payload);
      userdto.jwtToken = token;
      await this.userRepo.save(userdto);
      return token;
    }


   // login user
   async login(Email: string, Password:string): Promise<string> {
   const user = await this.userRepo.findOne({ where:{Email} });
   if (!user) {
      throw new HttpException("User does not exists", HttpStatus.BAD_REQUEST,);
   }
   const isMatch = await bcrypt.compare(Password, user.Password);
   if (!isMatch) {
   throw new HttpException("password is not correct", HttpStatus.BAD_REQUEST,);
   }
   return this.generateToken(user);
   
}

   // verified token
   async verifyToken(jwtToken?: string): Promise<Admin> {
      if (!jwtToken) {
         throw new HttpException('JWT token is required', HttpStatus.BAD_REQUEST);
       }
      const user = await this.userRepo.findOne({ where:{jwtToken} });
      if (!user) {
         throw new HttpException("Invalid jwt token", HttpStatus.BAD_REQUEST);
      }
      return user;
   }


      // validate email
      async getUserByEmail(Email: string): Promise<Admin> {
         return this.userRepo.findOne({ where:{Email} });
       }
   


      // get All User
      async FindAllUser() {
         const user = await this.userRepo.find();
         if (!user) {
            throw new HttpException("User not found", HttpStatus.BAD_REQUEST);
         }
         return user;
      }

   // find user by Id
   async findUserById(Id: string): Promise<Admin> {
      const user = await this.userRepo.findOne({ where:{Id} });
      if (!user) {
         throw new HttpException("User not found", HttpStatus.BAD_REQUEST);
      }
      return user;
   }

   // update user
   async UpdateUser(Id:string, updteuserDto:updateUserDto){
      const updateuser = await this.userRepo.update({Id}, {...updteuserDto})
      return updateuser;
      
   }
   
   // Delte User
   async DeleteUser(Id:string){
      const user = await this.userRepo.delete(Id)
      return user;
   }

}