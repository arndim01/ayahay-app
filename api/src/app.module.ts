import { Module } from '@nestjs/common';
import { BookingModule } from './booking/booking.module';
import { ConfigModule } from '@nestjs/config';
import { TripModule } from './trip/trip.module';
import { SearchModule } from './search/search.module';
import { PaymentModule } from './payment/payment.module';
import { PassengerModule } from './passenger/passenger.module';
import { MapperModule } from './mapper.module';
import { GlobalModule } from './global.module';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { PortModule } from './port/port.module';
import { ShippingLineModule } from './shipping-line/shipping-line.module';
import { CabinTypeModule } from './cabin-type/cabin-type.module';
import { VehicleTypeModule } from './vehicle-type/vehicle-type.module';
import { ShipModule } from './ship/ship.module';
import { CsvModule } from './csv/csv.module';
import { ReportingModule } from './reporting/reporting.module';
import { NotificationModule } from './notification/notification.module';
import { DisbursementModule } from './disbursement/disbursement.module';
import { EmailModule } from './email/email.module';
import { VoucherModule } from './voucher/voucher.module';
import { WebhookModule } from '@/webhook/webhook.module';
import { RateTableModule } from '@/rate-table/rate-table.module';
import { RateTableRowModule } from '@/rate-table-row/rate-table-row.module';
import { SeatPlanModule } from '@/seat-plan/seat-plan.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { ShippingRouteModule } from './shipping-line-route/shipping-line-route.module';
import { FormPreferencesModule } from './form-preferences/form-preferences.module';
import { BookingCutoffModule } from './preference/booking-cutoff.module';
import { PrismaModule } from './prisma.module'; // Update this import path
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ThumbnailModule } from './thumbnail/thumbnail.module';
import { HeaderSectionModule } from './header-section/header-section.module';
import { HeroSectionModule } from './hero-section/hero-section.module';
import { FooterSectionModule } from './footer-section/footer-section.module';
import { VoyageModule } from './voyage/voyage.module';
import { AboutUsModule } from './about-us/about-us.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { ThemeSettingsModule } from './theme-settings/theme-settings.module';
import { TermsAndConditionsModule } from './terms-and-conditions/terms-and-conditions.module';
import { BookingTripPassengerModule } from './booking-trip-passenger/booking-trip-passenger.module';
import { BookingTripVehicleModule } from './booking-trip-vehicle/booking-trip-vehicle.module';
import { FaqModule } from './faq/faq.module';
import { PressModule } from './press/press.module';
import { PrivacyPolicyModule } from './privacy-policy/privacy-policy.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BookingModule,
    SearchModule,
    TripModule,
    PaymentModule,
    PassengerModule,
    VehicleModule,
    MapperModule,
    GlobalModule,
    AccountModule,
    AuthModule,
    PortModule,
    ShippingLineModule,
    CabinTypeModule,
    VehicleTypeModule,
    ShipModule,
    CsvModule,
    ReportingModule,
    NotificationModule,
    DisbursementModule,
    EmailModule,
    VoucherModule,
    WebhookModule,
    RateTableModule,
    RateTableRowModule,
    SeatPlanModule,
    HealthCheckModule,
    ShippingRouteModule,
    FormPreferencesModule,
    BookingCutoffModule,
    PrismaModule,
    MaintenanceModule,
    ThumbnailModule,
    HeaderSectionModule,
    HeroSectionModule,
    FooterSectionModule,
    VoyageModule,
    AboutUsModule,
    ContactUsModule,
    ThemeSettingsModule,
    TermsAndConditionsModule,
    FaqModule,
    PressModule,
    PrivacyPolicyModule,
    BookingTripPassengerModule,
    BookingTripVehicleModule 
  ],
})
export class AppModule {}
