import {
  Form,
  Spin,
  Steps,
  Grid,
  notification,
  Modal,
  Button,
  App,
  Input,
  InputNumber,
  DatePicker,
} from 'antd';
import styles from './createBookingForm.module.scss';
import { IBooking, IBookingTrip, ITrip } from '@ayahay/models';
import BookingInformationForm from '@/components/booking/BookingInformationForm';
import React, { useEffect, useState, useRef } from 'react';
import { DISCOUNT_TYPE, SEX } from '@ayahay/constants/enum';
import {
  createTentativeBooking,
  saveBookingInBrowser,
  requestBooking as _requestBooking,
} from '@/services/booking.service';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { useTripFromSearchParams } from '@/hooks/trip';
import { startPaymentForBooking } from '@/services/payment.service';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { getAxiosError } from '@ayahay/services/error.service';
import { FieldError } from '@ayahay/http';
import { getInitialPassengerFormValue } from '@ayahay/services/form.service';
import { computeAge, computeBirthday } from '@ayahay/services/date.service';
import dayjs from 'dayjs';
import { getShippingLines } from '@ayahay/services/shipping-line.service';
import EnumRadio from '@ayahay/components/form/EnumRadio';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import { RangePickerProps } from 'antd/es/date-picker';
import {
  getFormPreferences,
  IPassengerInformationField,
} from '@/services/form-preferences.service';

const { useBreakpoint } = Grid;

interface CreateBookingFormProps {
  onComplete: (booking: IBooking) => void;
}

const steps = [{ title: 'Booking Information' }, { title: 'Confirm Booking' }];

