
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Req, Res, HttpStatus, NotFoundException, UploadedFiles } from '@nestjs/common';
import { BlogService } from './blog.service';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { PressCoverages } from './entities/press.entity';
import { GCSStorageService } from 'src/s3/s3.service';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Blog Module')
@Controller('blog')
export class BlogController {
  constructor(
    @InjectRepository(Blog) private BlogRepo: Repository<Blog>,
    @InjectRepository(PressCoverages)
    private PressCoveragesrepo: Repository<PressCoverages>,
    private readonly blogService: BlogService,
    private s3service: GCSStorageService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'blogimages', maxCount: 10 }]),
  )
  async Createblog(
    @UploadedFiles()
    file: {
      blogimages?: Express.Multer.File[];
    },

    @Req() req: Request,
    @Body() body,
    @Res() res: Response,
  ) {
    const { Title, Description, Blogfor, WrittenBy, Type } = req.body;
    const testimonialimagess = [];
    if (file.blogimages) {
      for (let i = 0; i < file.blogimages.length; i++) {
        const imageUrl = await this.s3service.Addimage(file.blogimages[i]);
        testimonialimagess.push(imageUrl);
      }
    }
    const blog = new Blog();
    blog.blogimages = testimonialimagess;
    blog.Title = Title;
    blog.Type = Type;
    blog.Description = Description;
    blog.Blogfor = Blogfor;
    blog.WrittenBy = WrittenBy;
    await this.BlogRepo.save({ ...blog });
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'blog created successfully' });
  }

  @Post('presscoverage')
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
    const image = await this.s3service.Addimage(file.Image[0]);
    const press = new PressCoverages();
    press.Image = image;
    press.Description = Description;
    press.Date = Date;
    press.links = links;
    await this.PressCoveragesrepo.save({ ...press });
    return res
      .status(HttpStatus.OK)
      .send({
        status: 'success',
        message: 'Press coverage uploaded successfully',
      });
  }

  @Get('presscoverage')
  async findAllpress() {
    return await this.PressCoveragesrepo.find({});
  }

  // @Patch('update/:blogid')
  // @UseInterceptors(FileFieldsInterceptor([
  //   { name: 'Image1', maxCount: 1 },
  //   { name: 'Image2', maxCount: 1},
  //   { name: 'Image3', maxCount: 1 },
  //   { name: 'Image4', maxCount: 1 },
  //   { name: 'Image5', maxCount: 1 },
  // ]))
  // async updateimage(
  //   @UploadedFiles()
  //   file: {
  //     blogimages?: Express.Multer.File[],},
  //   @Req() req: Request,
  //   @Param ('blogid')blogid:string,
  //   @Body() body,
  //   @Res() res: Response) {
  //   const image1 = file.blogimages? await this.s3service.updateBlogIMages(blogid,file.blogimages[0]):null
  //   const blog = new Blog();
  //   if(image1) blog.blogimages =image1
  //   await this.BlogRepo.update({blogid},{...blog})
  //   return res.status(HttpStatus.OK).send({ status: "success", message: " image update successfully", })
  // }

  @Get('myblogs')
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
