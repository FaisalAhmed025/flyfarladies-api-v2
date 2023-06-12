
import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, ParseFilePipeBuilder, ParseIntPipe, ParseUUIDPipe, Patch, Post, Req, Res, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor} from "@nestjs/platform-express";
import { InjectRepository } from "@nestjs/typeorm";
import { Request, Response } from 'express';
import { Equal, Repository, getRepository } from "typeorm";;
import { GCSStorageService } from "src/s3/s3.service";
import { CreateUserDto } from "./Dto/user.dto";
import { User } from "./entitties/user.entity";
import { Cheque, PaymentStatus } from "./entitties/cheq.entity";
import { Cash } from "./entitties/cash.entity";
import { BankTransfer } from "./entitties/BankTransfer.entity";
import { CardPayment } from "./entitties/Cardpayment.entity";
import { Bkash } from "./entitties/Bkash.entity";
import { MobileBanking } from "./entitties/MobileBanking.enity";
import { profile } from "console";
import { UserServices } from "./userprofile.services";
import { Tourpackage } from "src/tourpackage/entities/tourpackage.entity";
import { Traveller } from "src/Traveller/entities/traveller.entity";
import * as nodemailer from 'nodemailer'
import { socialimageenity } from "./entitties/socialimages.entity";
import { ApiTags } from "@nestjs/swagger";


