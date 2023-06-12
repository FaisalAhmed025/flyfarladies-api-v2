
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookingPolicyDto } from './dto/creat-bookingpolicy.dto';
import { CreatepackageExclsuionsDto } from './dto/create-packageexclusions.dto';
import { CreatePackageHighlightDto } from './dto/create-packagehighlights.dto';
import { createpackageincluionDto } from './dto/create-packageInclusion.dto';
import { CreateTourPackagePlanDto } from './dto/create-packagetourplan.dto';
import { createRefundPolicyDto } from './dto/create-refundpolicy.dto';
import { updateBookingPolicyDto } from './dto/update-bookingpolicy.dto';
import { updatepackageExclusionsDto } from './dto/update-packageexclsuions.dto';
import { UpdatepackageHighlightDto } from './dto/update-packagehighlightdto';
import { updatepackageInclusionDto } from './dto/update-packageincluion.dto';
import { UpdateRefundPolicy } from './dto/update-refundpolicy.dto';
import { updateTourPackagePlanDto } from './dto/update-tourpackageplan.dto';
import { AlbumImage } from './entities/albumimage.entity';
import { bookingpolicy } from './entities/bookingpolicy.entity';
import { MainImage } from './entities/mainimage.entity';
import { packageexcluions } from './entities/packageexclsuions.entity';
import { packagehighlight } from './entities/packagehighlight.entity';
import { Packageinclusion } from './entities/packageInclusion.entitry';
import { refundpolicy } from './entities/refundpolicy.entity';
import { Tourpackage } from './entities/tourpackage.entity';
import { tourpackageplan } from './entities/tourpackageplan.entity';
import { VisitedPlace } from './entities/visitedplace.entity';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import { Installment } from './entities/installment.entity';
import { updateinstallmentdto } from './dto/update-installmentDto';

// tour package ser
@Injectable()
export class TourpackageService {
constructor(
@InjectRepository(Tourpackage)
private TourpackageRepo:Repository<Tourpackage>,
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
@InjectRepository(AlbumImage)
private AlbumImageRepo: Repository<AlbumImage>,
@InjectRepository(MainImage) private MainImageRepo: Repository<MainImage>,
@InjectRepository(VisitedPlace)
private visitedImageRepo: Repository<VisitedPlace>
){}

async findOne(Id: string) {
  const gettourpackage = await this.TourpackageRepo.findOne(
    { 
      where: { Id },
      relations: [] // remove all relations from initial query
    }
  );
  // lazy load all desired relations
  await Promise.all([
    gettourpackage.mainimage,
    gettourpackage.vistitedImages,
    gettourpackage.albumImages,
    gettourpackage.exclusions,
    gettourpackage.installments,
    gettourpackage.PackageInclusions,
    gettourpackage.BookingPolicys,
    gettourpackage.highlights,
    gettourpackage.tourpackageplans,
    gettourpackage.refundpolicys
  ]);

  return gettourpackage;
}

async FindAllPackages() {
  const packages = await this.TourpackageRepo
    .createQueryBuilder('tourpackage')
    .leftJoinAndSelect('tourpackage.albumImages', 'albumImages')
    .getMany();
    
    const promises = packages.flatMap(pack => [
      pack.installments,
      pack.vistitedImages,
      pack.tourpackageplans,
      pack.exclusions,
      pack.mainimage,
      pack.PackageInclusions,
      pack.BookingPolicys,
      pack.highlights,
      pack.refundpolicys,
    ].map(promise => Promise.resolve(promise)));
    
    await Promise.allSettled(promises);
  
  return packages;
}


  // async FindAllPackages() {
  //   const packages = await this.TourpackageRepo.find({ where:{}, relations: ['albumImages'] });
  //   await Promise.all(packages.map(async (pack) => {
  //     await Promise.all([
  //       pack.installments,
  //       pack.vistitedImages,
  //       pack.tourpackageplans,
  //       pack.exclusions,
  //       pack.mainimage,
  //       pack.PackageInclusions,
  //       pack.BookingPolicys,
  //       pack.highlights,
  //       pack.refundpolicys,
  //     ]);
  //   }));
  //   return packages;
  // }
  

