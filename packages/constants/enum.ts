export enum SEX {
  Male = 'Male',
  Female = 'Female',
}

export enum CIVIL_STATUS {
  Single = 'Single',
  Married = 'Married',
  Divorced = 'Divorced',
  Widowed = 'Widowed',
}

export enum BOOKING_TYPE {
  Single = 'Single Trip',
  Round = 'Round Trip',
  // Multiple = 'Multiple Trips',
}

export enum OCCUPATION {
  Student = 'Student',
  Employed = 'Employed',
  SelfEmployed = 'Self-Employed',
  Unemployed = 'Unemployed',
}

export enum ACCOUNT_ROLE {
  Passenger = 'Passenger',
  ShippingLineScanner = 'ShippingLineScanner',
  ShippingLineStaff = 'ShippingLineStaff',
  ShippingLineAdmin = 'ShippingLineAdmin',
  TravelAgencyStaff = 'TravelAgencyStaff',
  TravelAgencyAdmin = 'TravelAgencyAdmin',
  ClientStaff = 'ClientStaff',
  ClientAdmin = 'ClientAdmin',
  SuperAdmin = 'SuperAdmin',
}

export enum DISCOUNT_TYPE {
  Student = 'Student',
  Senior = 'Senior',
  PWD = 'PWD',
  Child = 'Child',
  Infant = 'Infant',
  Driver = 'Driver',
  Passes = 'Passes',
  Helper = 'Helper',
}

export enum TRIP_STATUS {
  Awaiting = 'Awaiting',
  Cancelled = 'Cancelled',
  Arrived = 'Arrived',
}

export enum BOOKING_STATUS {
  /**
   * Slot/capacity reserved already for this booking
   *
   * NOTE: Confirmed bookings may still have a
   * Pending payment status. These bookings will be automatically
   * cancelled after not receiving a payment after a time period
   * (this is not implemented yet)
   */
  Confirmed = 'Booking Confirmed',
  Cancelled = 'Booking Cancelled',
}

export enum PAYMENT_STATUS {
  None = 'Waiting for Payment',
  Pending = 'Processing Payment',
  Failed = 'Payment Failed',
  TimedOut = 'Payment Timed Out',
  Success = 'Payment Success',
}

export enum BOOKING_PAYMENT_ITEM_TYPE {
  Fare = 'Fare',
  AyahayMarkup = 'Ayahay Markup',
  VoucherDiscount = 'Voucher Discount',
  ThirdPartyMarkup = 'Third-Party Markup',
  CancellationRefund = 'Cancellation Refund',
  Commission = 'Commission',
  Miscellaneous = 'Miscellaneous',
}

export enum OPERATION_COSTS {
  FuelCosts = 'Fuel Costs',
  CrewWagesAndBenefits = 'Crew Wages and Benefits',
  MaintenanceAndRepairs = 'Maintenance and Repairs',
  PortFees = 'Port Fees',
  Insurance = 'Insurance',
  Utilities = 'Utilities',
  FoodAndCatering = 'Food and Catering',
  CleaningAndSupplies = 'Cleaning and Supplies',
  NavigationAndCommunication = 'Navigation and Communication',
  MarketingAndAdvertising = 'Marketing and Advertising',
  AdministrativeCosts = 'Administrative Costs',
  RegulatoryCompliance = 'Regulatory Compliance',
  Taxes = 'Taxes',
  EntertainmentAndActivities = 'Entertainment and Activities',
  OfficeSpaceAndUtilities = 'Office Space and Utilities',
  CommunicationCosts = 'Communication Costs',
  MarketingAndPromotion = 'Marketing and Promotion',
  TransactionFees = 'Transaction Fees',
  Training = 'Training',
  OfficeSupplies = 'Office Supplies',
  SecurityMeasures = 'Security Measures',
  // MaintenanceAndRepairs //#22 doble with #3
  // Insurance //#23 doble with #5
  Commissions = 'Commissions',
  CustomerSupportServices = 'Customer Support Services',
  ComplianceAndRegulatoryCosts = 'Compliance and Regulatory Costs', //#26 medj doble sa #12
  TechnologyUpgrades = 'Technology Upgrades',
  OnlineBooking = 'Online Booking',
}

export enum BOOKING_CANCELLATION_TYPE {
  // e.g. bad weather; 100% refund
  NoFault = "No One's Fault",
  // e.g. change of mind; 80% refund
  PassengersFault = "Passenger's Fault",
}

export enum WEBHOOK_TYPE {
  BOOKING_CREATE = 'On Booking Creation',
}