@ApiTags('User Module')
@Controller('user')
export class userProfileController {
  constructor(
    @InjectRepository(User) private UserRepository: Repository<User>,
    @InjectRepository(Cheque) private chequeRepository: Repository<Cheque>,
    @InjectRepository(Cash) private CashRepository: Repository<Cash>,
    @InjectRepository(BankTransfer)
    private BankTransferRepository: Repository<BankTransfer>,
    @InjectRepository(CardPayment)
    private CardPaymentRepository: Repository<CardPayment>,
    @InjectRepository(Bkash) private BkashPaymentRepository: Repository<Bkash>,
    @InjectRepository(MobileBanking)
    private MobileBankingRepository: Repository<MobileBanking>,
    @InjectRepository(Tourpackage)
    private tourpackageRepository: Repository<Tourpackage>,
    @InjectRepository(Traveller)
    private TravellerRepository: Repository<Traveller>,
    @InjectRepository(socialimageenity)
    private socialimageenityRepository: Repository<socialimageenity>,
    private readonly UserServices: UserServices,
    private s3service: GCSStorageService,
  ) {}
  @ApiTags('User Auth Module')
  @Post()
  async Register(
    @Body() userDto: CreateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ExistUser = await this.UserServices.getUserByEmail(userDto.Email);
    if (ExistUser) {
      throw new HttpException(
        'User Already Exist,please try again with another email',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.UserServices.Register(userDto);
    return res
      .status(HttpStatus.CREATED)
      .json({ status: 'success', message: 'user register successfully' });
  }
  @ApiTags('User Auth Module')
  @Post('login')
  async login(
    @Body('Email') Email: string,
    @Body('Password') Password: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const token = await this.UserServices.login(Email, Password);
    return res.status(HttpStatus.CREATED).json({
      status: 'success',
      message: 'user login successfully',
      jwtToken: token,
    });
  }

  @ApiTags('User Auth Module')
  @Post('verify')
  async verify(@Body('jwtToken') jwtToken: string): Promise<User> {
    const user = await this.UserServices.verifyToken(jwtToken);
    return user;
  }

  // Add Traveller
  @Patch('update/:uuid')
  async updateProfile(
    @Body() body,
    @Param('uuid') uuid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userprofile = await this.UserRepository.findOne({ where: { uuid } });
    if (!userprofile) {
      throw new HttpException(`User profile not found`, HttpStatus.BAD_REQUEST);
    }
    userprofile.NameTitle = req.body.NameTitle;
    userprofile.FirstName = req.body.FirstName;
    userprofile.LastName = req.body.LastName;
    userprofile.DOB = req.body.DOB;
    userprofile.Gender = req.body.Gender;
    userprofile.Profession = req.body.Profession;
    userprofile.Nationality = req.body.Nationality;
    userprofile.Mobile = req.body.Mobile;
    userprofile.Email = req.body.Email;
    userprofile.Address = req.body.Address;
    userprofile.NID = req.body.NID;
    userprofile.PassportExpireDate = req.body.PassportExpireDate;
    userprofile.PassportNumber = req.body.PassportNumber;
    userprofile.FaceBookId = req.body.FaceBookId;
    userprofile.LinkedIn = req.body.LinkedIn;
    userprofile.WhatsApp = req.body.whatsApp;
    await this.UserRepository.update({ uuid }, { ...userprofile });
    return res.status(HttpStatus.CREATED).json({
      status: 'success',
      message: 'user Profile updated successfully',
    });
  }
  @Patch('updateprofile/:uuid')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilephoto', maxCount: 1 },
      { name: 'passportcopy', maxCount: 1 },
    ]),
  )
  async updateImageUrl(
    @UploadedFiles()
    files: {
      profilephoto?: Express.Multer.File[];
      passportcopy?: Express.Multer.File[];
    },
    @Param('uuid') uuid: string,
    @Body() @Req() req: Request,
    @Res() res: Response,
  ) {
    const profilephoto = files.profilephoto
      ? await this.s3service.updateImageuserphotos(uuid, files.profilephoto[0])
      : null;
    const passportcopy = files.passportcopy
      ? await this.s3service.updateImageuserphotos(uuid, files.passportcopy[0])
      : null;

    const userphotos = new User();
    if (profilephoto) userphotos.PassportsizephotoUrl = profilephoto;
    if (passportcopy) userphotos.PassportCopy = passportcopy;

    await this.UserRepository.update({ uuid }, { ...userphotos });

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'image has been updated successfully',
    });
  }

  // Add Traveller
  @Post('upload/logos')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'Logo', maxCount: 2 },
      { name: 'facebookIcon', maxCount: 2 },
      { name: 'linkedinIcon', maxCount: 2 },
      { name: 'whatsappIcon', maxCount: 2 },
    ]),
  )
  async AddSocialImages(
    @UploadedFiles()
    file: {
      facebookIcon?: Express.Multer.File[];
      Logo?: Express.Multer.File[];
      linkedinIcon?: Express.Multer.File[];
      whatsappIcon?: Express.Multer.File[];
    },
    @Body() body,
    @Res() res: Response,
  ) {
    const facebookIcon = await this.s3service.Addimage(file.facebookIcon[0]);
    const Logo = await this.s3service.Addimage(file.Logo[0]);
    const linkedinIcon = await this.s3service.Addimage(file.linkedinIcon[0]);
    const whatsappIcon = await this.s3service.Addimage(file.whatsappIcon[0]);
    const logos = new socialimageenity();
    logos.Logo = Logo;
    logos.facebookIcon = facebookIcon;
    logos.linkedinIcon = linkedinIcon;
    logos.whatsappIcon = whatsappIcon;
    await this.socialimageenityRepository.save({ ...logos });
    return res
      .status(HttpStatus.CREATED)
      .json({ status: 'success', message: 'Logo Added successfully' });
  }

  @Get('/allsocial/image')
  async alllogo(@Res() res: Response) {
    const logos = await this.socialimageenityRepository.find({ where: {} });
    if (!logos) {
      throw new HttpException('Profile logos found', HttpStatus.BAD_REQUEST);
    }
    return res.status(HttpStatus.OK).json({ logos });
  }

  @Post(':id/addtraveler')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'passportphotoUrl', maxCount: 2 }]),
  )
  async addTraveler(
    @UploadedFiles()
    file: { passportphotoUrl?: Express.Multer.File[] },
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const user = await this.UserRepository.findOne({ where: { uuid } });
    const {
      Title,
      FirstName,
      LastName,
      Nationality,
      DOB,
      Gender,
      PaxType,
      PassportNumber,
      PassportExpireDate,
    } = req.body;
    const Passportcopy = await this.s3service.Addimage(
      file.passportphotoUrl[0],
    );
    const traveler = new Traveller();
    traveler.Title = Title;
    traveler.FirstName = FirstName;
    traveler.LastName = LastName;
    traveler.Nationality = Nationality;
    traveler.Gender = Gender;
    traveler.PaxType = PaxType;
    traveler.DOB = DOB;
    traveler.PassportNumber = PassportNumber;
    traveler.PassportExpireDate = PassportExpireDate;
    traveler.PassportCopyURL = Passportcopy;
    traveler.user = user;
    await this.TravellerRepository.save({ ...traveler });
    return res
      .status(HttpStatus.CREATED)
      .json({ status: 'success', message: 'Traveler Added successfully' });
  }

  @Post('addwishlist')
  async addWishlist(
    @Body('Id') Id: string,
    @Body('uuid') uuid: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const tourpackage = await this.tourpackageRepository
      .createQueryBuilder('tourpackage')
      .where('tourpackage.Id = :Id', { Id: Id })
      .getOne();
    if (!tourpackage) {
      throw new Error('Tour package not found');
    }

    const user = await this.UserRepository.findOne({ where: { uuid } });

    if (!user) {
      throw new Error('User not found');
    }

    user.wishlist = user.wishlist || [];
    const tourpackageIndex = user.wishlist.findIndex((pkg) => pkg === Id);

    if (tourpackageIndex === -1) {
      user.wishlist.push(Id);
      await this.UserRepository.save(user);
      return res
        .status(HttpStatus.CREATED)
        .json({ status: 'success', message: 'Wishlist added successfully' });
    } else {
      throw new HttpException(
        'Tour package already exists in wishlist',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':uuid/mywishlist')
  async getAllWishlist(@Param('uuid') uuid: string, Id: string) {
    const user = await this.UserRepository.findOne({ where: { uuid } });
    if (!user) {
      throw new Error('User not found');
    }
    const tourPackages = user.wishlist.map(async (pkgId) => {
      const tourpackage = await this.tourpackageRepository.findOne({
        where: { Id },
      });
      if (!tourpackage) {
        throw new Error(`Tour package with ID ${pkgId} not found`);
      }

      return {
        id: tourpackage.Id,
        mainTitle: tourpackage.MainTitle,
        subtitle: tourpackage.SubTitle,
        CoverImage: tourpackage.coverimageurl,
        Price: tourpackage.Price,
        StartDate: tourpackage.StartDate,
        EndDate: tourpackage.EndDate,
        Duration: tourpackage.TotalDuration,
        Location: tourpackage.Location,
        City: tourpackage.City,
        Discount: tourpackage.Discount,
        TripType: tourpackage.TripType,
        Country: tourpackage.Country,
        AvailableSeats: tourpackage.AvailableSeats,
        MinimumAge: tourpackage.MinimumAge,
        MaximumAge: tourpackage.MaximumAge,
        PackageOverview: tourpackage.PackageOverview,
        Availability: tourpackage.Availability,
        Showpackage: tourpackage.Showpackage,
        Flight: tourpackage.Flight,
        Transport: tourpackage.Transport,
        hotel: tourpackage.Hotel,
        albumimages: tourpackage.albumImages,
        visitedImage: tourpackage.vistitedImages,
        installment: tourpackage.installments,
        packageplan: tourpackage.tourpackageplans,
        mainimage: tourpackage.mainimage,
        exclusions: tourpackage.exclusions,
        highlights: tourpackage.highlights,
        bookingpolicy: tourpackage.BookingPolicys,
        inclsuions: tourpackage.PackageInclusions,
        refundpolicy: tourpackage.refundpolicys,
        // add other properties you want to include here
      };
    });

    return Promise.all(tourPackages);
  }

  @Patch('removewishlist')
  async removeWishlist(
    @Res() res: Response,
    @Body('Id') Id: string,
    @Body('uuid') uuid: string,
  ) {
    const user = await this.UserRepository.findOne({ where: { uuid } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const tourpackageIndex = user.wishlist.findIndex((pkgId) => pkgId === Id);
    if (tourpackageIndex === -1) {
      throw new HttpException(
        'Tour package not found in wishlist',
        HttpStatus.BAD_REQUEST,
      );
    }
    user.wishlist.splice(tourpackageIndex, 1);
    await this.UserRepository.save(user);
    return res
      .status(HttpStatus.CREATED)
      .json({ status: 'success', message: 'remove wishlist successfully' });
  }

  // all user

  @Get('AllProfile')
  async FindAll(@Req() req: Request, @Res() res: Response) {
    const Profile = await this.UserServices.FindAllProfile();
    return res.status(HttpStatus.OK).json({ Profile });
  }

  @Get(':uuid/mytraveler')
  async GetTravler(@Param('uuid') uuid: string, @Res() res: Response) {
    const Profile = await this.UserRepository.findOne({ where: { uuid } });
    if (!Profile) {
      throw new HttpException('Profile not found', HttpStatus.BAD_REQUEST);
    }
    const mytravlerbuddy = await this.TravellerRepository.find({ where: {} });
    return res.status(HttpStatus.OK).json({ mytravlerbuddy });
  }

  // // get user dashbboard
  @Get(':id')
  async UserDashboard(@Param('id') id: string, @Res() res: Response) {
    const dashboard = await this.UserServices.FindProfile(id);
    return res.status(HttpStatus.OK).json({ dashboard });
  }

  @Delete(':id')
  async DeleteTraveller(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.UserServices.DeleteProfile(id);
    return res.status(HttpStatus.OK).json({ message: 'traveller has deleted' });
  }

  //cheque details
  @Post(':uuid/Add/cheque/deposit')
  @UseInterceptors(FileInterceptor('chequeattachmenturl'))
  async AddCheque(
    @Param('uuid') uuid: string,
    Depositid: string,
    @UploadedFile()
    file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const Profile = await this.UserRepository.findOne({ where: { uuid } });
    if (!Profile) {
      throw new HttpException('Profile not found', HttpStatus.BAD_REQUEST);
    }
    const chequeattachmenturl = await this.s3service.Addimage(file);
    const cheque = new Cheque();
    cheque.chequeattachmenturl = chequeattachmenturl;
    cheque.ChequeNumber = req.body.ChequeNumber;
    cheque.BankName = req.body.BankName;
    cheque.DepositType = req.body.DepositType;
    cheque.ChequeDate = req.body.ChequeDate;
    cheque.Reference = req.body.Reference;
    cheque.Amount = parseFloat(req.body.Amount);
    cheque.userprofile = Profile;
    cheque.uuid = Profile.uuid;
    await this.chequeRepository.save(cheque);
    await this.sendChequeDepositDetails(uuid, Depositid);
    return res.status(HttpStatus.OK).send({
      status: 'success',
      message: ' Cheque Deposit Request Successfull',
    });
  }

  async sendChequeDepositDetails(uuid: string, Depositid: string) {
    const transporter = nodemailer.createTransport({
      host: 'b2b.flyfarint.com', // Replace with your email service provider's SMTP host
      port: 465, // Replace with your email service provider's SMTP port
      secure: true, // Use TLS for secure connection
      auth: {
        user: 'flyfarladies@mailservice.center', // Replace with your email address
        pass: 'YVWJCU.?UY^R', // Replace with your email password
      },
    });
    const chequedepo = await this.chequeRepository.findOne({
      where: { Depositid },
    });
    const user = await this.UserRepository.findOne({ where: { uuid } });
    // Compose the email message
    const mailOptions = {
      from: 'flyfarladies@mailservice.center', // Replace with your email address
      to: user.Email, // Recipient's email address
      subject: 'Deposit Confiramtion',
      text: 'Please find the attached file.',
      html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Deposit Request</title>
          </head>
          <body>
            <div style="width: 700px; height: 110vh; margin: 0 auto">
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
                      Deposit Confirmation
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
                      ${chequedepo.Amount}
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
                      ${chequedepo.DepositType}
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
                      Transaction Details
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
                      Trasaction ID
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
                      ${chequedepo.Depositid}
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
                      Bank Name
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
                      ${chequedepo.BankName}
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
                      Transaction Date
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
                      ${chequedepo.ChequeDate}
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
                      Reference
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
                      ${chequedepo.Reference}
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
                    margin-top: 15px;
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
                        color: #767676;
                        font-family: sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 5px 20px;
                        width: 600;
                        font-style: italic;
                      "
                    >
                      Please Wait a little while. Your money will be added to your
                      wallet after verification is complete.
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
                      or Call us at +88 01755582111
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
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_facebook.png"
                        href="https://www.facebook.com/flyfarladies/?ref=page_internal"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_linkedIn.png"
                        href="https://www.linkedin.com/company/fly-far-ladies/"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_whatsapp.png"
                        href="https://wa.me/+88 01755582111"
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
                      <img
                        width="100px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_logo.png"
                        href="https://www.flyfarladies.com/"
                        alt=""
                      />
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </body>
        </html>
        `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  }

  @Patch('Cheque/:Depositid/approve')
  async approveCheque(
    @Param('Depositid') Depositid: string,
    @Body('uuid') uuid: string,
    @Body() body: { ActionBy: string },
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const cheque = await this.chequeRepository.findOne({
      where: { Depositid },
    });
    if (!cheque) {
      throw new NotFoundException('Cheque not found');
    }
    if (cheque.status !== PaymentStatus.PENDING) {
      throw new NotFoundException(
        'Deposit request already approved or Rejected',
      );
    }
    const profile = await this.UserRepository.findOne({ where: { uuid } });
    if (!profile) {
      throw new NotFoundException('user not found');
    }
    cheque.status = PaymentStatus.APPROVED;
    cheque.ActionBy = `Approved By ${body.ActionBy}`;
    if (!body.ActionBy) {
      throw new NotFoundException('ActionBy');
    }
    await this.chequeRepository.save(cheque);
    profile.Wallet += cheque.Amount;
    await this.UserRepository.save(profile);
    await this.sendDepositConfirmationToUser(uuid, Depositid);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: ' Deposit Request approved' });
  }

  async sendDepositConfirmationToUser(uuid: string, Depositid: string) {
    // Get tour package details
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
    const chequedepo = await this.chequeRepository.findOne({
      where: { Depositid },
    });
    const user = await this.UserRepository.findOne({ where: { uuid } });
    // Compose the email message
    const mailOptions = {
      from: 'flyfarladies@mailservice.center', // Replace with your email address
      to: user.Email, // Recipient's email address
      subject: 'Deposit Approved', // Replace with your email
      text: 'Please find the attached file.',
      html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Deposit Request</title>
          </head>
          <body>
            <div style="width: 700px; height: 110vh; margin: 0 auto">
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
                      Deposit Approved
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
                      ${chequedepo.Amount}
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
                      ${chequedepo.DepositType}
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
                      Transaction Details
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
                      Trasaction ID
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
                      ${chequedepo.Depositid}
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
                      Bank Name
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
                      ${chequedepo.BankName}
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
                      Transaction Date
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
                      ${chequedepo.ChequeDate}
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
                      Reference
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
                      ${chequedepo.Reference}
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
                    margin-top: 15px;
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
                        color: #767676;
                        font-family: sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 5px 20px;
                        width: 600;
                        font-style: italic;
                      "
                    >
                      Please Wait a little while. Your money will be added to your
                      wallet after verification is complete.
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
                      or Call us at +88 01755582111
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
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_facebook.png"
                        href="https://www.facebook.com/flyfarladies/?ref=page_internal"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_linkedIn.png"
                        href="https://www.linkedin.com/company/fly-far-ladies/"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_whatsapp.png"
                        href="https://wa.me/+88 01755582111"
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
                      <img
                        width="100px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_logo.png"
                        href="https://www.flyfarladies.com/"
                        alt=""
                      />
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </body>
        </html>
        `,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  }

  @Patch('Cheque/:Depositid/reject')
  async rejectCheque(
    @Param('Depositid') Depositid: string,
    uuid: string,
    @Body() body: { rejectionReason: string; ActionBy: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const cheque = await this.chequeRepository.findOne({
      where: { Depositid },
    });
    if (!cheque) {
      throw new NotFoundException('Cheque not found');
    }
    if (cheque.status !== PaymentStatus.PENDING) {
      throw new NotFoundException(
        'Deposit request already rejected or approved',
      );
    }
    cheque.status = PaymentStatus.REJECTED;
    cheque.ActionBy = `Action by ${body.ActionBy}`;
    if (!body.ActionBy) {
      throw new NotFoundException('Action by??');
    }
    cheque.rejectionReason = `Rejected due to ${body.rejectionReason}`;
    if (!body.rejectionReason) {
      throw new NotFoundException('please add reason');
    }
    await this.chequeRepository.save(cheque);
    await this.sendDepositrejectionToUser(uuid, Depositid);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: ' Deposit Request Rejected' });
  }

  async sendDepositrejectionToUser(uuid: string, Depositid: string) {
    // Get tour package details
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
    const chequedepo = await this.chequeRepository.findOne({
      where: { Depositid },
    });
    const user = await this.UserRepository.findOne({ where: { uuid } });
    // Compose the email message
    const mailOptions = {
      from: 'flyfarladies@mailservice.center', // Replace with your email address
      to: user.Email, // Recipient's email address
      subject: 'Deposit Rejection',
      text: 'Please find the attached file.',
      html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Deposit Request</title>
          </head>
          <body>
            <div style="width: 700px; height: 110vh; margin: 0 auto">
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
                      Deposit Reject
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
                      BDT ${chequedepo.Amount}
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
                    ${chequedepo.DepositType}
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
                      Transaction Details
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
                      Trasaction ID
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
                    ${chequedepo.Depositid}
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
                      Bank Name
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
                    ${chequedepo.BankName}
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
                      Transaction Date
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
                    ${chequedepo.ChequeDate}
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
                      Reject Reason
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
                    ${chequedepo.rejectionReason}
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
                      or Call us at +88 01755582111
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
                      <a
                        style="padding-right: 20px; color: #584660"
                        href="https://www.flyfarladies.com/termsandcondition"
                        >Terms & Conditions</a
                      >
        
                      <a
                        style="padding-right: 20px; color: #584660"
                        href="https://www.flyfarladies.com/bookingpolicy"
                        >Booking Policy</a
                      >
        
                      <a
                        style="padding-right: 20px; color: #584660"
                        href="https://www.flyfarladies.com/privacypolicy"
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
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_facebook.png"
                        href="https://www.facebook.com/flyfarladies/?ref=page_internal"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_linkedIn.png"
                        href="https://www.linkedin.com/company/fly-far-ladies/"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_whatsapp.png"
                        href="https://wa.me/+88 01755582111"
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
                      <img
                        width="100px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_logo.png"
                        href="https://www.flyfarladies.com/"
                        alt=""
                      />
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </body>
        </html>
        `,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  }

  @Get('cheques/pending')
  async PendingChequeDeposit(): Promise<Cheque[]> {
    const status: PaymentStatus = PaymentStatus.PENDING;
    return await this.chequeRepository.find({
      where: { status: Equal(PaymentStatus.PENDING) },
    });
  }

  // get refund policy
  @Get(':uuid/getcheque/:Depositid')
  async getchequeDeporequest(
    @Param('uuid') uuid: string,
    @Param('Depositid') Depositid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const chequeDeposit = await this.UserServices.GetCheqDepo(uuid, Depositid);
    return res.status(HttpStatus.OK).json({ chequeDeposit });
  }

  @Get(':uuid/allchequeDeposit')
  async AllChequeDeposit(
    @Param('uuid') uuid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const AllChequeDeposit = await this.UserServices.AllCheqDepo(uuid);
    return res.status(HttpStatus.OK).json({ AllChequeDeposit });
  }

  @Get(':uuid/allDeposit')
  async AllDeposit(
    @Param('uuid') uuid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const AllDeposit = await this.UserServices.AllDeposit(uuid);
    return res.status(HttpStatus.OK).json({ AllDeposit });
  }

  @Get('allDeposit/request')
  async allDepositrequest(
    @Param('uuid') uuid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const AllDeposit = await this.UserServices.AllDepositRequest();
    return res.status(HttpStatus.OK).json({ AllDeposit });
  }

  @Get('cheques/approved')
  async ApprovedChequeDeposit(): Promise<Cheque[]> {
    const status: PaymentStatus = PaymentStatus.APPROVED;
    return await this.chequeRepository.find({
      where: { status: Equal(PaymentStatus.APPROVED) },
    });
  }

  @Get('cheques/reject')
  async rejectChequeDeposit(): Promise<Cheque[]> {
    const status: PaymentStatus = PaymentStatus.REJECTED;
    return await this.chequeRepository.find({
      where: { status: Equal(PaymentStatus.REJECTED) },
    });
  }

  //mobileBank details

  @Post(':uuid/mobilebanking/deposit')
  @UseInterceptors(FileInterceptor('MobBankattachmenturl'))
  async addmobilebankinbg(
    @UploadedFile()
    file: Express.Multer.File,
    @Param('uuid') uuid: string,
    Depositid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const Profile = await this.UserRepository.findOne({ where: { uuid } });
    if (!Profile) {
      throw new HttpException('Profile not found', HttpStatus.BAD_REQUEST);
    }
    const MobBankattachmenturl = await this.s3service.Addimage(file);
    const MobileBank = new MobileBanking();
    MobileBank.MobBankattachmenturl = MobBankattachmenturl;
    MobileBank.AgentType = req.body.AgentType;
    MobileBank.AccountNumber = req.body.AccountNumber;
    MobileBank.Reference = req.body.Reference;
    MobileBank.DepositType = req.body.DepositType;
    MobileBank.TransactionId = req.body.TransactionId;
    MobileBank.Amount = parseFloat(req.body.Amount);
    const amount = MobileBank.Amount;
    MobileBank.Amount = amount;
    const fee = (amount * 1.5) / 100;
    MobileBank.GatewayFee = fee;
    const depositedAmount = amount - fee;
    MobileBank.DepositedAmount = depositedAmount;
    MobileBank.userprofile = Profile;
    MobileBank.uuid = Profile.uuid;
    await this.MobileBankingRepository.save(MobileBank);
    await this.sendMobileBankDepositDetails(uuid, Depositid);
    return res.status(HttpStatus.OK).send({
      status: 'success',
      message: ' Mobile Banking Deposit Request Successfull',
    });
  }

  async sendMobileBankDepositDetails(uuid: string, Depositid: string) {
    const transporter = nodemailer.createTransport({
      host: 'b2b.flyfarint.com', // Replace with your email service provider's SMTP host
      port: 465, // Replace with your email service provider's SMTP port
      secure: true, // Use TLS for secure connection
      auth: {
        user: 'flyfarladies@mailservice.center', // Replace with your email address
        pass: 'YVWJCU.?UY^R', // Replace with your email password
      },
    });
    const mbank = await this.MobileBankingRepository.findOne({
      where: { Depositid },
    });
    const user = await this.UserRepository.findOne({ where: { uuid } });
    const mailOptions = {
      from: 'flyfarladies@mailservice.center', // Replace with your email address
      to: user.Email,
      // Recipient's email address
      subject: 'Deposit Details',
      text: 'Please find the attached file.',
      html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Deposit Request</title>
          </head>
          <body>
            <div style="width: 700px; height: 110vh; margin: 0 auto">
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
                      Deposit Confirmation
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
                      ${mbank.DepositedAmount}
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
                      ${mbank.DepositType}
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
                      Transaction Details
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
                      Trasaction ID
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
                      ${mbank.Depositid}
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
                      Agent Type
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
                      ${mbank.AgentType}
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
                      Transaction Date
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
                      ${mbank.CreatedAt}
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
                    Gateway Fee
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
                    ${mbank.GatewayFee}
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
                      Reference
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
                      ${mbank.Reference}
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
                    margin-top: 15px;
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
                        color: #767676;
                        font-family: sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 5px 20px;
                        width: 600;
                        font-style: italic;
                      "
                    >
                      Please Wait a little while. Your money will be added to your
                      wallet after verification is complete.
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
                      or Call us at +88 01755582111
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
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_facebook.png"
                        href="https://www.facebook.com/flyfarladies/?ref=page_internal"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_linkedIn.png"
                        href="https://www.linkedin.com/company/fly-far-ladies/"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_whatsapp.png"
                        href="https://wa.me/+88 01755582111"
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
                      <img
                        width="100px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_logo.png"
                        href="https://www.flyfarladies.com/"
                        alt=""
                      />
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </body>
        </html>
        `,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  }

  @Patch('MobileBank/:Depositid/approve')
  async ApproveMobile(
    @Param('Depositid') Depositid: string,
    @Body('uuid') uuid: string,
    @Body() body: { ActionBy: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const mobnank = await this.MobileBankingRepository.findOne({
      where: { Depositid },
    });
    if (!mobnank) {
      throw new NotFoundException('Deposit not found');
    }
    if (mobnank.status !== PaymentStatus.PENDING) {
      throw new NotFoundException(
        'Deposit request already approved or Rejected',
      );
    }
    const profile = await this.UserRepository.findOne({ where: { uuid } });
    if (!profile) {
      throw new NotFoundException('user not found');
    }
    mobnank.status = PaymentStatus.APPROVED;
    mobnank.ActionBy = `Approved By ${body.ActionBy}`;
    if (!body.ActionBy) {
      throw new NotFoundException('Action By?');
    }
    await this.MobileBankingRepository.save(mobnank);
    profile.Wallet += mobnank.Amount;
    await this.UserRepository.save(profile);
    await this.sendMBankDepositConfirmationToUser(uuid, Depositid);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: ' Deposit Request approved' });
  }

  async sendMBankDepositConfirmationToUser(uuid: string, Depositid: string) {
    const transporter = nodemailer.createTransport({
      host: 'b2b.flyfarint.com', // Replace with your email service provider's SMTP host
      port: 465, // Replace with your email service provider's SMTP port
      secure: true, // Use TLS for secure connection
      auth: {
        user: 'flyfarladies@mailservice.center', // Replace with your email address
        pass: 'YVWJCU.?UY^R', // Replace with your email password
      },
    });
    const mbank = await this.MobileBankingRepository.findOne({
      where: { Depositid },
    });
    const user = await this.UserRepository.findOne({ where: { uuid } });
    const mailOptions = {
      from: 'flyfarladies@mailservice.center', // Replace with your email address
      to: user.Email, // Recipient's email address
      subject: 'Deposit approve',
      text: 'Please find the attached file.',
      html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Deposit Request</title>
          </head>
          <body>
            <div style="width: 700px; height: 110vh; margin: 0 auto">
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
                      Deposit Approved
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
                      ${mbank.DepositedAmount}
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
                      ${mbank.DepositType}
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
                      Transaction Details
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
                      Trasaction ID
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
                      ${mbank.Depositid}
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
                      Bank Name
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
                      ${mbank.AgentType}
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
                      Transaction Date
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
                      ${mbank.CreatedAt}
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
                      Gateway Fee
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
                      ${mbank.GatewayFee}
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
                    Reference
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
                    ${mbank.Reference}
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
                    margin-top: 15px;
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
                        color: #767676;
                        font-family: sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 5px 20px;
                        width: 600;
                        font-style: italic;
                      "
                    >
                      Please Wait a little while. Your money will be added to your
                      wallet after verification is complete.
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
                      or Call us at +88 01755582111
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
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_facebook.png"
                        href="https://www.facebook.com/flyfarladies/?ref=page_internal"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_linkedIn.png"
                        href="https://www.linkedin.com/company/fly-far-ladies/"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_whatsapp.png"
                        href="https://wa.me/+88 01755582111"
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
                      <img
                        width="100px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_logo.png"
                        href="https://www.flyfarladies.com/"
                        alt=""
                      />
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </body>
        </html>
        `,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  }

  @Patch('MobileBank/:Depositid/reject')
  async RejectMobilebankDeposit(
    @Param('Depositid') Depositid: string,
    uuid: string,
    @Body() body: { ActionBy: string; rejectionReason: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const mobilebank = await this.MobileBankingRepository.findOne({
      where: { Depositid },
    });
    if (!mobilebank) {
      throw new NotFoundException('Deposit not found');
    }
    if (mobilebank.status !== PaymentStatus.PENDING) {
      throw new NotFoundException(
        'Deposit request already rejected or approved',
      );
    }
    mobilebank.status = PaymentStatus.REJECTED;
    mobilebank.ActionBy = `Action By ${body.ActionBy}`;
    if (!body.ActionBy) {
      throw new NotFoundException('Action By?');
    }
    mobilebank.rejectionReason = `Rejected due to ${body.rejectionReason}`;
    if (!body.rejectionReason) {
      throw new NotFoundException(' please add reason');
    }
    await this.MobileBankingRepository.save(mobilebank);
    await this.sendMbankDepositrejectionToUser(uuid, Depositid);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: ' Deposit Request Rejected' });
  }

  async sendMbankDepositrejectionToUser(uuid: string, Depositid: string) {
    const transporter = nodemailer.createTransport({
      host: 'b2b.flyfarint.com', // Replace with your email service provider's SMTP host
      port: 465, // Replace with your email service provider's SMTP port
      secure: true, // Use TLS for secure connection
      auth: {
        user: 'flyfarladies@mailservice.center', // Replace with your email address
        pass: 'YVWJCU.?UY^R', // Replace with your email password
      },
    });
    const mbank = await this.MobileBankingRepository.findOne({
      where: { Depositid },
    });
    const user = await this.UserRepository.findOne({ where: { uuid } });
    // Compose the email message
    const mailOptions = {
      from: 'flyfarladies@mailservice.center', // Replace with your email address
      to: user.Email, // Recipient's email address
      subject: 'Deposit Rejection',
      text: 'Please find the attached file.',
      html: `<!DOCTYPE html>
           <html lang="en">
             <head>
               <meta charset="UTF-8" />
               <meta http-equiv="X-UA-Compatible" content="IE=edge" />
               <meta name="viewport" content="width=device-width, initial-scale=1.0" />
               <title>Deposit Request</title>
             </head>
             <body>
               <div style="width: 700px; height: 110vh; margin: 0 auto">
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
                         Deposit Reject
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
                         BDT ${mbank.DepositedAmount}
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
                       ${mbank.DepositType}
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
                         Transaction Details
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
                         Trasaction ID
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
                       ${mbank.Depositid}
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
                      Gatway Fee
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
                     ${mbank.GatewayFee}
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
                         Bank Name
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
                       ${mbank.AgentType}
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
                         Transaction Date
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
                       ${mbank.CreatedAt}
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
                         Reject Reason
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
                       ${mbank.rejectionReason}
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
                         or Call us at +88 01755582111
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
                         <a
                           style="padding-right: 20px; color: #584660"
                           href="https://www.flyfarladies.com/termsandcondition"
                           >Terms & Conditions</a
                         >
           
                         <a
                           style="padding-right: 20px; color: #584660"
                           href="https://www.flyfarladies.com/bookingpolicy"
                           >Booking Policy</a
                         >
           
                         <a
                           style="padding-right: 20px; color: #584660"
                           href="https://www.flyfarladies.com/privacypolicy"
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
                           src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_facebook.png"
                           href="https://www.facebook.com/flyfarladies/?ref=page_internal"
                           alt=""
                         />
                         <img
                           style="padding-right: 5px"
                           src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_linkedIn.png"
                           href="https://www.linkedin.com/company/fly-far-ladies/"
                           alt=""
                         />
                         <img
                           style="padding-right: 5px"
                           src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_whatsapp.png"
                           href="https://wa.me/+88 01755582111"
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
                         <img
                           width="100px"
                           src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_logo.png"
                           href="https://www.flyfarladies.com/"
                           alt=""
                         />
                       </td>
                     </tr>
                   </table>
                 </div>
               </div>
             </body>
           </html>
           `,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  }

  @Get('mobilebank/pending')
  async PendingMobileBankDeposit(): Promise<MobileBanking[]> {
    const status: PaymentStatus = PaymentStatus.PENDING;
    return await this.MobileBankingRepository.find({
      where: { status: Equal(PaymentStatus.PENDING) },
    });
  }

  @Get('mobilebank/approved')
  async ApprovedmobilebankDeposit(): Promise<MobileBanking[]> {
    const status: PaymentStatus = PaymentStatus.APPROVED;
    return await this.MobileBankingRepository.find({
      where: { status: Equal(PaymentStatus.APPROVED) },
    });
  }

  @Get('mobilebank/reject')
  async rejectmobilebankDeposit(): Promise<MobileBanking[]> {
    const status: PaymentStatus = PaymentStatus.REJECTED;
    return await this.MobileBankingRepository.find({
      where: { status: Equal(PaymentStatus.REJECTED) },
    });
  }

  @Post(':uuid/bank/deposit')
  @UseInterceptors(FileInterceptor('Bankattachmenturl'))
  async addBankDeposit(
    @UploadedFile()
    file: Express.Multer.File,
    @Param('uuid') uuid: string,
    Depositid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const Profile = await this.UserRepository.findOne({ where: { uuid } });
    if (!Profile) {
      throw new HttpException('Profile not found', HttpStatus.BAD_REQUEST);
    }
    const Bankattachmenturl = await this.s3service.Addimage(file);
    const Banktransfer = new BankTransfer();
    Banktransfer.Bankattachmenturl = Bankattachmenturl;
    Banktransfer.DepositFrom = req.body.DepositFrom;
    Banktransfer.DepositTo = req.body.DepositTo;
    Banktransfer.DepositType = req.body.DepositType;
    Banktransfer.ChequeDate = req.body.ChequeDate;
    Banktransfer.TransactionId = req.body.TransactionId;
    Banktransfer.ChequeNumber = req.body.ChequeNumber;
    Banktransfer.Amount = parseFloat(req.body.Amount);
    Profile.Wallet += Banktransfer.Amount;
    Banktransfer.userprofile = Profile;
    Banktransfer.uuid = Profile.uuid;
    await this.BankTransferRepository.save({ ...Banktransfer });
    await this.UserRepository.save(Profile);
    await this.sendBankDepositDetails(uuid, Depositid);
    return res.status(HttpStatus.OK).send({
      status: 'success',
      message: ' Banktransfer Deposit Request Successfull',
    });
  }

  async sendBankDepositDetails(uuid: string, Depositid: string) {
    // Get tour package details
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
    const bank = await this.BankTransferRepository.findOne({
      where: { Depositid },
    });
    const user = await this.UserRepository.findOne({ where: { uuid } });
    const mailOptions = {
      from: 'flyfarladies@mailservice.center', // Replace with your email address
      to: user.Email, // Recipient's email address
      subject: 'Deposit Details',
      text: 'Please find the attached file.',
      html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Deposit Request</title>
          </head>
          <body>
            <div style="width: 700px; height: 110vh; margin: 0 auto">
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
                      Deposit Confirmation
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
                      ${bank.Amount}
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
                      ${bank.DepositType}
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
                      Transaction Details
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
                      Trasaction ID
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
                    ${bank.Depositid}
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
                      DepositFrom
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
                      ${bank.DepositFrom}
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
                    ChequeNumber
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
                    ${bank.ChequeNumber}
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
                    DepositTo
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
                    ${bank.DepositTo}
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
                      Transaction Date
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
                      ${bank.ChequeDate}
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
                      DepositType
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
                      ${bank.DepositType}
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
                    margin-top: 15px;
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
                        color: #767676;
                        font-family: sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 5px 20px;
                        width: 600;
                        font-style: italic;
                      "
                    >
                      Please Wait a little while. Your money will be added to your
                      wallet after verification is complete.
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
                      or Call us at +88 01755582111
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
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_facebook.png"
                        href="https://www.facebook.com/flyfarladies/?ref=page_internal"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_linkedIn.png"
                        href="https://www.linkedin.com/company/fly-far-ladies/"
                        alt=""
                      />
                      <img
                        style="padding-right: 5px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_whatsapp.png"
                        href="https://wa.me/+88 01755582111"
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
                      <img
                        width="100px"
                        src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_logo.png"
                        href="https://www.flyfarladies.com/"
                        alt=""
                      />
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </body>
        </html>
        `,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  }

  @Patch('Bank/:Depositid/approve')
  async ApproveBankDepo(
    @Param('Depositid') Depositid: string,
    @Body('uuid') uuid: string,
    @Body() body: { ActionBy: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const bank = await this.BankTransferRepository.findOne({
      where: { Depositid },
    });
    if (!bank) {
      throw new NotFoundException('Deposit not found');
    }
    if (bank.status !== PaymentStatus.PENDING) {
      throw new NotFoundException(
        'Deposit request already approved or Rejected',
      );
    }
    const profile = await this.UserRepository.findOne({ where: { uuid } });
    if (!profile) {
      throw new NotFoundException('user not found');
    }
    bank.status = PaymentStatus.APPROVED;
    bank.ActionBy = `Approved By ${body.ActionBy}`;
    if (!body.ActionBy) {
      throw new NotFoundException('Action By');
    }
    await this.BankTransferRepository.save(bank);
    profile.Wallet += bank.Amount;
    await this.UserRepository.save(profile);
    await this.sendbankDepositConfirmationToUser(uuid, Depositid);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: ' Deposit Request approved' });
  }

  async sendbankDepositConfirmationToUser(uuid: string, Depositid: string) {
    // Get tour package details
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
    const bank = await this.BankTransferRepository.findOne({
      where: { Depositid },
    });
    const user = await this.UserRepository.findOne({ where: { uuid } });
    // Compose the email message
    const mailOptions = {
      from: 'flyfarladies@mailservice.center', // Replace with your email address
      to: user.Email, // Recipient's email address
      subject: 'Deposit Approved',
      text: 'Please find the attached file.',
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Deposit Request</title>
        </head>
        <body>
          <div style="width: 700px; height: 110vh; margin: 0 auto">
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
                    Deposit Approved
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
                    ${bank.Amount}
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
                    ${bank.DepositType}
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
                    Transaction Details
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
                    Trasaction ID
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
                  ${bank.Depositid}
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
                    DepositFrom
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
                    ${bank.DepositFrom}
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
                  ChequeNumber
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
                  ${bank.ChequeNumber}
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
                  DepositTo
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
                  ${bank.DepositTo}
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
                    Transaction Date
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
                    ${bank.ChequeDate}
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
                    DepositType
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
                    ${bank.DepositType}
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
                  margin-top: 15px;
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
                      color: #767676;
                      font-family: sans-serif;
                      font-size: 14px;
                      font-weight: 500;
                      line-height: 38px;
                      padding: 5px 20px;
                      width: 600;
                      font-style: italic;
                    "
                  >
                    Please Wait a little while. Your money will be added to your
                    wallet after verification is complete.
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
                    or Call us at +88 01755582111
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
                      src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_facebook.png"
                      href="https://www.facebook.com/flyfarladies/?ref=page_internal"
                      alt=""
                    />
                    <img
                      style="padding-right: 5px"
                      src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_linkedIn.png"
                      href="https://www.linkedin.com/company/fly-far-ladies/"
                      alt=""
                    />
                    <img
                      style="padding-right: 5px"
                      src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_whatsapp.png"
                      href="https://wa.me/+88 01755582111"
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
                    <img
                      width="100px"
                      src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_logo.png"
                      href="https://www.flyfarladies.com/"
                      alt=""
                    />
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </body>
      </html>
      `,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  }

  @Patch('Bank/:Depositid/reject')
  async RejectbankDeposit(
    @Param('Depositid') Depositid: string,
    uuid: string,
    @Body() body: { ActionBy: string; rejectionReason: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const bank = await this.BankTransferRepository.findOne({
      where: { Depositid },
    });
    if (!bank) {
      throw new NotFoundException('Deposit not found');
    }
    if (bank.status !== PaymentStatus.PENDING) {
      throw new NotFoundException(
        'Deposit request already rejected or approved',
      );
    }
    bank.status = PaymentStatus.REJECTED;
    bank.ActionBy = `Approved By ${body.ActionBy}`;
    if (!body.ActionBy) {
      throw new NotFoundException('Action By?');
    }
    bank.rejectionReason = `Rejected due to ${body.rejectionReason}`;
    if (!body.rejectionReason) {
      throw new NotFoundException(' please add reason');
    }
    await this.BankTransferRepository.save(bank);
    await this.sendBankDepositrejectionToUser(uuid, Depositid);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: ' Deposit Request Rejected' });
  }

  async sendBankDepositrejectionToUser(uuid: string, Depositid: string) {
    // Get tour package details
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
    const bank = await this.BankTransferRepository.findOne({
      where: { Depositid },
    });
    const user = await this.UserRepository.findOne({ where: { uuid } });
    // Compose the email message
    const mailOptions = {
      from: 'flyfarladies@mailservice.center', // Replace with your email address
      to: user.Email, // Recipient's email address
      subject: 'Deposit Rejection',
      text: 'Please find the attached file.',
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Deposit Request</title>
        </head>
        <body>
          <div style="width: 700px; height: 110vh; margin: 0 auto">
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
                    Deposit Reject
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
                    ${bank.Amount}
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
                    ${bank.DepositType}
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
                    Transaction Details
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
                    Trasaction ID
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
                  ${bank.Depositid}
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
                    DepositFrom
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
                    ${bank.DepositFrom}
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
                  ChequeNumber
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
                  ${bank.ChequeNumber}
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
                  DepositTo
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
                  ${bank.DepositTo}
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
                    Transaction Date
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
                    ${bank.ChequeDate}
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
                    DepositType
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
                    ${bank.DepositType}
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
                  
                Reason
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
                  ${bank.rejectionReason}
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
                  margin-top: 15px;
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
                      color: #767676;
                      font-family: sans-serif;
                      font-size: 14px;
                      font-weight: 500;
                      line-height: 38px;
                      padding: 5px 20px;
                      width: 600;
                      font-style: italic;
                    "
                  >
                    Please Wait a little while. Your money will be added to your
                    wallet after verification is complete.
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
                    or Call us at +88 01755582111
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
                      src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_facebook.png"
                      href="https://www.facebook.com/flyfarladies/?ref=page_internal"
                      alt=""
                    />
                    <img
                      style="padding-right: 5px"
                      src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_linkedIn.png"
                      href="https://www.linkedin.com/company/fly-far-ladies/"
                      alt=""
                    />
                    <img
                      style="padding-right: 5px"
                      src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_whatsapp.png"
                      href="https://wa.me/+88 01755582111"
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
                    <img
                      width="100px"
                      src="https://ladiescdn.sgp1.cdn.digitaloceanspaces.com/ffl_logo.png"
                      href="https://www.flyfarladies.com/"
                      alt=""
                    />
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </body>
      </html>
      `,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  }

  @Get('bank/pending')
  async PendingBankDeposit(): Promise<BankTransfer[]> {
    const status: PaymentStatus = PaymentStatus.PENDING;
    return await this.BankTransferRepository.find({
      where: { status: Equal(PaymentStatus.PENDING) },
    });
  }

  @Get('bank/approved')
  async ApprovebankDeposit(): Promise<BankTransfer[]> {
    const status: PaymentStatus = PaymentStatus.APPROVED;
    return await this.BankTransferRepository.find({
      where: { status: Equal(PaymentStatus.APPROVED) },
    });
  }

  @Get('bank/reject')
  async rejectbankDeposit(): Promise<BankTransfer[]> {
    const status: PaymentStatus = PaymentStatus.REJECTED;
    return await this.BankTransferRepository.find({
      where: { status: Equal(PaymentStatus.REJECTED) },
    });
  }
}