  async GetTourpackageByDiffirentfield(TripType: string, City: string, StartDate: string, Country: string): Promise<Tourpackage[]> {
    const [month, year] = StartDate.split(" ");
    const startOfMonth = new Date(`${month} 1, ${year}`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
    const queryBuilder = this.TourpackageRepo.createQueryBuilder('tourPackage')
      .leftJoinAndSelect('tourPackage.mainimage', 'mainimage')
      .where('tourPackage.TripType = :TripType', { TripType })
      .andWhere('tourPackage.StartDate >= :startOfMonth', { startOfMonth })
      .andWhere('tourPackage.StartDate <= :endOfMonth', { endOfMonth });
    const conditions = [];
    if (City) {
      conditions.push(`tourPackage.City = :City`);
    }
    if (Country) {
      conditions.push(`tourPackage.Country = :Country`);
    }
    if (conditions.length > 0) {
      const whereClause = conditions.join(' OR ');
      queryBuilder.andWhere(whereClause, { City, Country });
    }
    
    const packages = await queryBuilder.getMany();
    for (const pack of packages) {
      await pack.albumImages;
      await pack.vistitedImages;
      await pack.tourpackageplans;
      await pack.exclusions;
      await pack.installments;
      await pack.PackageInclusions;
      await pack.BookingPolicys;
      await pack.highlights;
      await pack.refundpolicys;
    }
    return packages;
  }

  // async GetTourpackageByDiffirentfield(TripType: string, City: string, StartDate: string, Country: string): Promise<Tourpackage[]> {
  //   const startTime = new Date().getTime();
  //   const [month, year] = StartDate.split(" ");
  //   const startOfMonth = new Date(`${month} 1, ${year}`);
  //   const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
    
  //   const queryBuilder =await this.TourpackageRepo.createQueryBuilder('tourPackage')
  //     .leftJoinAndSelect('tourPackage.mainimage', 'mainimage')
  //     .leftJoinAndSelect('tourPackage.albumImages', 'albumImages')
  //     .leftJoinAndSelect('tourPackage.vistitedImages', 'vistitedImages')
  //     .leftJoinAndSelect('tourPackage.tourpackageplans', 'tourpackageplans')
  //     .leftJoinAndSelect('tourPackage.exclusions', 'exclusions')
  //     .leftJoinAndSelect('tourPackage.installments', 'installments')
  //     .leftJoinAndSelect('tourPackage.PackageInclusions', 'PackageInclusions')
  //     .leftJoinAndSelect('tourPackage.BookingPolicys', 'BookingPolicys')
  //     .leftJoinAndSelect('tourPackage.highlights', 'highlights')
  //     .leftJoinAndSelect('tourPackage.refundpolicys', 'refundpolicys')
  //     .where('tourPackage.TripType = :TripType', { TripType })
  //     .andWhere('tourPackage.StartDate >= :startOfMonth', { startOfMonth })
  //     .andWhere('tourPackage.StartDate <= :endOfMonth', { endOfMonth });
  
  //   if (City) {
  //     queryBuilder.andWhere('tourPackage.City = :City', { City });
  //   }
  
  //   if (Country) {
  //     queryBuilder.andWhere('tourPackage.Country = :Country', { Country });
  //   }
  //   const queryTime = new Date().getTime(); // record time taken by query building
  //   const queryEndTime = new Date().getTime(); // record time taken by query execution
  
  //   const totalTime = queryEndTime - startTime; // calculate total time taken
  //   const queryTimeTaken = queryEndTime - queryTime; // calculate time taken by query execution
  
  //   console.log(`Total time taken: ${totalTime} ms`);
  //   console.log(`Time taken by query execution: ${queryTimeTaken} ms`);
  //   const packages = await queryBuilder.getMany();
  //   return packages;
  // }
  
  


  async getCityByTripType(TripType: string, StartDate:string): Promise<{City:string, Country:string}[]> {
    const [month, year] = StartDate.split(" ")
    const startOfMonth = new Date(`${month} 1, ${year}`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
    const city = await this.TourpackageRepo
      .createQueryBuilder('tourpackage')
      .addSelect('tourpackage.City')
      .addSelect('tourpackage.Country', 'Country')
      .where('tourpackage.Triptype = :TripType',{ TripType })
      .andWhere('tourpackage.StartDate >= :startOfMonth', { startOfMonth })
      .andWhere('tourpackage.StartDate <= :endOfMonth', { endOfMonth })
      .groupBy('tourpackage.City')
      .groupBy('tourpackage.Country')    
      .getRawMany();
      return city.map(({ City, Country }) => ({ City, Country }));
  }


async  remove(Id: string) {
  const tourpackage=  this.TourpackageRepo.findOne({where:{Id}});
  if (!tourpackage) {
    throw new HttpException(
      `TourPackage not found with this Id=${Id}`,
      HttpStatus.BAD_REQUEST,
    );
  }
    return  this.TourpackageRepo.delete(Id);
  }

  // get all Album image
  async FindAlbum(Id: string, AlbumTitle:string) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const AlbumImage = await this.AlbumImageRepo.find({where:{AlbumTitle}})
    if (!AlbumImage) {
      throw new HttpException(
        `Image not found with `,
        HttpStatus.BAD_REQUEST,
      );
    }
    return AlbumImage;
  }

  async FindAllAlbum(Id: string) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const AllAlbumImage = await this.AlbumImageRepo.find({})
    if (!AllAlbumImage) {
      throw new HttpException(
        `Image not found with `,
        HttpStatus.BAD_REQUEST,
      );
    }
    return AllAlbumImage;
  }
  

