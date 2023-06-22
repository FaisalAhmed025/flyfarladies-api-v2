import { BadRequestException, Body, HttpException, HttpStatus, Injectable, NotFoundException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tourpackage } from 'src/tourpackage/entities/tourpackage.entity';
import { Traveller } from 'src/Traveller/entities/traveller.entity';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entity/booking.entity';
import { CreateBookingDto } from './dto/booking.dto';
import * as nodemailer from 'nodemailer'
import { User } from 'src/userProfile/entitties/user.entity';
import { Payement } from './entity/payement.entity';
import { Installment, InstallmentStatus } from 'src/tourpackage/entities/installment.entity';
var converter = require('number-to-words');

@Injectable()
export class BookingService {
   constructor(@InjectRepository(Tourpackage)
   private tourPackageRepository: Repository<Tourpackage>,
      @InjectRepository(Traveller)
      private travelerRepository: Repository<Traveller>,
      @InjectRepository(Booking)
      private bookingRepository: Repository<Booking>,
      @InjectRepository(Payement)
      private PayementRepository: Repository<Payement>,
      @InjectRepository(User)
      private UserRepository: Repository<User>,
      @InjectRepository(Installment)
      private InstallmentRepo: Repository<Installment>,
   ) {}


   
   async BookTravelpackage(Id:string, bookingDto: CreateBookingDto,uuid:string ){
    const {travelers} =bookingDto
    const tourPackage = await this.tourPackageRepository.findOne({ where: { Id } })

    if (!tourPackage) {
       throw new HttpException(
          `TourPackage not found with this id=${Id}`,
          HttpStatus.BAD_REQUEST,
       );
    }

    if (tourPackage.TripType === "International"){
      if (tourPackage.AvailableSeats <= 0) {
        throw new HttpException(
          `No seats available for this tour package`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const totalTravelers = travelers.length;
    if (tourPackage.AvailableSeats < totalTravelers) {
      throw new HttpException(
        `Not enough seats available for the number of travelers`,
        HttpStatus.BAD_REQUEST,
      );
    }
    tourPackage.AvailableSeats -= totalTravelers;
    if (tourPackage.AvailableSeats <= 0) {
      tourPackage.Availability = false;
    }
    await this.tourPackageRepository.save(tourPackage);
    }
    const userprofile = await this.UserRepository.findOne({ where: {uuid}})
    const arrayoftravlers =[]
    let TotalPrice:number = 0
    for(const traveler of travelers){
    const { FirstName, LastName, DOB,PassportExpireDate,PassportNumber,Nationality, Price, Gender} = traveler;
      const newTraveler = new Traveller();
      newTraveler.FirstName = FirstName;
      newTraveler.LastName = LastName;
      newTraveler.Nationality =Nationality
      newTraveler.Gender =Gender
      newTraveler.DOB =DOB
      newTraveler.PassportExpireDate =PassportExpireDate
      newTraveler.PassportNumber =PassportNumber
      newTraveler.Price = Price ? Price : tourPackage.Price;
      await this.travelerRepository.save(newTraveler)
      arrayoftravlers.push(newTraveler)
      const discount = tourPackage.Price* tourPackage.Discount/100
      TotalPrice +=newTraveler.Price-discount;

      if (newTraveler.Age <= tourPackage.MinimumAge || newTraveler.Age >= tourPackage.MaximumAge) {
        throw new HttpException(
          `Age not within the allowed range for this tour package`,
          HttpStatus.UNAUTHORIZED,
       );  
      } 
    }
    const newbooking = new Booking(); // Create a new booking entity
    newbooking.tourPackage = tourPackage; // Assign the tourPackage to the booking
    newbooking.travelers = arrayoftravlers;
    newbooking.TotalPrice = TotalPrice;
    newbooking.Email = userprofile.Email;
    newbooking.Name = userprofile.Name;
    newbooking.Wallet = userprofile.Wallet;
    newbooking.Mobile = userprofile.Mobile;
    newbooking.WhatsApp = userprofile.WhatsApp;
    newbooking.FaceBookId = userprofile.FaceBookId;
    newbooking.LinkedIn = userprofile.LinkedIn;
    newbooking.MainTitle = tourPackage.MainTitle;
    newbooking.SubTitle = tourPackage.SubTitle;
    newbooking.userid = userprofile.uuid;
    newbooking.Totalseat= travelers.length,
    newbooking.packageId=tourPackage.Id
    const savebooking= await this.bookingRepository.save(newbooking)
    for (let i = 0; i < 3; i++) {
      const installment = new Installment();
      installment.TotalAmount = TotalPrice; 
      const installmentAmount = TotalPrice / 3;
      installment.booking = savebooking;
      installment.Amount = installmentAmount;
      installment.InstallmentId = i + 1; // Set the installment number
      await this.InstallmentRepo.save(installment);
    }
    await this.sendBookingDetailsToUser(savebooking,userprofile.Email,arrayoftravlers);
    return savebooking;
 
 }
 async confirmBookingWithInstallment(Bookingid: string, installmentId: number, uuid: string) {
  const booking = await this.bookingRepository.findOne({where:{Bookingid}, relations: ['installments', 'tourPackage'] }, );
  if (!booking) {
    throw new HttpException('Booking not found', HttpStatus.BAD_REQUEST);
  }

  const installment = (await booking.tourPackage.installments).find(installment => installment.InstallmentId === installmentId);
  if (!installment) {
    throw new  HttpException('Installment not found',HttpStatus.BAD_REQUEST,);
  }
  // Check user's wallet balance
  const user = await this.UserRepository.findOne({where:{uuid}});
  if (!user) {
    throw new HttpException('User not found',HttpStatus.BAD_REQUEST,);
  }

  const totalPayment = installment.Amount
  if (user.Wallet < totalPayment) {
    throw new HttpException('Insufficient wallet balance',HttpStatus.BAD_REQUEST,);
  }

  user.Wallet -= totalPayment;
  installment.status =InstallmentStatus.PAID
  await this.InstallmentRepo.save(installment)
  await this.UserRepository.save(user);
  const installmentIndex = booking.installments.findIndex(installment => installment.InstallmentId === installmentId);
  const nextInstallment = booking.installments[installmentIndex + 1];
  if (nextInstallment && nextInstallment.status !== InstallmentStatus.PENDING) {
    throw new HttpException('The next installment is not available for payment',HttpStatus.BAD_REQUEST);
  }

  if (installmentIndex === booking.installments.length - 1 && installment.status === InstallmentStatus.PAID) {
    booking.status = BookingStatus.APPROVED;
  }
   else {
    booking.status = BookingStatus.PARTIAL;
  }
  
  await this.bookingRepository.save(booking);
  if(booking.status === BookingStatus.APPROVED){
    throw new HttpException('Your Booking is Confirmed',HttpStatus.BAD_REQUEST);
  }

  const remainingAmount = user.Wallet;
  return { totalPayment, remainingAmount };
}


  

   async sendBookingDetailsToUser(booking: Booking,Email:string, travelers: Traveller[] ) {
      const { Bookingid, tourPackage, TotalPrice } = booking;
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

      const amountInWords = converter.toWords(booking.TotalPrice)
      const useremail = await this.UserRepository.findOne({where:{Email}})
      // Compose the email message
      const mailOptions = {
        from: 'flyfarladies@mailservice.center', // Replace with your email address
        to: useremail.Email, // Recipient's email address
        subject: 'Booking Confirmation',
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
            <div style="width: 700px; height: 150vh; margin: 0 auto">
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
                      Booking confiramtion
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
                        padding: 20px 40px 0px 55px;
                        line-height: 38px;

                      "
                    >
                      ${tourPackage.MainTitle}
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
                        padding: 0px 40px 20px 55px;
                      "
                    >
                     ${tourPackage.SubTitle}
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
                      Package Details
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
                      Start Date
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
                    ${tourPackage.StartDate}
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
                      End Date
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
                    ${tourPackage.EndDate}
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
                      Duration
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
                    ${tourPackage.TotalDuration}
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
                      Location to Visit
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
                      ${tourPackage.Location}
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
                    margin-top: 15px;
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
                        padding: 5px 20px;
                      "
                    >
                      Passenger Details
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
                      Travel Count
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
                      ${travelers.length}
                    </td>
                  </tr>
                  ${travelers.map((traveler,index)=>`
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
                      Passanger x${index+1}
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
                    ${traveler.FirstName}
                    </td>
                  </tr>
                  `).join('\n')}
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
                    margin-top: 15px;
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
                        padding: 5px 20px;
                      "
                    >
                      Fare Details
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
                      Fare Per Passenger
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
                    ${booking.TotalPrice/travelers.length}
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
                      Total Amount
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
                      ${booking.TotalPrice}
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
                      "
                    >
                      Inword
                    </td>
                    <td
                      valign="top"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        color: #702c8b;
                        font-family: sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 38px;
                        padding: 5px 20px;
                        font-style: italic;
                      "
                    >
                      ${amountInWords}
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
                      Please confirm the booking by providing a time limit; else, it
                      will be cancel automatically.
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


   async MakePayementwithwallet(Bookingid: string, uuid:string,
    Email:string,): Promise<void>{
      // Find the booking object with the provided ID
      const booking = await this.bookingRepository.findOne({where:{Bookingid}});
      if(booking.status!== BookingStatus.HOLD)
      {
         throw new NotFoundException('Booking request already approved or Rejected');
      }
      // Update the booking status to approved
      const profile = await this.UserRepository.findOne({ where: {uuid} });
      if (!profile) {
         throw new NotFoundException('user not found');
      }
      const totalprice  = booking.TotalPrice
      if(profile.Wallet>=totalprice){
         profile.Wallet -= totalprice
         await this.UserRepository.save(profile);
         booking.status = BookingStatus.ISSUE_IN_PROCESS;
         booking.Wallet =profile.Wallet
         booking.UpdatedAt = new Date()
         const updatedBooking = await this.bookingRepository.save(booking);
         await this.sendBookingApprovalToUser(updatedBooking);
      }
      else{
         throw new BadRequestException('Insufficient balance! please deposit to your wallet');
      }
      
    }


    async ApprvedAdmin(Bookingid: string, uuid:string,
      @Body() body:any): Promise<void>{
        // Find the booking object with the provided ID
        const booking = await this.bookingRepository.findOne({where:{Bookingid}});
        if(booking.status!== BookingStatus.ISSUE_IN_PROCESS)
        {
           throw new NotFoundException('Booking request already approved or Rejected');
        }
        // Update the booking status to approved
        const profile = await this.UserRepository.findOne({ where: {uuid} });
        if (!profile) {
           throw new NotFoundException('user not found');
        }

        if(booking.status === BookingStatus.ISSUE_IN_PROCESS){
          booking.UpdatedAt = new Date()
          booking.status = BookingStatus.CONFIRMED;
          booking.ActionBy = `Action By ${body.ActionBy}`;
          if (!body.ActionBy) {
            throw new NotFoundException('ActionBy');
          }
          const updatedBooking = await this.bookingRepository.save(booking);
          await this.sendBookingApprovalToUser(updatedBooking);
        }
        else{
          throw new BadRequestException('No booking in process');
       }
        
      }

      
    async Cancelledbookingbyadmin(Bookingid: string, uuid:string, Id:string, @Body()body: any): Promise<void>{
        // Find the booking object with the provided ID
        const booking = await this.bookingRepository.findOne({where:{Bookingid}});
        // if(booking.status!== BookingStatus.ISSUE_IN_PROCESS && booking.status!== BookingStatus.HOLD)
        // {
        //    throw new NotFoundException('Booking request already approved or Rejected');
        // }
        // Update the booking status to approved
        const profile = await this.UserRepository.findOne({ where: {uuid} });
        if (!profile) {
           throw new NotFoundException('user not found');
        }

        const tourpackage = await this.tourPackageRepository.findOne({where:{Id}})
        if(booking.status === BookingStatus.ISSUE_IN_PROCESS || booking.status== BookingStatus.HOLD){
          booking.UpdatedAt = new Date()
          booking.status = BookingStatus.CANCELLED;
          booking.CancelledReason =` Reject Due to ${body.CancelledReason}`;
          if (!body.CancelledReason) {
            throw new NotFoundException('CancelledReason');
          }
          booking.ActionBy = `Action By ${body.ActionBy}`;
          if (!body.ActionBy) {
            throw new NotFoundException('ActionBy');
          }
          if(tourpackage.Id == booking.packageId)
          tourpackage.AvailableSeats+=booking.Totalseat
          await this.tourPackageRepository.save(tourpackage)
          await this.bookingRepository.save(booking);
          // await this.sendBookingApprovalToUser(updatedBooking);
        }
        else{
          throw new BadRequestException('No booking in process');
       }
        
      }

    async Cancelledbookingbyuser(Bookingid: string, uuid:string,Id:string, @Body() body: any): Promise<void>{
      // Find the booking object with the provided ID
      const booking = await this.bookingRepository.findOne({where:{Bookingid}});
      // if(booking.status== BookingStatus.ISSUE_IN_PROCESS)
      // {
      //    throw new NotFoundException('Booking request already approved or Rejected');
      // }
      // Update the booking status to approved
      
      const tourpackage = await this.tourPackageRepository.findOne({where:{Id}})
      const profile = await this.UserRepository.findOne({ where: {uuid} });
      if (!profile) {
         throw new NotFoundException('user not found');
      }

      if(booking.status === BookingStatus.ISSUE_IN_PROCESS || booking.status === BookingStatus.HOLD){
        booking.UpdatedAt = new Date()
        booking.status = BookingStatus.CANCELLED;
        booking.CancelledReason =` Reject Due to ${body.CancelledReason}`;
        if (!body.CancelledReason) {
          throw new NotFoundException('CancelledReason');
        }
        if(tourpackage.Id =booking.packageId)
        tourpackage.AvailableSeats+=booking.Totalseat
        await this.tourPackageRepository.update({Id},{...tourpackage})
        await this.bookingRepository.save(booking);
        // await this.sendBookingApprovalToUser(updatedBooking);
      }
      else{
        throw new BadRequestException('No booking in process');
     }
      
    }
    
   async MakePayementwitInatallemnt(Bookingid: string, uuid:string,
    Email:string,): Promise<void>{
      const booking = await this.bookingRepository.findOne({where:{Bookingid}});
      if(booking.status!== BookingStatus.HOLD)
      {
         throw new NotFoundException('Booking request already approved or Rejected');
      }
      const tourpackage = await this.bookingRepository.findOne({where:{Bookingid}, relations:['tourPackage']})
      // Update the booking status to approved
      const profile = await this.UserRepository.findOne({ where: {uuid} });
      if (!profile) {
         throw new NotFoundException('user not found');
      }
      const totalprice  = booking.TotalPrice
      if(profile.Wallet>=totalprice){
         profile.Wallet -= totalprice
         await this.UserRepository.save(profile);
         booking.status = BookingStatus.ISSUE_IN_PROCESS;
         booking.Wallet =profile.Wallet
         booking.UpdatedAt = new Date()
         const updatedBooking = await this.bookingRepository.save(booking);
         await this.sendBookingApprovalToUser(updatedBooking);
      }
      else{
         throw new BadRequestException('Insufficient balance! please deposit to your wallet');
      }
      
    }


    async sendBookingApprovalToUser(booking: Booking) {
      const { Bookingid,TotalPrice, tourPackage, travelers } = booking;
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
      const book = await this.bookingRepository.findOne({ where: {Bookingid} });
      // Compose the email message
      const mailOptions = {
        from: 'flyfarladies@mailservice.center', // Replace with your email address
        to:book.Email, // Recipient's email address
        subject: 'Booking Paymnet confiramtion',
        text: `congrates!Have a great time`,
        html:`<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Booking Confirmation</title>
          </head>
          <body>
            <div style="width: 700px; height: 100vh; margin: 0 auto">
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
                      Booking Paymnet confiramtion
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
                      ${book.MainTitle}
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
                      ${book.SubTitle}
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
                      Booking Details
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
                      Booking ID
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
                      ${book.Bookingid}
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
                      Total Payable Amount
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
                      ${book.TotalPrice}
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
                      Paid Amount
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
                      ${book.TotalPrice}
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
                ></table>
        
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

   async FindAll(){
     const bookings= await this.bookingRepository.find({relations:[ 'tourPackage',
      'travelers']})
     return bookings;
   }
   
   async getBooking(Bookingid:string):Promise<Booking[]>{
    const bookedpackage = await this.bookingRepository.find({ where: { Bookingid },relations:[ 'tourPackage',
    'travelers']})
    return bookedpackage
  }
}
