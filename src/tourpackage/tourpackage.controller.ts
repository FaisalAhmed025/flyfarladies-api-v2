import { VisitedPlace } from 'src/tourpackage/entities/visitedplace.entity';
import { AlbumImage } from 'src/tourpackage/entities/albumimage.entity';

import { CreateInstallmentDto } from './dto/create-installment.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, ParseFilePipeBuilder, HttpStatus, Req, Res, ParseFilePipe, FileTypeValidator, HttpException, Logger, UploadedFile, Query, Put } from '@nestjs/common';
import { TourpackageService } from './tourpackage.service';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { Tourpackage } from './entities/tourpackage.entity';
import { Repository } from 'typeorm';
import { CreateBookingPolicyDto } from './dto/creat-bookingpolicy.dto';
import { updateBookingPolicyDto } from './dto/update-bookingpolicy.dto';
import { createRefundPolicyDto } from './dto/create-refundpolicy.dto';
import { UpdateRefundPolicy } from './dto/update-refundpolicy.dto';
import { createpackageincluionDto } from './dto/create-packageInclusion.dto';
import { updatepackageInclusionDto } from './dto/update-packageincluion.dto';
import { CreateTourPackagePlanDto } from './dto/create-packagetourplan.dto';
import { updateTourPackagePlanDto } from './dto/update-tourpackageplan.dto';
import { CreatepackageExclsuionsDto } from './dto/create-packageexclusions.dto';
import { updatepackageExclusionsDto } from './dto/update-packageexclsuions.dto';
import { CreatePackageHighlightDto } from './dto/create-packagehighlights.dto';
import { UpdatepackageHighlightDto } from './dto/update-packagehighlightdto';
import { MainImage } from './entities/mainimage.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { updateinstallmentdto } from './dto/update-installmentDto';
import { Installment } from './entities/installment.entity';
import { refundpolicy } from './entities/refundpolicy.entity';
import { bookingpolicy } from './entities/bookingpolicy.entity';
import { packagehighlight } from './entities/packagehighlight.entity';
import { packageexcluions } from './entities/packageexclsuions.entity';
import { tourpackageplan } from './entities/tourpackageplan.entity';
import { Packageinclusion } from './entities/packageInclusion.entitry';
import { GCSStorageService } from 'src/s3/s3.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';


@ApiTags('Tour Package Module')
@Controller('tourpackage')
export class TourpackageController {
  constructor(
    @InjectRepository(Tourpackage)
    private TourpackageRepo: Repository<Tourpackage>,
    @InjectRepository(MainImage) private MainImageRepo: Repository<MainImage>,
    @InjectRepository(AlbumImage)
    private AlbumimageRepo: Repository<AlbumImage>,
    @InjectRepository(Packageinclusion)
    private packageInclusionRepo: Repository<Packageinclusion>,
    @InjectRepository(tourpackageplan)
    private tourpackagePlanRepo: Repository<tourpackageplan>,
    @InjectRepository(packageexcluions)
    private packageexcluionsRepo: Repository<packageexcluions>,
    @InjectRepository(packagehighlight)
    private packageHighlightRepo: Repository<packagehighlight>,
    @InjectRepository(bookingpolicy)
    private bookingPolicyRepo: Repository<bookingpolicy>,
    @InjectRepository(refundpolicy)
    private refundPolicyRepo: Repository<refundpolicy>,
    @InjectRepository(Installment)
    private InstallmentRepo: Repository<Installment>,

    @InjectRepository(VisitedPlace)
    private visitedImageRepo: Repository<VisitedPlace>,
    private readonly tourpackageService: TourpackageService,
    private s3service: GCSStorageService,
  ) {}


