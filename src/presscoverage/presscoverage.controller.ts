import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Req, Res, HttpStatus } from '@nestjs/common';
import { PresscoverageService } from './presscoverage.service';
import { CreatePresscoverageDto } from './dto/create-presscoverage.dto';
import { UpdatePresscoverageDto } from './dto/update-presscoverage.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PressCoverages } from 'src/blog/entities/press.entity';
import { Repository } from 'typeorm';
import { GCSStorageService } from 'src/s3/s3.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';

@Controller('press')
export class PresscoverageController {
  constructor(    @InjectRepository(PressCoverages) private PressCoveragesRepo: Repository<PressCoverages>,
  private s3service: GCSStorageService,
  private readonly presscoverageService: PresscoverageService) {}

  @Post('AddpressCoverage')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'Image', maxCount: 2 }]))
  async AddPressCoverage(
    @UploadedFiles()
    file: {
      Image?: Express.Multer.File[];
    },
    @Req() req: Request,
    @Body() body,
    @Res() res: Response,
  ) {
    const { links, Date, Description } = req.body;
    let Image = null;
    if (file.Image && file.Image.length > 0) {
      Image = await this.s3service.Addimage(file.Image[0]);
    }
    const press = new PressCoverages();
    press.Image = Image;
    press.Description = Description;
    press.Date = Date;
    press.links = links;
    await this.PressCoveragesRepo.save({ ...press });
    return res
      .status(HttpStatus.OK)
      .send({
        status: 'success',
        message: 'Press coverage uploaded successfully',
      });
  }

   
  @Patch(':uuid')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'Image', maxCount: 2 }]))
  async updatePressCoverage(
    @UploadedFiles()
    file: {
      Image?: Express.Multer.File[];
    },
    @Req() req: Request,
    @Param('uuid') uuid: string,
    @Body() body,
    @Res() res: Response,
  ) {
    const { links, Date, Description } = req.body;
    let Image = null;
    if (file.Image && file.Image.length > 0) {
      Image = await this.s3service.Addimage(file.Image[0]);
    }
    const press = new PressCoverages();
    press.Image = Image;
    press.Description = Description;
    press.Date = Date;
    press.links = links;
    await this.PressCoveragesRepo.update({uuid},{ ...press });
    return res
      .status(HttpStatus.OK)
      .send({
        status: 'success',
        message: 'updated successfully',
      });
  }

  @Get('allpressoverages')
  async findAllpress() {
    return await this.PressCoveragesRepo.find({});
  }

  @Delete(':uuid')
  async remove(  @Res() res: Response, @Param('uuid') uuid: string) {
   await this.PressCoveragesRepo.delete(uuid)
   return res
   .status(HttpStatus.OK)
   .send({ status: 'success', message: 'press coverage has deleted' });

  }


}