  async AllMainImage(Id: string) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const MainImage = await this.MainImageRepo.find({})
    if (!MainImage) {
      throw new HttpException(
        `Image not found with `,
        HttpStatus.BAD_REQUEST,
      );
    }
    return MainImage;
  }


//visited image
  async FindAllvisitedImage(Id: string,) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const visitedImage = await this.visitedImageRepo.find({})
    if (!AlbumImage) {
      throw new HttpException(
        `Image not found with `,
        HttpStatus.BAD_REQUEST,
      );
    }
    return visitedImage;
  }



  // booking policy start.........................

  //add booking policy
  async createbookingPolicy(Id: string, CreateBookingPolicyDto:CreateBookingPolicyDto[]) {
    const tourpackage = await this.TourpackageRepo.findOneBy({ Id });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cann't add booking policy",
        HttpStatus.BAD_REQUEST,
      );
    }
    const createdPolicies: bookingpolicy[] = [];
    for(const CreatebookingPolicydto of CreateBookingPolicyDto){
      const creatpolicy = await this.bookingPolicyRepo.create({ ...CreatebookingPolicydto, tourpackage });
      const createdpolicy = await this.bookingPolicyRepo.save(creatpolicy)
      createdPolicies.push(createdpolicy);
    }
    return createdPolicies;
   

  }

  async AddInstallment(Id: string, CreateInstallmentDto:CreateInstallmentDto[]){
    const tourpackage = await this.TourpackageRepo.findOneBy({Id})
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found",
        HttpStatus.BAD_REQUEST,
      );
    }
    const createinstallment: Installment[] =[];
    for(const createinstallmentdto of CreateInstallmentDto){
    const installment = await this.InstallmentRepo.create({...createinstallmentdto,tourpackage})
    const createdinstallment =await this.InstallmentRepo.save(installment)
    createinstallment.push(createdinstallment);
    }
    return createinstallment
  
  }

  async FindInstallment(Id: string, InstallmentId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const installment = await this.InstallmentRepo.findOne({ where: { InstallmentId } })
    if (!installment) {
      throw new HttpException(
        `installment not found with this Id=${InstallmentId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return installment;
  }


  async updateInstallment(Id: string, InstallmentId: number, updateinstall: updateinstallmentdto) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const bookingpolicy = await this.InstallmentRepo.findOne({ where: { InstallmentId } })
    if (!bookingpolicy) {
      throw new HttpException(
        `installment not found with this Id=${InstallmentId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const updatepolicy = await this.InstallmentRepo.update({ InstallmentId }, { ...updateinstall })
    return updatepolicy;
  }


  async DeleteInstallment(Id: string, InstallmentId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const bookingpolicy = await this.InstallmentRepo.findOne({ where: { InstallmentId } })
    if (!bookingpolicy) {
      throw new HttpException(
        `Installment not found with this Id=${InstallmentId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.InstallmentRepo.delete(InstallmentId);
  }

  // find booking policy
  async FindbookingPolicy(Id: string, BkId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const bookingpolicy = await this.bookingPolicyRepo.findOne({ where: { BkId} })
    if (!bookingpolicy) {
      throw new HttpException(
        `booking policy not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return bookingpolicy;
  }

  //update booking policy
  async updateBookingolicy(Id: string, BkId: number, updateBOokingPolicy: updateBookingPolicyDto) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const bookingpolicy = await this.bookingPolicyRepo.findOne({ where: { BkId } })
    if (!bookingpolicy) {
      throw new HttpException(
        `booking policy not found with this Id=${BkId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const updatepolicy = await this.bookingPolicyRepo.update({ BkId }, { ...updateBOokingPolicy })
    return updatepolicy;
  }


  



  //Delete booking policy
  async DeletebookingPolicy(Id: string, BkId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const bookingpolicy = await this.bookingPolicyRepo.findOne({ where: { BkId } })
    if (!bookingpolicy) {
      throw new HttpException(
        `booking policy not found with this Id=${BkId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.bookingPolicyRepo.delete(BkId);
  }

  //End Booking Policy..........................



  // start refund policy
  async AddRefundPolicy(
    Id: string,
    RefundpolicyDto: createRefundPolicyDto[],
  ) {
    const tourpackage = await this.TourpackageRepo.findOneBy({ Id });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cann't add cover image",
        HttpStatus.BAD_REQUEST,
      );
    }
    const refundpolic:refundpolicy []=[]
    for(const refundpolicydto of RefundpolicyDto){
      const createrefundpolicy = this.refundPolicyRepo.create({...refundpolicydto,tourpackage });
      const createdrefundpolicy = await this.refundPolicyRepo.save(createrefundpolicy)
      refundpolic.push(createdrefundpolicy);
    }
    return refundpolic;

  }


  // get refund policy
  async FindRefundPolicy(Id: string, RId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const refundpolicy = await this.refundPolicyRepo.findOne({ where: { RId } })
    if (!refundpolicy) {
      throw new HttpException(
        `refund policy not found with this Id=${RId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return refundpolicy;
  }


  // update Refund policy
  async updateRefundolicy(Id: string, RId: number, updaterefundPolicy: UpdateRefundPolicy) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const bookingpolicy = await this.refundPolicyRepo.findOne({ where: { RId } })
    if (!bookingpolicy) {
      throw new HttpException(
        `Refund policy not found with this Id=${RId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const updatepolicy = await this.refundPolicyRepo.update({ RId }, { ...updaterefundPolicy })
    return updatepolicy;
  }


  //Delete refund policy
  async DeleterefundPolicy(Id: string, RId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const Refundpolicy = await this.refundPolicyRepo.findOne({ where: { RId } })
    if (!Refundpolicy) {
      throw new HttpException(
        `Refund policy not found with this Id=${RId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.refundPolicyRepo.delete(RId);
  }

//End refund Policy

// Add package inclusions


  async AddInclusions(
    Id: string,
    inclusionsDto: createpackageincluionDto[],
  ) {
    const tourpackage = await this.TourpackageRepo.findOneBy({ Id });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cann't add cover image",
        HttpStatus.BAD_REQUEST,
      );
    }
    const inclsuinsarray: Packageinclusion[]= []
    for(const inclusionsdto of inclusionsDto){
      const newInclusions = await this.packageInclusionRepo.create({...inclusionsdto, tourpackage });
      const saveinclusions = await this.packageInclusionRepo.save(newInclusions)
      inclsuinsarray.push(saveinclusions);
    }
    return inclsuinsarray;
  }

  // find inclusions
  async FindInclsuions(Id: string, InId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this id=${InId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const inclusions = await this.packageInclusionRepo.findOne({ where: { InId } })
    if (!inclusions) {
      throw new HttpException(
        `Inclusions not found with this id=${InId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return inclusions;
  }



  // update inclusions
  async updateInclusions(Id: string, InId: number, updateInclusionsDto: updatepackageInclusionDto) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const inclsuions = await this.packageInclusionRepo.findOne({ where: { InId } })
    if (!inclsuions) {
      throw new HttpException(
        `inclusions not found with this Id=${InId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const updateinclusion = await this.packageInclusionRepo.update({ InId }, { ...updateInclusionsDto })
    return updateinclusion;
  }


  // Delete Inclusions
  async DeleteInclusion(Id: string, InId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const inclusions = await this.packageInclusionRepo.findOne({ where: { InId } })
    if (!inclusions) {
      throw new HttpException(
        `Inclsuions not found with this Id=${InId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.packageInclusionRepo.delete(InId);
  }

  /// end inclusions....................

  /// start package exclsuions

  //add exclsuions

  async AddpackageExclsuions(
    Id: string,
    exclusionDto: CreatepackageExclsuionsDto[],
  ) {

    const tourpackage = await this.TourpackageRepo.findOneBy({ Id });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cann't add cover image",
        HttpStatus.BAD_REQUEST,
      );
    }

    const exclsuinsarray: packageexcluions[]= []
    for(const exclusiondto of exclusionDto){
      const newExclsuions = await this.packageexcluionsRepo.create({...exclusiondto, tourpackage });
      const saveexclsuions = await this.packageexcluionsRepo.save(newExclsuions)
      exclsuinsarray.push(saveexclsuions);
    }
    return exclsuinsarray;
  

  }

  // find Exclusions
  async FindExclsuions(Id: string, ExId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const Exclusions = await this.packageexcluionsRepo.findOne({ where: { ExId } })
    if (!Exclusions) {
      throw new HttpException(
        `Exclusions not found with this id=${ExId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return Exclusions;
  }

  // update inclusions
  async updateExclusions(Id: string, ExId: number, updateExlusionsDto: updatepackageExclusionsDto) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const exclsuions = await this.packageexcluionsRepo.findOne({ where: { ExId } })
    if (!exclsuions) {
      throw new HttpException(
        `exclsuions not found with this Id=${ExId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const updateExclsuions = await this.packageexcluionsRepo.update({ ExId }, { ...updateExlusionsDto })
    return updateExclsuions;
  }


  // Delete exclusions
  async DeleteIExclusion(Id: string, ExId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  const exclusions = await this.packageexcluionsRepo.findOne({ where: { ExId } })
    if (!exclusions) {
      throw new HttpException(
        `exclusions not found with this id=${ExId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.packageexcluionsRepo.delete(ExId);
  }

  // End exclusions


  //start  included


  async AddTourpackagePlan(
    Id: string,
    tourPackageplanDto: CreateTourPackagePlanDto[],
  ) {
    const tourpackage = await this.TourpackageRepo.findOneBy({ Id });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cann't add tourplan",
        HttpStatus.BAD_REQUEST,
      );
    }
    const createtourplan: tourpackageplan[]=[]
    for(const tourpackageplandto of tourPackageplanDto){
      const newTourplan = await this.tourpackagePlanRepo.create({...tourpackageplandto, tourpackage });
      const savetourplan = await this.tourpackagePlanRepo.save(newTourplan)
      createtourplan.push(savetourplan);
    }
    return createtourplan;

  }
  
  // find Exclusions
  async Finddayplan(Id: string, dayId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const dayplan = await this.tourpackagePlanRepo.findOne({ where: { dayId } })
    if (!dayplan) {
      throw new HttpException(
        `tour plan not found not found with this Id=${dayId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return dayplan;
  }

  // update inclusions
  async updatedayplan(Id: string, dayId: number, updatedayplanDto: updateTourPackagePlanDto) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const dayplan = await this.tourpackagePlanRepo.findOne({ where: { dayId } })
    if (!dayplan) {
      throw new HttpException(
        `day plan not found with this Id=${dayId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const uodatedayplan = await this.tourpackagePlanRepo.update({ dayId }, { ...updatedayplanDto })
    return uodatedayplan;
  }


  // Delete exclusions
  async Deleteayplan(Id: string, dayId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const dayplan = await this.tourpackagePlanRepo.findOne({ where: { dayId } })
    if (!dayplan) {
      throw new HttpException(
        `Inclsuions not found with this id=${dayId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.tourpackagePlanRepo.delete(dayId);
  }


  // startr highlights


  // Add package highlight




  async AddPackageHighlight(
    Id: string,
    packageHighlightDto: CreatePackageHighlightDto[],
  ) {
    const tourpackage = await this.TourpackageRepo.findOneBy({ Id });
    if (!tourpackage) {
      throw new HttpException(
        "TourPackage not found, cann't add cover image",
        HttpStatus.BAD_REQUEST,
      );
    }
    const createHightlight: packagehighlight[]= []
    for(const packagehighlightdto of packageHighlightDto){
      const newHightlight = await this.packageHighlightRepo.create({...packagehighlightdto, tourpackage });
      const saveHightlight = await this.packageHighlightRepo.save(newHightlight)
      createHightlight.push(saveHightlight);
    }
    return createHightlight;

  }


  // find highlight
  async FindHighlight(Id: string, HiId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const Highlight = await this.packageHighlightRepo.findOne({ where: { HiId } })
    if (!Highlight) {
      throw new HttpException(
        `Package highlight not found with this Id ${HiId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return Highlight;
  }

  // update inclusions
  async updateHighlight(Id: string, HiId: number, updateHighlightDto: UpdatepackageHighlightDto) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const highlight = await this.packageHighlightRepo.findOne({ where: { HiId } })
    if (!highlight) {
      throw new HttpException(
        `Package highlight found with this Id=${HiId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const updatedhighlight = await this.packageHighlightRepo.update({ HiId }, { ...updateHighlightDto })
    return updatedhighlight;
  }


  // Delete exclusions
  async DeleteHighlight(Id: string, HiId: number) {
    const tourpackage = await this.TourpackageRepo.findOne({
      where: {
        Id
      }
    })
    if (!tourpackage) {
      throw new HttpException(
        `TourPackage not found with this Id=${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const highlight = await this.packageHighlightRepo.findOne({ where: { HiId } })
    if (!highlight) {
      throw new HttpException(
        `Package highlight not found with this Id=${HiId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.packageHighlightRepo.delete(HiId);
  }

}

// end of travel package