  @ApiTags('Tourpackage')
  @Post('Addpackage')
  @UseInterceptors(FileInterceptor('coverimageurl'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { 
        MainTitle: { type: 'string' },
        SubTitle: { type: 'string' },
        Price: { type: 'number' },
        City: { type: 'string' },
        Discount: { type: 'number' },
        Location: { type: 'string' },
        Availability: { type: 'number' },
        StartDate: { type: 'date' },
        EndDate: { type: 'date' },
        TripType: { type: 'string' },
        TotalDuration: { type: 'number' },
        PackageOverview: { type: 'string' },
        Showpackage: { type: 'bool' },
        Flight: { type: 'bool' },
        Transport: { type: 'bool' },
        Food: { type: 'bool' },
        Hotel: { type: 'bool' },
        Country: { type: 'string' },
        AvailableSeats: { type: 'string' },
        MinimumAge: { type: 'number' },
        MaximumAge: { type: 'number' },
        coverimageurl: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async AddTravelPackage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() body,
    @Res() res: Response,
  ) {
    const {
      MainTitle,
      SubTitle,
      Price,
      City,
      Discount,
      Location,
      Availability,
      StartDate,
      EndDate,
      TripType,
      TotalDuration,
      PackageOverview,
      Showpackage,
      Flight,
      Transport,
      Food,
      Hotel,
      Country,
      AvailableSeats,
      MinimumAge,
      MaximumAge,
    } = req.body;
    const coverimageurl = await this.s3service.Addimage(file);
    const tourpackage = new Tourpackage();
    tourpackage.coverimageurl = coverimageurl;
    tourpackage.MainTitle = MainTitle;
    tourpackage.SubTitle = SubTitle;
    tourpackage.Price = Price;
    tourpackage.City = City;
    tourpackage.Discount = Discount;
    tourpackage.Location = Location;
    tourpackage.Availability = Availability;
    tourpackage.StartDate = StartDate;
    tourpackage.EndDate = EndDate;
    tourpackage.TripType = TripType;
    tourpackage.TotalDuration = TotalDuration;
    tourpackage.AvailableSeats = AvailableSeats;
    tourpackage.MinimumAge = MinimumAge;
    tourpackage.MaximumAge = MaximumAge;
    tourpackage.PackageOverview = PackageOverview;
    tourpackage.Showpackage = Showpackage;
    tourpackage.Flight = Flight;
    tourpackage.Transport = Transport;
    tourpackage.Food = Food;
    tourpackage.Hotel = Hotel;
    tourpackage.Country = Country;
    await this.TourpackageRepo.save(tourpackage);
    return res
      .status(HttpStatus.OK)
      .send({
        status: 'success',
        message: 'Travel package added successfully',
        Id: tourpackage.Id,
      });
  }



@Post(':Id') // Change the HTTP method to POST and add 'update' in the route
@UseInterceptors(FileFieldsInterceptor([
  { name: 'coverimageurl', maxCount: 2 }
]))
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: { 
      MainTitle: { type: 'string' },
      SubTitle: { type: 'string' },
      Price: { type: 'number' },
      City: { type: 'string' },
      Discount: { type: 'number' },
      Location: { type: 'string' },
      Availability: { type: 'bool' },
      StartDate: { type: 'date' },
      EndDate: { type: 'date' },
      TripType: { type: 'string' },
      TotalDuration: { type: 'number' },
      PackageOverview: { type: 'string' },
      Showpackage: { type: 'bool' },
      Flight: { type: 'bool' },
      Transport: { type: 'bool' },
      Food: { type: 'bool' },
      Hotel: { type: 'bool' },
      Country: { type: 'string' },
      AvailableSeats: { type: 'string' },
      MinimumAge: { type: 'number' },
      MaximumAge: { type: 'number' },
      coverimageurl: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
async updateTravelPackage(
  @UploadedFiles()
  file: {
    coverimageurl?: Express.Multer.File[]
  },
  @Req() req: Request,
  @Body() body,
  @Param('Id') Id: string,
  @Res() res: Response,
) {
  const {
    MainTitle,
    SubTitle,
    Price,
    City,
    Discount,
    Location,
    Availability,
    StartDate,
    EndDate,
    TripType,
    TotalDuration,
    PackageOverview,
    Showpackage,
    Flight,
    Transport,
    Food,
    Hotel,
    Country,
    AvailableSeats,
    MinimumAge,
    MaximumAge,
  } = req.body;
  let coverimageurl = null;
  if (file.coverimageurl && file.coverimageurl.length > 0) {
    coverimageurl = await this.s3service.Addimage(file.coverimageurl[0]);
  }
  const tourpackage = await this.TourpackageRepo.findOne({ where: { Id } });
  if (!tourpackage) {
    return res.status(HttpStatus.NOT_FOUND).send({
      status: 'error',
      message: 'Travel package not found',
    });
  }
  tourpackage.coverimageurl = coverimageurl;
  tourpackage.MainTitle = MainTitle;
  tourpackage.SubTitle = SubTitle;
  tourpackage.Price = Price;
  tourpackage.City = City;
  tourpackage.Discount = Discount;
  tourpackage.Location = Location;
  tourpackage.Availability = Availability;
  tourpackage.StartDate = StartDate;
  tourpackage.EndDate = EndDate;
  tourpackage.TripType = TripType;
  tourpackage.TotalDuration = TotalDuration;
  tourpackage.AvailableSeats = AvailableSeats;
  tourpackage.MinimumAge = MinimumAge;
  tourpackage.MaximumAge = MaximumAge;
  tourpackage.PackageOverview = PackageOverview;
  tourpackage.Showpackage = Showpackage;
  tourpackage.Flight = Flight;
  tourpackage.Transport = Transport;
  tourpackage.Food = Food;
  tourpackage.Hotel = Hotel;
  tourpackage.Country = Country;
  await this.TourpackageRepo.save(tourpackage); // Use save() instead of update()
  return res.status(HttpStatus.OK).send({
    status: 'success',
    message: 'Travel package has been updated successfully',
  });
}


  async AddNewInstallment(
    Id: string,
    CreateInstallmentDto: CreateInstallmentDto[],
  ) {
    const tourpackage = await this.TourpackageRepo.findOneBy({ Id });
    if (!tourpackage) {
      throw new HttpException('TourPackage not found', HttpStatus.BAD_REQUEST);
    }
    const createinstallment: Installment[] = [];
    for (const createinstallmentdto of CreateInstallmentDto) {
      const installment = await this.InstallmentRepo.create({
        ...createinstallmentdto,
        tourpackage,
      });
      const createdinstallment = await this.InstallmentRepo.save(installment);
      createinstallment.push(createdinstallment);
    }
    return createinstallment;
  }

  @Get('AllPackage')
  async findAll(@Res() res: Response) {
    const allTourPackages = await this.tourpackageService.FindAllPackages(); // Use camelCase for variable names
    return res.status(HttpStatus.OK).json({ allTourPackages }); // Use camelCase for variable names
  }

  @Get(':Id')
  async findOne(@Param('Id') Id: string) {
    const getTourPackage = await this.tourpackageService.findOne(Id); // Use camelCase for variable names
    if (!getTourPackage) {
      throw new HttpException(
        `TourPackage not found with this id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return getTourPackage;
  }

  @Get('/location/:tripType/:StartDate')
  async findOneByTripType(
    @Param('tripType') tripType: string,
    @Param('StartDate') StartDate: string,
  ): Promise<{ City: string; Country: string }[]> {
    return this.tourpackageService.getCityByTripType(tripType, StartDate); // Use camelCase for variable names
  }

  @Get('/')
  async getTourPackages(
    @Query('TripType') TripType: string,
    @Query('City') City: string,
    @Query('StartDate') StartDate: string,
    @Query('Country') Country: string,
  ): Promise<Tourpackage[]> {
    return this.tourpackageService.GetTourpackageByDiffirentfield(
      TripType,
      City,
      StartDate,
      Country,
    ); // Use camelCase for variable names
  }

  @Patch('updateimage/:Id')
  @UseInterceptors(FileInterceptor('coverimageurl'))
  async updateImageUrl(
    @UploadedFile() file: Express.Multer.File,
    @Param('Id') Id: string,
    @Body() bodyParser,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const imageUrl = await this.s3service.updateImage(Id, file);
    const tourPackage = new Tourpackage();
    tourPackage.coverimageurl = imageUrl;
    await this.TourpackageRepo.update({ Id }, { ...tourPackage }); // Use object destructuring
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Cover image has been updated successfully',
    });
  }

  @Post(':Id/addinstallment')
  async createInstallment(
    @Param('Id') Id: string,
    @Res() res: Response,
    @Body() installmentDto: CreateInstallmentDto[],
  ) {
    await this.tourpackageService.AddInstallment(Id, installmentDto);
    return res
      .status(HttpStatus.OK)
      .send({
        status: 'success',
        message: 'Travel package installment added succesfully',
      });
  }

  @Get(':Id/getinstallment/:InstallmentId')
  async GetInstallment(
    @Param('Id') Id: string,
    @Param('InstallmentId') InstallmentId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const installment = await this.tourpackageService.FindInstallment(
      Id,
      InstallmentId,
    );
    return res.status(HttpStatus.OK).json({
      status: 'success',
      installment,
    });
  }

  @Patch(':Id/updateInstallments')
async updateInstallments(
  @Param('Id') Id: string,
  @Body() installments: updateinstallmentdto[],
  @Res() res: Response,
): Promise<any> {
  try {
    await this.tourpackageService.updateInstallment(Id, installments);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Installments updated successfully',
    });
  } catch (error) {
    return res.status(HttpStatus.NOT_FOUND).json({
      status: 'error',
      message: error.message,
    });
  }
}

@Patch(':Id/updaterefundpolicy')
async updateRefundpolicy(
  @Param('Id') Id: string,
  @Body() refundpolicy: UpdateRefundPolicy[],
  @Res() res: Response,
): Promise<any> {
  try {
    await this.tourpackageService.updateRefundpolicy(Id, refundpolicy);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Refundpolicy updated successfully',
    });
  } catch (error) {
    return res.status(HttpStatus.NOT_FOUND).json({
      status: 'error',
      message: error.message,
    });
  }
}


@Patch(':Id/updatetourpackageplan')
async updatetourpackageplan(
  @Param('Id') Id: string,
  @Body() tourpackageplan: updateTourPackagePlanDto[],
  @Res() res: Response,
): Promise<any> {
  try {
    await this.tourpackageService.updatetourpackageplan(Id, tourpackageplan);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'tourpackage plan updated successfully',
    });
  } catch (error) {
    return res.status(HttpStatus.NOT_FOUND).json({
      status: 'error',
      message: error.message,
    });
  }
}



@Patch(':Id/updateinclusions')
async updatetourpackageinclusions(
  @Param('Id') Id: string,
  @Body() packageinclsuins: updatepackageInclusionDto[],
  @Res() res: Response,
): Promise<any> {
  try {
    await this.tourpackageService.updatetpackageinclsuions(Id, packageinclsuins);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'packageinclusions updated successfully',
    });
  } catch (error) {
    return res.status(HttpStatus.NOT_FOUND).json({
      status: 'error',
      message: error.message,
    });
  }
}

@Patch(':Id/updateExclusions')
async updatetourpackageExclsuions(
  @Param('Id') Id: string,
  @Body() packageexclsuins: updatepackageExclusionsDto[],
  @Res() res: Response,
): Promise<any> {
  try {
    await this.tourpackageService.updatetpackageExclusions(Id, packageexclsuins);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'package Exclusions updated successfully',
    });
  } catch (error) {
    return res.status(HttpStatus.NOT_FOUND).json({
      status: 'error',
      message: error.message,
    });
  }
}



@Patch(':Id/updatehighlight')
async updatetourpackagehighlight(
  @Param('Id') Id: string,
  @Body() highlightdto: UpdatepackageHighlightDto[],
  @Res() res: Response,
): Promise<any> {
  try {
    await this.tourpackageService.updatetpackageHighlights(Id, highlightdto);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'package highlight updated successfully',
    });
  } catch (error) {
    return res.status(HttpStatus.NOT_FOUND).json({
      status: 'error',
      message: error.message,
    });
  }
}

//   @Patch('updateinstallments')
// async updateInstallments(
//   @Body() installments: updateinstallmentdto[],
//   @Res() res: Response,
// ): Promise<any> {
//   await this.tourpackageService.updateInstallment(installments);
//   return res.status(HttpStatus.OK).json({
//     status: 'success',
//     message: 'Installments updated successfully',
//   });
// }

  // // update booking policy
  // @Patch(':Id/updateinstallment/:InstallmentId')
  // async updateInstallment(
  //   @Param('Id') Id: string,
  //   @Param('InstallmentId') InstallmentId: number,
  //   @Body() updateinstall: updateinstallmentdto,
  //   @Req() req: Request,
  //   @Res() res: Response,
  // ) {
  //   await this.tourpackageService.updateInstallment(
  //     Id,
  //     InstallmentId,
  //     updateinstall,
  //   );
  //   return res.status(HttpStatus.OK).json({
  //     status: 'success',
  //     message: `installment updated successfully`,
  //   });
  // }

  @Delete(':Id/Installment/:InstallmentId')
  async DeleteInstallment(
    @Param('Id') Id: string,
    @Param('InstallmentId') InstallmentId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.tourpackageService.DeleteInstallment(Id, InstallmentId);
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: `Installment has deleted successfully`,
    });
  }

  @Delete(':Id')
  async remove(
    @Param('Id') Id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.tourpackageService.remove(Id);
    return res
      .status(HttpStatus.OK)
      .send({
        status: 'success',
        message: 'Travel package deleted succesfully',
      });
  }

  //add main image
  @Post(':Id/AddmainImage')
  @UseInterceptors(FilesInterceptor('MainImageUrl', 20))
  async AddmainImages(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Param('Id') Id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body,
  ) {
    const tourpackage = await this.TourpackageRepo.findOneBy({ Id });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cann't add main image",
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const file of files) {
      const coverimageurl = await this.s3service.Addimage(file);
      const mainimage = new MainImage();
      mainimage.MainImageUrl = coverimageurl;
      mainimage.MainImageTitle = req.body.MainImageTitle;
      await this.MainImageRepo.save({ ...mainimage, tourpackage });
    }
    return res.status(HttpStatus.OK).send({
      status: 'success',
      message: 'main Image Added Successfully',
    });
  }

  // add booking policy
  @Post(':Id/AddBookingPolicy')
  addTourPackageBookingPolicy(
    @Param('Id') Id: string,
    @Body() bookingpolicydto: CreateBookingPolicyDto[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.tourpackageService.createbookingPolicy(Id, bookingpolicydto);
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'booking policy added',
    });
  }

  @Get(':Id/getpolicy/:BkId')
  async getsingleBookingPolicy(
    @Param('Id') Id: string,
    @Param('BkId') BkId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const bookingpolicy = await this.tourpackageService.FindbookingPolicy(
      Id,
      BkId,
    );
    return res.status(HttpStatus.OK).json({
      status: 'success',
      bookingpolicy,
    });
  }
  @Patch(':Id/updatebookingpolicy')
  async updateBookingpolicy(
    @Param('Id') Id: string,
    @Body() bookingpolicy: updateBookingPolicyDto[],
    @Res() res: Response,
  ): Promise<any> {
    try {
      await this.tourpackageService.updateBookingpolicy(Id, bookingpolicy);
  
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Installments updated successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'error',
        message: error.message,
      });
    }
  }
  @Delete(':Id/deletepolicy/:BkId')
  async DeleteBookingPolicy(
    @Param('Id') Id: string,
    @Param('BkId') BkId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.tourpackageService.DeletebookingPolicy(Id, BkId);
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: `booking policy deleted successfully`,
    });
  }

  // booking policy end
  // refund policy start

  @Post(':Id/AddrefundPolicy')
  async addrefundPolicy(
    @Param('Id') Id: string,
    @Body() refundpolicydto: createRefundPolicyDto[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.tourpackageService.AddRefundPolicy(Id, refundpolicydto);
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'refund policy added',
    });
  }

  // get refund policy
  @Get(':Id/getrefundpolicy/:RId')
  async getsinglerefundPolicy(
    @Param('Id') Id: string,
    @Param('RId') RId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const refundpolicy = await this.tourpackageService.FindRefundPolicy(
      Id,
      RId,
    );
    return res.status(HttpStatus.OK).json({ refundpolicy });
  }

  // update refund policy

  // delete refund policy
  @Delete(':Id/deleteRefundpolicy/:RId')
  async DeleteRefundPolicy(
    @Param('Id') Id: string,
    @Param('RId') RId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.tourpackageService.DeleterefundPolicy(Id, RId);
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: `refund policy Id=${RId} has deleted successfully`,
    });
  }
  // refund policy End

  // Inclusions  start

  // add inclsuions
  @Post(':Id/AddPackageInclusions')
  async addInclusion(
    @Param('Id') Id: string,
    @Body() Inclusionsdto: createpackageincluionDto[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.tourpackageService.AddInclusions(Id, Inclusionsdto);
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'travel package Inlclusions Iteam Added',
    });
  }

  // get Singel Inclsuions

  @Get(':Id/getinclsuions/:InId')
  async getsingleInclsuions(
    @Param('Id') Id: string,
    @Param('InId') InId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const inclsuions = await this.tourpackageService.FindInclsuions(Id, InId);
    return res.status(HttpStatus.OK).json({
      inclsuions,
    });
  }

  // update refund policy
  @Patch(':Id/updateInclsuions/:InId')
  async updateInclsuions(
    @Param('Id') Id: string,
    @Param('InId') InId: number,
    @Body() updateInclusionsDto: updatepackageInclusionDto,
    req: Request,
    @Res() res: Response,
  ) {
    const updateInclsuions = await this.tourpackageService.updateInclusions(
      Id,
      InId,
      updateInclusionsDto,
    );
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: `Inclsuions with Id=${InId} has updated successfully`,
      updateInclsuions,
    });
  }

  // delete Inclsuions
  @Delete(':Id/deleteinclusions/:InId')
  async DeleteExcluions(
    @Param('Id') Id: string,
    @Param('InId') InId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.tourpackageService.DeleteInclusion(Id, InId);
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: `Inclusion has deleted successfully`,
    });
  }

  //End refund policy

  @Get(':Id/FindAlbum/:AlbumTitle')
  async getAllBumImage(
    @Param('Id') Id: string,
    @Param('AlbumTitle') AlbumTitle: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const Albumimages = await this.tourpackageService.FindAlbum(Id, AlbumTitle);
    return res.status(HttpStatus.OK).json({
      Albumimages,
    });
  }

  // @Patch(':Id/albumimage/:AlbumId')
  // @UseInterceptors(FilesInterceptor('albumImageUrl', 20))
  // async updateAlbumImageUrl(
  //   @UploadedFiles()
  //   files: Express.Multer.File[],
  //   @Param('Id') Id: string,
  //   @Param('AlbumId') AlbumId: number,
  //   @Body() bodyParser,
  //   @Req() req: Request,
  //   @Res() res: Response,
  // ) {
  //   for (const file of files) {
  //     const albumImageUrl = await this.s3service.updateAlbumImage(
  //       Id,
  //       AlbumId,
  //       file,
  //     );
  //     const albumImage = new AlbumImage();
  //     albumImage.albumImageUrl = albumImageUrl;
  //     // this is necessary when only one object is passed
  //     // await this.TourpackageRepo.update(Id,tourpackage)
  //     //for multiple object but both will work
  //     await this.AlbumimageRepo.update(AlbumId, albumImage);
  //   }

  //   return res.status(HttpStatus.OK).json({
  //     status: 'success',
  //     message: `Album Image has updated successfully`,
  //   });
  // }



  @Post(':Id/UpdatealbumImage')
  @UseInterceptors(FilesInterceptor('albumImageUrl', 20))
  async updateAlbumImage(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('Id') Id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tourpackage = await this.TourpackageRepo.findOne({ where: { Id }, relations: ['albumImages'] });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cannot update album image",
        HttpStatus.BAD_REQUEST,
      );
    }
  
    // Delete existing album images (if needed)
    await this.AlbumimageRepo.delete({ tourpackage: { Id } });
  
    const albumImages: AlbumImage[] = [];
  
    for (const file of files) {
      const albumImageUrl = await this.s3service.Addimage(file);
      const newAlbumImage = new AlbumImage();
      newAlbumImage.albumImageUrl = albumImageUrl;
      newAlbumImage.AlbumTitle = req.body.AlbumTitle;
      newAlbumImage.tourpackage = tourpackage;
      albumImages.push(newAlbumImage);
    }
  
    // Save all new album images at once
    await this.AlbumimageRepo.save(albumImages);
  
    return res.status(HttpStatus.OK).send({
      status: 'success',
      message: 'Album Images Updated Successfully',
    });
  }


  
  @Post(':Id/Updatemainimage')
  @UseInterceptors(FilesInterceptor('MainImageUrl', 20))
  async updatemainimage(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('Id') Id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tourpackage = await this.TourpackageRepo.findOne({ where: { Id }, relations: ['mainimage'] });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cannot update main image",
        HttpStatus.BAD_REQUEST,
      );
    }
  
    // Delete existing album images (if needed)
    await this.MainImageRepo.delete({ tourpackage: { Id } });
    const albumImages: MainImage[] = [];
    for (const file of files) {
      const mainimageurl = await this.s3service.Addimage(file);
      const newAlbumImage = new MainImage();
      newAlbumImage.MainImageUrl = mainimageurl;
      newAlbumImage.MainImageTitle = req.body.AlbumTitle;
      newAlbumImage.tourpackage = tourpackage;
      albumImages.push(newAlbumImage);
    }
  
    // Save all new album images at once
    await this.MainImageRepo.save(albumImages);
  
    return res.status(HttpStatus.OK).send({
      status: 'success',
      message: 'main image Updated Successfully',
    });
  }


  @Post(':Id/Updatevisitedimage')
  @UseInterceptors(FilesInterceptor('VisitedImagePath', 20))
  async updatevisited(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('Id') Id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tourpackage = await this.TourpackageRepo.findOne({ where: { Id }, relations: ['vistitedImages'] });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cannot update image",
        HttpStatus.BAD_REQUEST,
      );
    }
  
    await this.visitedImageRepo.delete({ tourpackage: { Id } });
    const updatedvisitedimage: VisitedPlace[] = [];
    for (const file of files) {
      const url = await this.s3service.Addimage(file);
      const viistedimage = new VisitedPlace()
      viistedimage.VisitedImagePath =url
      updatedvisitedimage.push(viistedimage);
    }
    await this.visitedImageRepo.save(updatedvisitedimage);
  
    return res.status(HttpStatus.OK).send({
      status: 'success',
      message: 'vistedimage Updated Successfully',
    });
  }
  
  


  @Patch(':Id/mainimage/:mainimgId')
  @UseInterceptors(FilesInterceptor('MainImageUrl', 20))
  async updateMainImageUrl(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Param('Id') Id: string,
    @Param('mainimgId') mainimgId: number,
    @Body() bodyParser,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    for (const file of files) {
      const mainImageUrl = await this.s3service.updateAlbumImage(
        Id,
        mainimgId,
        file,
      );
      const mainImage = new MainImage();
      mainImage.MainImageUrl = mainImageUrl;
      // this is necessary when only one object is passed
      // await this.TourpackageRepo.update(Id,tourpackage)
      //for multiple object but both will work
      await this.MainImageRepo.update(mainimgId, mainImage);
    }

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: `mainImage has updated successfully`,
    });
  }



  @Get(':Id/allalbumimage')
  async getAllAlbumImage(
    @Param('Id') Id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const AllAlbumimages = await this.tourpackageService.FindAllAlbum(Id);
    return res.status(HttpStatus.OK).json({
      AllAlbumimages,
    });
  }

  @Get(':Id/Allmainimage')
  async getAllmainImage(
    @Param('Id') Id: string,

    @Req() req: Request,
    @Res() res: Response,
  ) {
    const AllMainImage = await this.tourpackageService.AllMainImage(Id);
    return res.status(HttpStatus.OK).json({
      AllMainImage,
    });
  }

  @Post(':Id/AddalbumImage')
  @UseInterceptors(FilesInterceptor('albumImageUrl', 20))
  async AddalbumImages(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Param('Id') Id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body,
  ) {
    const tourpackage = await this.TourpackageRepo.findOneBy({ Id });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cann't add cover image",
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const file of files) {
      const albumImageUrl = await this.s3service.Addimage(file);
      const newalbum = new AlbumImage();
      newalbum.albumImageUrl = albumImageUrl;
      newalbum.AlbumTitle = req.body.AlbumTitle;
      await this.AlbumimageRepo.save({ ...newalbum, tourpackage });
    }
    return res.status(HttpStatus.OK).send({
      status: 'success',
      message: 'album Image Added Successfully',
    });
  }

  @Post(':Id/AddvistitedImages')
  @UseInterceptors(FilesInterceptor('VisitedImagePath', 20))
  async AddvistitedImages(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Param('Id') Id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body,
  ) {
    const tourpackage = await this.TourpackageRepo.findOneBy({ Id });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cann't add cover image",
        HttpStatus.BAD_REQUEST,
      );
    }
    for (const file of files) {
      const VisitedImagePath = await this.s3service.Addimage(file);
      const newalbum = new VisitedPlace();
      newalbum.VisitedImagePath = VisitedImagePath;
      await this.visitedImageRepo.save({ ...newalbum, tourpackage });
    }
    return res
      .status(HttpStatus.OK)
      .send({
        status: 'success',
        message: 'visited Image Added Successfully',
        Tourpackage,
      });
  }

  @Get(':Id/visitedImage/getAllvisitedImage')
  async getAllvisitedImage(
    @Param('Id') Id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const visitedImage = await this.tourpackageService.FindAllvisitedImage(Id);
    return res.status(HttpStatus.OK).json({
      visitedImage,
    });
  }

  /// add tour package

  @Post(':Id/AddTourPackagePlan')
  async addTourPackagePlan(
    @Param('Id') Id: string,
    @Body() tourpackagePlandto: CreateTourPackagePlanDto[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.tourpackageService.AddTourpackagePlan(Id, tourpackagePlandto);
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'travel package plan added Iteam Added',
    });
  }

  @Get(':Id/tourplan/:dayId')
  async getdayplan(
    @Param('Id') Id: string,
    @Param('dayId') dayId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tourplan = await this.tourpackageService.Finddayplan(Id, dayId);
    return res.status(HttpStatus.OK).json({ tourplan });
  }

  //update package exclsuions


  // delete excluions
  @Delete(':Id/deletedayplan/:dayId')
  async DeleteDay(
    @Param('Id') Id: string,
    @Param('dayId') dayId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.tourpackageService.Deleteayplan(Id, dayId);
    return res.status(HttpStatus.OK).json({
      message: `dayplan Id=${dayId} has deleted successfully`,
    });
  }

  /// addd package excluions
  @Post(':Id/AddTourPackageExclusions')
  async addTourPackageExclusions(
    @Param('Id') Id: string,
    @Body() packageexcluionsdto: CreatepackageExclsuionsDto[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const exclsuions = await this.tourpackageService.AddpackageExclsuions(
      Id,
      packageexcluionsdto,
    );
    return res.status(HttpStatus.OK).send({
      status: 'success',
      message: 'exlusions  Added Successfully',
    });
  }

  // get package exclsuions

  @Get(':Id/Exclsuions/:ExId')
  async getPackageExclsuions(
    @Param('Id') Id: string,
    @Param('ExId') ExId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const exclsuions = await this.tourpackageService.FindExclsuions(Id, ExId);
    return res.status(HttpStatus.OK).json({
      exclsuions,
    });
  }

  //update package exclsuions

  @Patch(':Id/updateExclsuions/:ExId')
  async updateExlsuions(
    @Param('Id') Id: string,
    @Param('ExId') ExId: number,
    @Body() updateExclusionsDto: updatepackageExclusionsDto,
    req: Request,
    @Res() res: Response,
  ) {
    const updateexlsuions = await this.tourpackageService.updateExclusions(
      Id,
      ExId,
      updateExclusionsDto,
    );
    return res.status(HttpStatus.OK).json({
      message: `Exclsuions with Id=${ExId} has updated successfully`,
      updateexlsuions,
    });
  }

  // delete excluions

  @Delete(':Id/deleteExclusions/:ExId')
  async DeleteIncluions(
    @Param('Id') Id: string,
    @Param('ExId') ExId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.tourpackageService.DeleteIExclusion(Id, ExId);
    return res.status(HttpStatus.OK).json({
      message: `Exclusion Id=${ExId} has deleted successfully`,
    });
  }
  // end exclusions....................

  // start package highlight............

  // add tour package highlight
  @Post(':Id/AddTourPackageHighlight')
  addTourPackageHighlight(
    @Param('Id') Id: string,
    @Body() packageHighlightdto: CreatePackageHighlightDto[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tourpackagehighlight = this.tourpackageService.AddPackageHighlight(
      Id,
      packageHighlightdto,
    );
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'travel package Highlight added',
    });
  }

  @Get(':Id/getHighlight/:HiId')
  async getPackageHighlight(
    @Param('Id') Id: string,
    @Param('HiId') HiId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const Highlight = await this.tourpackageService.FindHighlight(Id, HiId);
    return res.status(HttpStatus.OK).json({
      Highlight,
    });
  }

  //update package Highlight

  @Patch(':Id/updateHighlight/:HiId')
  async updateHiId(
    @Param('Id') Id: string,
    @Param('HiId') HiId: number,
    @Body() updatehighlightDto: UpdatepackageHighlightDto,
    req: Request,
    @Res() res: Response,
  ) {
    const updateHighlight = await this.tourpackageService.updateHighlight(
      Id,
      HiId,
      updatehighlightDto,
    );
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: `Highlight with Id ${HiId} has updated successfully`,
    });
  }

  // delete Highlight

  @Delete(':Id/DeleteHighlight/:HiId')
  async DeleteHighlight(
    @Param('Id') Id: string,
    @Param('HiId') HiId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.tourpackageService.DeleteHighlight(Id, HiId);
    return res.status(HttpStatus.OK).json({
      message: `Highlight Id ${HiId} has deleted successfully`,
    });
  }
}