
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

  @Post('addblog')
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
    const blogimages = [];
    if (file.blogimages) {
      for (let i = 0; i < file.blogimages.length; i++) {
        const imageUrl = await this.s3service.Addimage(file.blogimages[i]);
        blogimages.push(imageUrl);
      }
    }
    const blog = new Blog();
    blog.blogimages = blogimages;
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


  @Patch(':blogid')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'blogimages', maxCount: 10 }]),
  )
  async Updatelog(
    @UploadedFiles()
    file: {
      blogimages?: Express.Multer.File[];
    },
    @Param('blogid') blogid: string,
    @Req() req: Request,
    @Body() body,
    @Res() res: Response,
  ) {
    const { Title, Description, Blogfor, WrittenBy, Type } = req.body;
    const blog = await this.BlogRepo.findOne({ where: { blogid } });
  
    if (file.blogimages) {
      const blogimages = [];
      for (let i = 0; i < file.blogimages.length; i++) {
        const imageUrl = await this.s3service.Addimage(file.blogimages[i]);
        blogimages.push(imageUrl);
      }
      blog.blogimages = blogimages;
    }
  
    blog.Title = Title;
    blog.Type = Type;
    blog.Description = Description;
    blog.Blogfor = Blogfor;
    blog.WrittenBy = WrittenBy;
  
    await this.BlogRepo.update({ blogid }, { ...blog });
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'blog updated successfully' });
  }

  @Get('myblogs')
 async findAll( @Res() res: Response) {
    const blogs= await this.BlogRepo.find({})
    res.status(HttpStatus.OK).json({blogs}) 
  }


  @Delete(':blogid')
  async remove(  @Res() res: Response, @Param('blogid') blogid: string) {
   await this.BlogRepo.delete(blogid)
   return res
   .status(HttpStatus.OK)
   .send({ status: 'success', message: 'blog has deleted' });

  }



  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(id, updateBlogDto);
  }

}
