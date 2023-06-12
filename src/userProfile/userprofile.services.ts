
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tourpackage } from 'src/tourpackage/entities/tourpackage.entity';
import { User } from './entitties/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './Dto/user.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { Cheque } from './entitties/cheq.entity';
import { Cash } from './entitties/cash.entity';
import { BankTransfer } from './entitties/BankTransfer.entity';
import { CardPayment } from './entitties/Cardpayment.entity';
import { Bkash } from './entitties/Bkash.entity';
import { MobileBanking } from './entitties/MobileBanking.enity';


@Injectable()
export class UserServices {
   constructor(
      @InjectRepository(User) private userRepository: Repository<User>,
      @InjectRepository(Tourpackage)
      private readonly tourPackageRepository: Repository<Tourpackage>,
      @InjectRepository(User) private userRepo:Repository<User>,
      @InjectRepository(Cheque) private chequeRepository:Repository<Cheque>,
      @InjectRepository(Cash) private CashRepository:Repository<Cash>,
      @InjectRepository(BankTransfer) private BankTransferRepository:Repository<BankTransfer>,
      @InjectRepository(CardPayment) private CardPaymentRepository:Repository<CardPayment>,
      @InjectRepository(Bkash) private BkashPaymentRepository:Repository<Bkash>,
      @InjectRepository(MobileBanking) private MobileBankingRepository:Repository<MobileBanking>,
      private readonly jwtService:JwtService) {}

