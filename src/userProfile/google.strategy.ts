import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entitties/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(  @InjectRepository(User) private UserRepository: Repository<User>, ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // callbackURL: 'http://localhost:3000/auth/google-redirect',
      callbackURL: process.env. GOOGLE_OAUTH_REDIRECT,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    try {
      let user = await this.UserRepository.findOne({ where:{Email: emails[0].value}})
      if(user){
        user.FirstName = name.givenName;
        user.LastName = name.familyName;
        user.picture = photos[0].value;
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
      }
      else{
        const user = new User();
        user.Email = emails[0].value;
        user.FirstName = name.givenName;
        user.LastName = name.familyName;
        user.picture = photos[0].value;
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        const savedUser= await this.UserRepository.save(user)
        done(null, savedUser);
      }
      const savedUser= await this.UserRepository.save(user)
      done(null,savedUser);
   
      } catch (error) {
        done(error);
      }
}
}