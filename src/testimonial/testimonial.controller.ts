import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, HttpStatus, Req, Res, ParseFilePipeBuilder, HttpException, Put } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GCSStorageService } from 'src/s3/s3.service';
import { ApiTags } from '@nestjs/swagger';



@ApiTags('Testimonial Module')
@Controller('testimonial')
export class TestimonialController {
  constructor(
    @InjectRepository(Testimonial)
    private TestimonialRepository: Repository<Testimonial>,
    private s3service: GCSStorageService,
    private readonly testimonialService: TestimonialService,
  ) {}

  @Post('addtestimonial')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'testimonialimages', maxCount: 10 },
      { name: 'ClientImage', maxCount: 2 },
    ]),
  )
  async addtestimonial(
    @UploadedFiles()
    file: {
      testimonialimages?: Express.Multer.File[];
      ClientImage?: Express.Multer.File[];
    },
    @Req() req: Request,
    @Body() body,
    @Res() res: Response,
  ) {
    const { ClientName, ClientDesignation, CompanyName, Description } =
      req.body;
    const testimonialimagess = [];
    if (file.testimonialimages) {
      for (let i = 0; i < file.testimonialimages.length; i++) {
        const imageUrl = await this.s3service.Addimage(
          file.testimonialimages[i],
        );
        testimonialimagess.push(imageUrl);
      }
    }
    const ClientImage = file.ClientImage
      ? await this.s3service.Addimage(file.ClientImage[0])
      : null;
    const testimonial = new Testimonial();
    testimonial.ClientName = ClientName;
    testimonial.testimonialimages = testimonialimagess;
    testimonial.ClientImage = ClientImage;
    testimonial.Description = Description;
    testimonial.ClientDesignation = ClientDesignation;
    testimonial.CompanyName = CompanyName;
    await this.TestimonialRepository.save({ ...testimonial });
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'testimonial created successfully' });
  }


  @Patch(':testid')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'testimonialimages', maxCount: 10 },
      { name: 'ClientImage', maxCount: 2 },
    ]),
  )
  async updateTestimonial(
    @UploadedFiles()
    files: {
      testimonialimages?: Express.Multer.File[];
      ClientImage?: Express.Multer.File[];
    },
    @Req() req: Request,
    @Body() body,
    @Param('testid') testid: string,
    @Res() res: Response,
  ) {
    const testimonial = await this.TestimonialRepository.findOne({where:{testid}});
  
    if (!testimonial) {
      throw new HttpException(
        'Testimonial not found',
        HttpStatus.NOT_FOUND,
      );
    }
  
    const {
      ClientName,
      ClientDesignation,
      CompanyName,
      Description,
    } = req.body;
  
    if (files.testimonialimages) {
      const testimonialImages = [];
      for (const image of files.testimonialimages) {
        const imageUrl = await this.s3service.Addimage(image);
        testimonialImages.push(imageUrl);
      }
      testimonial.testimonialimages = testimonialImages;
    }

    if (files.ClientImage) {
      const clientImage = await this.s3service.Addimage(files.ClientImage[0]);
      testimonial.ClientImage = clientImage;
    }

    testimonial.ClientName = ClientName;
    testimonial.ClientDesignation = ClientDesignation;
    testimonial.CompanyName = CompanyName;
    testimonial.Description = Description;
    await this.TestimonialRepository.save(testimonial);
  
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'Testimonial updated successfully' });
  }

  @Delete(':testid')
 async Delete(@Param('testid') testid: string,
 @Res() res: Response,) {
    await this.TestimonialRepository.delete(testid);
    return res
    .status(HttpStatus.OK)
    .send({ status: 'success', message: 'Testimonial has deleted' });
    
  }
  




  @Get('alltestimonila')
  async findAll(@Res() res: Response) {
    const alltestimonila = await this.TestimonialRepository.find({});
    return res.status(HttpStatus.OK).json({ alltestimonila });
  }

  @Get(':testid')
  async findOne(@Param('testid') testid: string) {
    const testimonial = await this.TestimonialRepository.findOne({
      where: { testid },
    });
    if (!testimonial) {
      throw new HttpException('testimonial not found', HttpStatus.BAD_REQUEST);
    }
    return testimonial;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
  ) {
    return this.testimonialService.update(id, { ...updateTestimonialDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    
  }

}