   // Register user
   async Register(userDto:CreateUserDto){
      const hashedPassword= await bcrypt.hash(userDto.Password, 10)
      const newuser= await this.userRepo.create({...userDto, Password: hashedPassword});
      await this.userRepo.save(newuser);
      await this.sendRegisterSuccecess(userDto)
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

    async sendRegisterSuccecess(userdto: CreateUserDto) {
      // Create a transporter with SMTP configuration
      const transporter = nodemailer.createTransport({
        host: 'b2b.flyfarint.com', // Replace with your email service provider's SMTP host
        port: 465, // Replace with your email service provider's SMTP port
        secure: true, // Use TLS for secure connection
        auth: {
          user: 'flyfarladies@mailservice.center', // Replace with your email address
          pass: 'YVWJCU.?UY^R', // Replace with your email password
        },
      });
    
  
      // Compose the email message
      const mailOptions = {
        from: 'flyfarladies@mailservice.center', // Replace with your email address
        to:userdto.Email, // Recipient's email address
        subject: 'Welcome To Fly Far Ladies',
        text: 'Congrats! your Registration has been Completed ',
        html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Deposit Request</title>
          </head>
          <body>
            <div
              style="
                width: 700px;
                height: fit-content;
                margin: 0 auto;
                background-color: #efefef;
              "
            >
              <div style="width: 700px; height: 70px; background: #fe99a6">
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  align="center"
                  style="
                    border-collapse: collapse;
                    border-spacing: 0;
                    padding: 0;
                    width: 700px;
                  "
                >
                  <tr>
                    <td
                      align="center"
                      valign="top"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        color: #ffffff;
                        font-family: sans-serif;
                        font-size: 15px;
                        line-height: 38px;
                        padding: 20px 0 20px 0;
                        text-transform: uppercase;
                        letter-spacing: 5px;
                      "
                    >
                      Welcome to Fly Far ladies
                    </td>
                  </tr>
                </table>
        
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  align="center"
                  style="
                    border-collapse: collapse;
                    border-spacing: 0;
                    padding: 0;
                    width: 700px;
                  "
                >
                  <tr>
                    <td
                      valign="top"
                      style="
                        background-color: #efefef;
                        border-collapse: collapse;
                        border-spacing: 0;
                        color: #584660;
                        font-family: sans-serif;
                        font-size: 30px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 20px 40px 0px 55px;
                      "
                    >
                      ${userdto.Name}
                    </td>
                  </tr>
                  <tr>
                    <td
                      valign="top"
                      style="
                        background-color: #efefef;
                        border-collapse: collapse;
                        border-spacing: 0;
                        color: #bc6277;
                        font-family: sans-serif;
                        font-size: 17px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 0px 40px 20px 55px;
                      "
                    >
                      ${userdto.CreatedAt}
                    </td>
                  </tr>
                </table>
        
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  align="center"
                  style="
                    border-collapse: collapse;
                    border-spacing: 0;
                    padding: 0;
                    width: 620px;
                    background-color: #ffffff;
                  "
                >
                  <tr>
                    <td
                      valign="top"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        color: #bc6277;
                        font-family: sans-serif;
                        font-size: 15px;
                        font-weight: 600;
                        line-height: 38px;
                        padding: 10px 20px 5px 20px;
                      "
                    >
                      User Details
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #dfdfdf">
                    <td
                      valign="top"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        color: #767676;
                        font-family: sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 5px 20px;
                        width: 180px;
                      "
                    >
                      Username
                    </td>
                    <td
                      valign="top"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        color: #767676;
                        font-family: sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 5px 20px;
                      "
                    >
                      ${userdto.Name}
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #dfdfdf">
                    <td
                      valign="top"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        color: #767676;
                        font-family: sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 5px 20px;
                        width: 180px;
                      "
                    >
                      Password
                    </td>
                    <td
                      valign="top"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        color: #767676;
                        font-family: sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 5px 20px;
                      "
                    >
                    ${userdto.Password}
                    </td>
                  </tr>
                </table>
        
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  align="center"
                  style="
                    border-collapse: collapse;
                    border-spacing: 0;
                    padding: 0;
                    width: 670px;
                    background-color: #702c8b;
                    margin-top: 25px;
                    text-align: center;
                    color: #ffffff !important;
                    text-decoration: none !important;
                  "
                >
                  <tr>
                    <td
                      valign="top"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        font-family: sans-serif;
                        font-size: 16px;
                        font-weight: 500;
                        padding: 20px 20px 0px 20px;
                      "
                    >
                      Need more help?
                    </td>
                  </tr>
        
                  <tr>
                    <td
                      valign="top"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        font-family: sans-serif;
                        font-size: 12px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 0px 20px 10px 20px;
                      "
                    >
                      Mail us at
                      <span style="color: #ffffff !important; text-decoration: none"
                        >support@flyfarladies.com</span
                      >
                      or Call us at 09606912912
                    </td>
                  </tr>
                </table>
        
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  align="left"
                  style="
                    border-collapse: collapse;
                    border-spacing: 0;
                    padding: 0;
                    width: 420px;
                    color: #ffffff;
                  "
                >
                  <tr>
                    <td
                      valign="top"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        font-family: sans-serif;
                        font-size: 13px;
                        font-weight: 600;
                        padding: 20px 0px 0px 45px;
                        color: #767676;
                      "
                    >
                      <a style="padding-right: 20px; color: #584660" href="http://"
                        >Terms & Conditions</a
                      >
        
                      <a style="padding-right: 20px; color: #584660" href="http://"
                        >Booking Policy</a
                      >
        
                      <a style="padding-right: 20px; color: #584660" href="http://"
                        >Privacy Policy</a
                      >
                    </td>
                  </tr>
                </table>
        
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    border-collapse: collapse;
                    border-spacing: 0;
                    width: 700px;
                    color: #ffffff;
                    margin-top: 85px;
                  "
                >
                  <tr>
                    <td style="padding-left: 45px">
                      <img
                        style="padding-right: 5px"
                        src="./img/Vector (5).png"
                        href="http://"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="./img/Vector (6).png"
                        href="http://"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="./img/Vector (7).png"
                        href="http://"
                        alt=""
                      />
                    </td>
                  </tr>
        
                  <tr>
                    <td
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        font-family: sans-serif;
                        font-size: 13px;
                        font-weight: 500;
                        padding: 5px 0px 0px 45px;
                        color: #767676;
                        padding-bottom: 2px;
                      "
                    >
                      Ka 11/2A, Bashundhora R/A Road, Jagannathpur, Dhaka 1229.
                    </td>
        
                    <td
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        font-family: sans-serif;
                        font-weight: 500;
                        color: #767676;
                        padding-bottom: 20px;
        
                      "
                    >
                      <img width="100px" src="./img/logo 1 (1).png" alt="" />
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </body>
        </html>
        `

      }
      await transporter.sendMail(mailOptions,(error, info) => {
         if (error) {
           console.error(error);
         } else {
           console.log('Email sent successfully:', info.response);
         }
       });
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
   async verifyToken(jwtToken?: string): Promise<User> {
      if (!jwtToken) {
         throw new HttpException('JWT token is required', HttpStatus.BAD_REQUEST);
       }
      const user = await this.userRepo.findOne({ where:{jwtToken} ,relations:['chequeDeposit','mobilebankDeposit','bankDeposit']});
      if (!user) {
         throw new HttpException("Invalid jwt token", HttpStatus.BAD_REQUEST);
      }
      return user;
   }


      // validate email
      async getUserByEmail(Email: string): Promise<User> {
         return this.userRepo.findOne({ where:{Email} });
       }


   // get All User
   async FindAllProfile() {
      const Profile = await this.userRepository.find({});
      if (!Profile) {
         throw new HttpException("user Profile not found", HttpStatus.BAD_REQUEST);
      }
      return Profile;
   }

   // find user by Id
   async FindProfile(uuid: string): Promise<User> {
      const Profile = await this.userRepository.findOne({ where: { uuid }, relations:['chequeDeposit','mobilebankDeposit','bankDeposit'] });
      if (!Profile) {
         throw new HttpException("Profile not found", HttpStatus.BAD_REQUEST);
      }
      return Profile;
   }


   // update user
   // Delete User
   async DeleteProfile(Id: string) {
      const Profile = await this.userRepository.delete(Id)
      return Profile;
   }

   
  async GetCheqDepo(uuid: string, Depositid: string) {
   const user = await this.userRepository.findOne({
     where: {
      uuid
     }
   })
   if (!user) {
     throw new HttpException(
       `User not found with this id=${uuid}`,
       HttpStatus.BAD_REQUEST,
     );
   }
   const cheque = await this.chequeRepository.findOne({ where: { Depositid } })
   if (!cheque) {
     throw new HttpException(
       `cheque deposit request does not exist with this id=${Depositid}`,
       HttpStatus.BAD_REQUEST,
     );
   }
   return cheque;
 }

 async AllDeposit(uuid: string) {
   const user = await this.userRepository.findOne({
     where: {
       uuid,
     },
   });
   if (!user) {
     throw new HttpException(
       `User not found with this id=${uuid}`,
       HttpStatus.BAD_REQUEST,
     );
   }
 
   const chequeDeposits = await this.chequeRepository.find({
     where: {
       DepositType: 'Cheque', // retrieve cheque deposit requests
     },
     order: {
       CreatedAt: 'DESC',
     },
   });
 
   const mobileBankings = await this.MobileBankingRepository.find({
     where: {
       DepositType: 'MobileBank', // retrieve mobile banking deposit requests
     },
     order: {
      CreatedAt: 'DESC',
     },
   });
 
   const bankTransfers = await this.BankTransferRepository.find({
     where: {

       DepositType: 'Bank', // retrieve bank transfer deposit requests
     },
     order: {
       CreatedAt: 'DESC',
     },
   });
 
   const allDeposits = [
     ...chequeDeposits,
     ...mobileBankings,
     ...bankTransfers,
   ].sort((a, b) => b.CreatedAt.getTime() - a.CreatedAt.getTime());
 
   if (!allDeposits || allDeposits.length === 0) {
     throw new HttpException(
       `No deposit requests found`,
       HttpStatus.BAD_REQUEST,
     );
   }
 
   return allDeposits;
 }


 async AllDepositRequest() {
  const chequeDeposits = await this.chequeRepository.find({
    where: {
      DepositType: 'Cheque', // retrieve cheque deposit requests
    },
    order: {
      CreatedAt: 'DESC',
    },
  });

  const mobileBankings = await this.MobileBankingRepository.find({
    where: {
      DepositType: 'MobileBank', // retrieve mobile banking deposit requests
    },
    order: {
     CreatedAt: 'DESC',
    },
  });

  const bankTransfers = await this.BankTransferRepository.find({
    where: {

      DepositType: 'Bank', // retrieve bank transfer deposit requests
    },
    order: {
      CreatedAt: 'DESC',
    },
  });

  const allDeposits = [
    ...chequeDeposits,
    ...mobileBankings,
    ...bankTransfers,
  ].sort((a, b) => b.CreatedAt.getTime() - a.CreatedAt.getTime());

  if (!allDeposits || allDeposits.length === 0) {
    throw new HttpException(
      `No deposit requests found`,
      HttpStatus.BAD_REQUEST,
    );
  }
  return allDeposits;
}
 

 async AllCheqDepo(uuid: string) {
   const user = await this.userRepository.findOne({
     where: {
      uuid
     }
   })
   if (!user) {
     throw new HttpException(
       `User not found with this id=${uuid}`,
       HttpStatus.BAD_REQUEST,
     );
   }
   const cheque = await this.chequeRepository.find({
      order:{
         CreatedAt:'DESC'
      }
   })
   if (!cheque) {
     throw new HttpException(
       `cheque deposit request does not exist`,
       HttpStatus.BAD_REQUEST,
     );
   }
   return cheque;
 }

 




}