export default function CreateBookingForm({
  onComplete,
}: CreateBookingFormProps) {
  const { loggedInAccount, hasPrivilegedAccess } = useAuth();
  const { tripIds, trips } = useTripFromSearchParams();
  const { modal } = App.useApp();
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  const vehicles = Form.useWatch(
    ['bookingTrips', 0, 'bookingTripVehicles'],
    form
  );
  const passengers = Form.useWatch(
    ['bookingTrips', 0, 'bookingTripPassengers'],
    form
  );
  const paymentGateway = Form.useWatch('paymentGateway', form);
  const [firstTrip, setFirstTrip] = useState<ITrip>();
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [bookingPreview, setBookingPreview] = useState<IBooking>();
  const [currentStep, setCurrentStep] = useState(0);
  const [formPreferences, setFormPreferences] =
    useState<IPassengerInformationField[]>();

  // Add this ref to track if defaults have been applied
  const defaultAppliedRef = useRef<{ [index: number]: boolean }>({});

  useEffect(() => {
    loadFirstTrip();
  }, [trips]);

  useEffect(() => {
    if (formPreferences && firstTrip && passengers?.length > 0) {
      const firstPassenger = passengers[0].passenger;
      const hasEmptyFields =
        !firstPassenger?.firstName ||
        !firstPassenger?.lastName ||
        !firstPassenger?.sex ||
        !firstPassenger?.address;

      // Only apply defaults if not already applied for this passenger
      if (hasEmptyFields && !defaultAppliedRef.current[0]) {
        console.log(
          'Detected passenger with empty fields, applying default values'
        );
        applyDefaultValuesToPassenger(formPreferences, 0);
        defaultAppliedRef.current[0] = true;
      }
    }
  }, [formPreferences, firstTrip, passengers]);

  const loadFirstTrip = async () => {
    const trip = trips?.[0];
    if (trip === undefined) {
      return;
    }
    const shippingLines = await getShippingLines();
    const tripShippingLine = shippingLines?.find(
      ({ id }) => trip.shippingLineId === id
    );
    trip.availableSeatTypes = tripShippingLine?.seatTypes ?? [];
    setFirstTrip(trip);

    if (trip?.srcPort?.id && trip?.shippingLine?.id) {
      loadFormPreferences(trip.srcPort.id, trip.shippingLine.id);
    }
  };

  const loadFormPreferences = async (
    portId: number,
    shippingLineId: number
  ) => {
    const preferences = await getFormPreferences(portId, shippingLineId);
    if (preferences) {
      setFormPreferences(preferences.data);

      // Apply default values immediately after preferences are loaded
      if (preferences.data.length > 0 && form) {
        applyDefaultValuesToPassenger(preferences.data, 0);
      }
    }
  };

  const applyDefaultValuesToPassenger = (
    preferences: IPassengerInformationField[],
    passengerIndex: number
  ) => {
    const passengerPath = [
      'bookingTrips',
      0,
      'bookingTripPassengers',
      passengerIndex,
      'passenger',
    ];

    // Apply each preference that has a default value
    preferences.forEach((pref) => {
      if (pref.enabled && pref.defaultValue) {
        console.log(
          `Applying default value for ${pref.field}:`,
          pref.defaultValue
        );

        if (pref.field === 'sex') {
          // Convert string sex value to enum key
          const defaultSexValue =
            pref.defaultValue.charAt(0).toUpperCase() +
            pref.defaultValue.slice(1).toLowerCase();

          const enumKey = Object.entries(SEX).find(
            ([key, value]) => value === defaultSexValue
          )?.[0];

          if (enumKey) {
            form.setFieldValue([...passengerPath, pref.field], enumKey);
          }
        } else if (pref.field === 'dateOfBirth') {
          form.setFieldValue(
            [...passengerPath, 'birthdayIso'],
            dayjs(pref.defaultValue)
          );
        } else {
          form.setFieldValue([...passengerPath, pref.field], pref.defaultValue);
        }
      }
    });

    // Update form to ensure values are recognized
    form.validateFields([...passengerPath]);
  };

  const isFieldEnabled = (fieldName: string) => {
    if (!formPreferences) {
      return true;
    }
    const field = formPreferences.find((f) => f.field === fieldName);
    return field?.enabled ?? true;
  };

  const getFieldDefaultValue = (fieldName: string) => {
    if (!formPreferences) return undefined;
    const field = formPreferences.find((f) => f.field === fieldName);
    return field?.defaultValue;
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current > dayjs().endOf('day');
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const shareFirstPassengerInfoWithCompanions = () => {
    const booking = form.getFieldsValue(true);
    const firstBookingTrip = booking?.bookingTrips?.[0];
    if (!firstBookingTrip?.bookingTripPassengers?.length) return;

    const firstPassenger = firstBookingTrip.bookingTripPassengers[0]?.passenger;
    const firstPassengerAddress = firstPassenger?.address;
    const firstPassengerNationality = firstPassenger?.nationality;

    if (!firstPassengerAddress && !firstPassengerNationality) return;

    // Notify that information is being shared
    console.log(`Sharing first passenger information with companions`);

    // Set the address and nationality on all companions in the form
    for (let i = 1; i < firstBookingTrip.bookingTripPassengers.length; i++) {
      const addressPath = [
        'bookingTrips',
        0,
        'bookingTripPassengers',
        i,
        'passenger',
        'address',
      ];
      const nationalityPath = [
        'bookingTrips',
        0,
        'bookingTripPassengers',
        i,
        'passenger',
        'nationality',
      ];

      // Share address if available
      if (firstPassengerAddress) {
        const currentAddress = form.getFieldValue(addressPath);
        if (!currentAddress || currentAddress.trim() === '') {
          form.setFieldValue(addressPath, firstPassengerAddress);
        }
      }

      // Share nationality if available
      if (firstPassengerNationality) {
        const currentNationality = form.getFieldValue(nationalityPath);
        if (!currentNationality || currentNationality.trim() === '') {
          form.setFieldValue(nationalityPath, firstPassengerNationality);
        }
      }
    }
  };

  const onFieldsChange = (changedFields: any[], allFields: any[]) => {
    if (changedFields.some((field) => field.name.includes('voucherCode'))) {
      form.setFields([{ name: 'voucherCode', errors: [] }]);
    }

    // Watch for address or nationality changes on the first passenger
    const firstPassengerFieldChange = changedFields.find(
      (field) =>
        field.name.length > 4 &&
        field.name[0] === 'bookingTrips' &&
        field.name[2] === 'bookingTripPassengers' &&
        field.name[3] === 0 &&
        (field.name.includes('address') || field.name.includes('nationality'))
    );

    if (firstPassengerFieldChange) {
      // Share info with companions when first passenger's fields change
      shareFirstPassengerInfoWithCompanions();
    }

    // TODO: use onValuesChange, because onFieldsChange is called on validation for some reason
    const isFormValidating = changedFields.length > 1;
    if (!hasPrivilegedAccess || isFormValidating) {
      return;
    }

    const changedBirthdayField = changedFields.find((field) =>
      field.name.includes('birthdayIso')
    );
    if (changedBirthdayField !== undefined) {
      onBirthdayChange(changedBirthdayField);
    }

    const changedAgeField = changedFields.find((field) =>
      field.name.includes('age')
    );
    if (changedAgeField !== undefined) {
      onAgeChange(changedAgeField);
    }

    const changedNameField = changedFields.find(
      (field) =>
        field.name.length > 4 &&
        field.name[3] === 0 &&
        (field.name.includes('firstName') || field.name.includes('lastName'))
    );
    if (changedNameField && !form.isFieldTouched('consigneeName')) {
      setFirstPassengerAsConsignee();
    }
  };

  const onBirthdayChange = (changedField: any) => {
    const passengerFieldName = changedField.name.slice(0, -1);
    const ageFieldName = [...passengerFieldName, 'age'];
    const age = computeAge(changedField.value);

    form.setFieldValue(ageFieldName, age);
    form.setFields([{ name: ageFieldName, errors: [] }]);

    updateDiscountTypeOnAgeChange(changedField, age);
  };

  const onAgeChange = (changedField: any) => {
    const passengerFieldName = changedField.name.slice(0, -1);
    const age = changedField.value;
    const birthdayFieldName = [...passengerFieldName, 'birthdayIso'];
    const birthday = computeBirthday(
      age,
      form.getFieldValue(birthdayFieldName)
    );

    form.setFieldValue(birthdayFieldName, dayjs(birthday));
    form.setFields([{ name: birthdayFieldName, errors: [] }]);

    updateDiscountTypeOnAgeChange(changedField, age);
  };

  const updateDiscountTypeOnAgeChange = (changedField: any, age: number) => {
    const passengerFieldName = changedField.name.slice(0, -1);
    const discountTypeFieldName = [...passengerFieldName, 'discountType'];

    const discountType = getDiscountTypeFromAge(age);
    form.setFieldValue(discountTypeFieldName, discountType);
    form.setFields([{ name: discountTypeFieldName, errors: [] }]);
  };

  const setFirstPassengerAsConsignee = () => {
    const firstPassengerField = [
      'bookingTrips',
      0,
      'bookingTripPassengers',
      0,
      'passenger',
    ];
    const firstPassengerFirstName = form.getFieldValue([
      ...firstPassengerField,
      'firstName',
    ]);
    const firstPassengerLastName = form.getFieldValue([
      ...firstPassengerField,
      'lastName',
    ]);

    if (firstPassengerFirstName && firstPassengerLastName) {
      form.setFieldValue(
        'consigneeName',
        `${firstPassengerFirstName} ${firstPassengerLastName}`
      );
    }
  };

  const renderPassengerField = (
    name: any,
    fieldName: string,
    label: string,
    required: boolean = true
  ) => {
    const defaultValue = getFieldDefaultValue(fieldName);
    const isEnabled = isFieldEnabled(fieldName);

    // Always set default values if available, regardless of field enabled state
    if (defaultValue) {
      console.log(`Setting default value for ${fieldName}:`, defaultValue);

      const fieldPath = [...name, fieldName];

      // Only set if not already touched
      const isFieldTouched = form.isFieldTouched(fieldPath);
      if (!isFieldTouched) {
        setTimeout(() => {
          if (fieldName === 'sex') {
            // Convert string sex value to enum key
            const defaultSexValue =
              defaultValue.charAt(0).toUpperCase() +
              defaultValue.slice(1).toLowerCase();

            const enumKey = Object.entries(SEX).find(
              ([key, value]) => value === defaultSexValue
            )?.[0];

            if (enumKey) {
              form.setFieldValue(fieldPath, enumKey);
            }
          } else if (fieldName === 'dateOfBirth') {
            form.setFieldValue([...name, 'birthdayIso'], dayjs(defaultValue));
          } else {
            form.setFieldValue(fieldPath, defaultValue);
          }
        }, 0);
      }
    }

    if (!isEnabled) {
      return null;
    }

    switch (fieldName) {
      case 'firstName':
      case 'lastName':
      case 'address':
      case 'nationality':
        return (
          <Form.Item
            name={[...name, fieldName]}
            label={label}
            colon={false}
            rules={
              required && isEnabled
                ? [
                    {
                      required: true,
                      message: `Missing ${label.toLowerCase()}`,
                    },
                  ]
                : []
            }
            hidden={!isEnabled}
            initialValue={defaultValue}
          >
            <Input placeholder={label} />
          </Form.Item>
        );
      case 'sex':
        // Convert first letter to uppercase for the SEX enum
        const defaultSexValue = defaultValue
          ? defaultValue.charAt(0).toUpperCase() +
            defaultValue.slice(1).toLowerCase()
          : undefined;
        console.log('Sex field default value (normalized):', defaultSexValue);

        // Find the matching enum key
        const enumKey = defaultSexValue
          ? Object.entries(SEX).find(
              ([key, value]) => value === defaultSexValue
            )?.[0]
          : undefined;
        console.log('Found enum key:', enumKey);

        return (
          <Form.Item
            name={[...name, fieldName]}
            label={label}
            colon={false}
            rules={
              required && isEnabled
                ? [
                    {
                      required: true,
                      message: `Missing ${label.toLowerCase()}`,
                    },
                  ]
                : []
            }
            hidden={!isEnabled}
            initialValue={enumKey}
          >
            <EnumRadio
              _enum={SEX}
              // removed: disabled={!isEnabled || passengers?.[name[3]]?.passenger?.id > 0}
            />
          </Form.Item>
        );
      case 'dateOfBirth':
        return (
          <Form.Item
            name={[...name, 'birthdayIso']}
            label={label}
            colon={false}
            rules={
              required && isEnabled
                ? [{ required: true, message: `Missing ${label}` }]
                : []
            }
            hidden={!isEnabled}
            initialValue={defaultValue ? dayjs(defaultValue) : undefined}
          >
            <DatePicker
              // removed: disabled={!isEnabled || passengers?.[name[3]]?.passenger?.id > 0}
              format={DATE_FORMAT_LIST}
              placeholder={DATE_PLACEHOLDER}
              style={{ minWidth: '20%' }}
              disabledDate={disabledDate}
            />
          </Form.Item>
        );
      case 'age':
        return hasPrivilegedAccess ? (
          <Form.Item
            name={[...name, fieldName]}
            label={label}
            colon={false}
            hidden={!isEnabled}
            initialValue={defaultValue}
          >
            <InputNumber
              // removed: disabled={!isEnabled || passengers?.[name[3]]?.passenger?.id > 0}
              min={0}
              placeholder={label}
            />
          </Form.Item>
        ) : null;
      default:
        return null;
    }
  };

  const createTempBooking = async () => {
    setLoadingMessage(
      'Looking for available seats that match your preferences...'
    );

    if (trips === undefined) {
      onBookError('Trip is not defined');
      return;
    }

    const booking = form.getFieldsValue(true);
    const firstBookingTrip = booking.bookingTrips[0];

    // Make sure to copy address and nationality from first passenger to companions if needed
    if (firstBookingTrip?.bookingTripPassengers?.length > 0) {
      const firstPassenger =
        firstBookingTrip.bookingTripPassengers[0]?.passenger;
      const firstPassengerAddress = firstPassenger?.address;
      const firstPassengerNationality = firstPassenger?.nationality;

      // If the first passenger has values, copy them to any companions that have empty values
      for (let i = 1; i < firstBookingTrip.bookingTripPassengers.length; i++) {
        const companion = firstBookingTrip.bookingTripPassengers[i]?.passenger;
        if (companion) {
          // Copy address if missing
          if (
            firstPassengerAddress &&
            (!companion.address || companion.address.trim() === '')
          ) {
            console.log(`Copying address to companion ${i}`);
            companion.address = firstPassengerAddress;
          }

          // Copy nationality if missing
          if (
            firstPassengerNationality &&
            (!companion.nationality || companion.nationality.trim() === '')
          ) {
            console.log(`Copying nationality to companion ${i}`);
            companion.nationality = firstPassengerNationality;
          }
        }
      }
    }

    // add succeeding round/multiple trips from first trip
    for (let i = 1; i < trips.length; i++) {
      const succeedingTrip = trips[i];
      const succeedingBookingTrip = JSON.parse(
        JSON.stringify(firstBookingTrip)
      ) as IBookingTrip;
      succeedingBookingTrip.tripId = succeedingTrip.id;
      succeedingBookingTrip.bookingTripPassengers?.forEach(
        (tripPassenger) => (tripPassenger.tripId = succeedingTrip.id)
      );
      succeedingBookingTrip.bookingTripVehicles?.forEach(
        (tripVehicle) => (tripVehicle.tripId = succeedingTrip.id)
      );

      // if an old booking trip exists (e.g. user edits the booking after confirmation screen)
      // override it
      if (i < booking.bookingTrips.length) {
        booking.bookingTrips[i] = succeedingBookingTrip;
      } else {
        booking.bookingTrips.push(succeedingBookingTrip);
      }
    }

    try {
      const tentativeBooking = await createTentativeBooking(booking);
      setBookingPreview(tentativeBooking);
      nextStep();
    } catch (e: any) {
      onBookError(e);
    }

    setLoadingMessage('');
  };

  const onBookError = (e: any) => {
    const axiosError = getAxiosError<FieldError[]>(e);

    if (axiosError === undefined || axiosError.statusCode !== 400) {
      console.error(e);
      notification.error({
        message: 'Could not find a booking',
        description:
          'There seems to be an issue with finding a booking. Please try again in a few minutes or contact us at it@ayahay.com for assistance.',
      });
    } else {
      const fieldErrors = axiosError.message;
      form.setFields(
        fieldErrors.map((error) => ({
          name: error.fieldName,
          errors: [error.message],
        }))
      );
      notification.error({
        message: 'Something went wrong.',
        description: `There might be required fields that are empty or the trip you're booking is outdated. Contact us at help@ayahay.com for assistance if necessary.`,
        duration: 10,
      });
    }
  };

  const requestBooking = async (tentativeBookingId: number): Promise<void> => {
    setLoadingMessage('Creating booking request...');

    const contactEmail = form.getFieldValue('contactEmail');
    const createdBooking = await _requestBooking(
      tentativeBookingId,
      contactEmail
    );

    setLoadingMessage('');
    if (createdBooking === undefined) {
      onStartPaymentError();
      return;
    }

    // TODO: save in booking request browser cache

    informBookingRequested(createdBooking.id);
  };

  const informBookingRequested = (bookingId: string) => {
    const redirectUrl = `/bookings/requests/${bookingId}`;
    const partnerName =
      firstTrip?.shippingLine?.name ?? 'our partner shipping line';

    modal.info({
      width: 'min(90vw, 512px)',
      centered: true,
      title: `Booking Requested`,
      icon: <InfoCircleOutlined />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p>
            A booking has been successfully requested. Please wait for&nbsp;
            {partnerName} to process your request.
          </p>
          <p>
            You can keep track of the status of your booking request in the link
            below:
          </p>
          <Button type='link' href={redirectUrl} target='_blank'>
            View Booking Request
          </Button>
        </div>
      ),
      okText: 'Book Again',
      onOk: () => window.location.reload(),
    });
  };

  const payBooking = async (tentativeBookingId: number): Promise<void> => {
    setLoadingMessage('Initiating payment...');

    const response = await startPaymentForBooking(tentativeBookingId, {
      paymentGateway,
    });

    setLoadingMessage('');
    if (response === undefined) {
      onStartPaymentError();
      return;
    }

    if (!loggedInAccount) {
      saveBookingInBrowser(response.paymentReference);
    }
    informPaymentInitiation(
      response.paymentReference,
      vehicles?.length > 0,
      response.redirectUrl
    );
    window.open(response.redirectUrl);
  };

  const informPaymentInitiation = (
    transactionId: string,
    hasVehicle: boolean,
    redirectUrl: string
  ) => {
    modal.info({
      width: 'min(90vw, 512px)',
      centered: true,
      title: `You will be redirected to the secure ${paymentGateway} Payment Gateway to pay for your booking.`,
      icon: <InfoCircleOutlined />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {hasVehicle && (
            <p style={{ fontSize: '16px' }}>
              <strong>
                IMPORTANT: PLEASE PRINT AND BRING THREE (3) COPIES OF THE BILL
                OF LADING (BOL) AFTER PAYMENT CONFIRMATION.
              </strong>
            </p>
          )}
          <p>
            You can safely close this tab or book again by clicking the button
            below.
          </p>
          <p>
            For any concerns, please email us at it@ayahay.com with the subject
            header:
          </p>
          <p>
            <strong>Booking {transactionId.toUpperCase()}</strong>
          </p>
          <Button type='link' href={redirectUrl} target='_blank'>
            I was not redirected
          </Button>
        </div>
      ),
      okText: 'Book Again',
      onOk: () => window.location.reload(),
    });
  };

  const onStartPaymentError = () => {
    notification.error({
      message: 'Something went wrong.',
      description:
        'There seems to be an issue with the payment. Please try again in a few minutes or contact us at help@ayahay.com for assistance.',
    });
  };

  const items = steps.map(({ title }) => ({ key: title, title: title }));
  const stepDirection = screens.md ? 'horizontal' : 'vertical';

  return (
    <Form
      form={form}
      id={styles['create-booking-form']}
      initialValues={{
        bookingTrips: [
          {
            tripId: tripIds[0],
            passengerId: 0,
            bookingTripPassengers: [
              getInitialPassengerFormValue(tripIds[0], 0),
            ],
            bookingTripVehicles: [],
          },
        ],
        paymentGateway: 'PayMongo',
        bookingType: 'Single',
      }}
      onFieldsChange={onFieldsChange}
    >
      <Steps
        current={currentStep}
        items={items}
        direction={stepDirection}
        labelPlacement={stepDirection}
      />
      <Spin spinning={loadingMessage?.length > 0} tip={loadingMessage}>
        <div
          style={{
            display:
              steps[currentStep].title === 'Booking Information'
                ? 'block'
                : 'none',
          }}
        >
          <BookingInformationForm
            trip={firstTrip}
            onNextStep={createTempBooking}
            onPreviousStep={previousStep}
          />
        </div>
        <div
          style={{
            display:
              steps[currentStep].title === 'Confirm Booking' ? 'block' : 'none',
          }}
        >
          <BookingConfirmation
            tentativeBooking={bookingPreview}
            hasPrivilegedAccess={hasPrivilegedAccess}
            onPreviousStep={previousStep}
            onRequestBooking={requestBooking}
            onStartPayment={payBooking}
          />
        </div>
      </Spin>
    </Form>
  );
}

const getDiscountTypeFromAge = (age: number): DISCOUNT_TYPE | undefined => {
  if (age >= 60) {
    return DISCOUNT_TYPE.Senior;
  }

  if (age >= 18) {
    return undefined;
  }

  if (age >= 12) {
    return DISCOUNT_TYPE.Student;
  }

  if (age >= 3) {
    return DISCOUNT_TYPE.Child;
  }

  return DISCOUNT_TYPE.Infant;
};
