import { IsEmail } from '@nestjs/class-validator';
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';

@Controller('subscription')
export class SubscriptionController {
  constructor(@InjectRepository(Subscription) private subscriptionRepos:Repository<Subscription>, private readonly subscriptionService: SubscriptionService) {}

  @Post('create')
  async subscription(
    @Req() req: Request,
    @Body() body,
    @Res() res: Response,
  ) {
    const { Email } = req.body;
    const subscription = new Subscription();
    subscription.Email =Email
    await this.subscriptionRepos.save(subscription)
    return res
      .status(HttpStatus.OK)
      .send({
        status: 'success',
        message: 'Thans for subscription',
      });
  }



  @Get('all')
  findAll() {
    return this.subscriptionRepos.find({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionService.update(+id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionService.remove(+id);
  }
}
