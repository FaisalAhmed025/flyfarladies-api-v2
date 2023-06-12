import { Injectable } from '@nestjs/common';

@Injectable()
export class oauthService {
  googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }
    return {
      status:"success",
      message: 'login successful',
      
    };
  }
}