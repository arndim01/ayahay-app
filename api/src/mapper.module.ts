import { Module } from '@nestjs/common';
import { ShippingLineMapper } from './shipping-line/shipping-line.mapper';
import { PortMapper } from './port/port.mapper';
import { TripMapper } from './trip/trip.mapper';
import { BookingMapper } from './booking/booking.mapper';
import { PassengerMapper } from './passenger/passenger.mapper';
import { AccountMapper } from './account/account.mapper';
import { VehicleMapper } from './vehicle/vehicle.mapper';
import { CabinMapper } from './cabin/cabin.mapper';
import { PaymentMapper } from './payment/payment.mapper';
import { SearchMapper } from './search/search.mapper';
import { ShipMapper } from './ship/ship.mapper';
import { ReportingMapper } from './reporting/reporting.mapper';
import { NotificationMapper } from './notification/notification.mapper';
import { DisbursementMapper } from './disbursement/disbursement.mapper';
import { VoucherMapper } from './voucher/voucher.mapper';
import { WebhookMapper } from '@/webhook/webhook.mapper';
import { RateTableMapper } from '@/rate-table/rate-table.mapper';
import { RateTableRowMapper } from '@/rate-table-row/rate-table-row.mapper';
import { TravelAgencyMapper } from '@/travel-agency/travel-agency.mapper';
import { SeatPlanMapper } from '@/seat-plan/seat-plan.mapper';
import { ReceiptMapper } from './receipt/receipt.mapper';
import { ItineraryMapper } from './itinerary/itinerary.mapper';
import { BolMapper } from './bol/bol.mapper';
import { ThumbnailMapper } from '@/thumbnail/thumbnail.mapper';
import { HeaderSectionMapper } from './header-section/header-section.mapper';
import { HeroSectionMapper } from '@/hero-section/hero-section.mapper';
import { FooterSectionMapper } from '@/footer-section/footer-section.mapper';
import { AboutUsMapper } from '@/about-us/about-us.mapper';
import { ContactUsMapper } from '@/contact-us/contact-us.mapper';
import { ThemeSettingsMapper } from './theme-settings/theme-settings.mapper';
import { FaqMapper } from './faq/faq.mapper';
import { PressMapper } from './press/press.mapper';
import { PrivacyPolicyMapper } from './privacy-policy/privacy-policy.mapper';

@Module({
  providers: [
    TripMapper,
    ShippingLineMapper,
    PortMapper,
    BookingMapper,
    PassengerMapper,
    AccountMapper,
    VehicleMapper,
    CabinMapper,
    PaymentMapper,
    SearchMapper,
    ShipMapper,
    ReportingMapper,
    NotificationMapper,
    DisbursementMapper,
    VoucherMapper,
    WebhookMapper,
    RateTableMapper,
    RateTableRowMapper,
    TravelAgencyMapper,
    SeatPlanMapper,
    ReceiptMapper,
    ItineraryMapper,
    BolMapper,
    ThumbnailMapper,
    HeaderSectionMapper,
    HeroSectionMapper,
    FooterSectionMapper,
    AboutUsMapper,
    ContactUsMapper,
    ThemeSettingsMapper,
    FaqMapper,
    PressMapper,
    PrivacyPolicyMapper,
  ],
  exports: [
    TripMapper,
    ShippingLineMapper,
    PortMapper,
    BookingMapper,
    PassengerMapper,
    AccountMapper,
    VehicleMapper,
    CabinMapper,
    PaymentMapper,
    SearchMapper,
    ShipMapper,
    ReportingMapper,
    NotificationMapper,
    DisbursementMapper,
    VoucherMapper,
    WebhookMapper,
    RateTableMapper,
    RateTableRowMapper,
    TravelAgencyMapper,
    SeatPlanMapper,
    ReceiptMapper,
    ItineraryMapper,
    BolMapper,
    ThumbnailMapper,
    HeaderSectionMapper,
    HeroSectionMapper,
    FooterSectionMapper,
    AboutUsMapper,
    ContactUsMapper,
    ThemeSettingsMapper,
    FaqMapper,
    PressMapper,
    PrivacyPolicyMapper,
  ],
})
export class MapperModule {}
