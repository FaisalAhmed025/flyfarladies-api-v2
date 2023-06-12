
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseFilePipeBuilder, Patch, Post, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { TravellerServices } from './traveller.services';
import { Request, Response } from 'express';
import { updateTravellerDto } from "./Dto/update-traveller.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Traveller } from "./entities/traveller.entity";
import { Repository } from "typeorm/repository/Repository";
import { InjectRepository } from "@nestjs/typeorm";
import { GCSStorageService } from "src/s3/s3.service";
import { ApiTags } from '@nestjs/swagger';

@ApiTags("Traveller Module")
@Controller('Traveller')
export class TravellerController {
   constructor(@InjectRepository(Traveller) private tarvellerRepository: Repository<Traveller>,
      private readonly travellerServices: TravellerServices,
      private s3service: GCSStorageService
      ) { }

   //Add Traveller
   @Post()
   @UseInterceptors(
      FilesInterceptor('passportimage',5
   ))
   async AddTraveller(
      @UploadedFiles(
         new ParseFilePipeBuilder()
            .addFileTypeValidator({
               fileType: /(jpg|jpeg|png|gif)$/,
            })
            .addMaxSizeValidator({
               maxSize: 1024 * 1024 * 6,
            })
            .build({
               errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            }),
      )
      files: Express.Multer.File[],
      @Body() body,
      @Req() req: Request,
      @Res() res: Response) { 
      for (const file of files) {
         const passportCopyurl  = await this.s3service.Addimage(file)
         const traveller = new Traveller();
         traveller.PassportCopyURL =passportCopyurl
         traveller.FirstName = req.body.FirstName
         traveller.LastName = req.body.LastName
         traveller.PassportNumber = req.body.PassportNumber
         traveller.PassportExpireDate = req.body.PassportExpireDate
         traveller.DOB = req.body.DOB
         traveller.Gender = req.body.Gender
         await this.tarvellerRepository.save({ ...traveller })
      }
      return res.status(HttpStatus.OK).send({ status: "success", message: "Traveller added succesfully" })
   }


   // all Traveller

   @Get('Alltraveller')
   async FindAll(
      @Req() req: Request,
      @Res() res: Response) {
      const traveller = await this.travellerServices.FindAllTraveller();
      return res.status(HttpStatus.OK).json({ traveller });
   }

   // get traveller dashbboard
   @Get(':id')
   async TravellerDashboard(
      @Param('id') id: string,
      @Req() req: Request,
      @Res() res: Response) {
      const traveller = await this.travellerServices.FindTrveller(id);
      return res.status(HttpStatus.OK).json({ traveller });
   }

   @Patch(':id')
   async updateTraveller(
      @Param('id') id: string,
      @Res() res: Response,
      @Body() updateTravellerdto: updateTravellerDto) {
      await this.travellerServices.UpdateTravller(id, updateTravellerdto)
      return res.status(HttpStatus.OK).json({ status: "success", message: 'traveller updated successfully' });
   }

   @Delete(':id')
   async DeleteTraveller(
      @Param('id') id: string,
      @Req() req: Request,
      @Res() res: Response) {
      await this.travellerServices.DeleteTraveller(id)
      return res.status(HttpStatus.OK).json({ message: 'traveller has deleted' });
   }

}