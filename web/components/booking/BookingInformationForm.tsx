import React, { useEffect, useState, ReactElement } from 'react';
import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Typography,
  FormItemProps,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { InputNumberProps } from 'antd/es/input-number';
import type { DatePickerProps } from 'antd/es/date-picker';
import { DISCOUNT_TYPE, SEX } from '@ayahay/constants/enum';
import { IPassenger, ITrip, IVehicle } from '@ayahay/models';
import EnumRadio from '@ayahay/components/form/EnumRadio';
import AddCompanionsModal from '@/components/booking/AddCompanionsModal';
import AddVehiclesModal from '@/components/booking/AddVehiclesModal';
import {
  getInitialPassengerFormValue,
  getInitialVehicleFormValue,
  toPassengerFormValue,
} from '@ayahay/services/form.service';
import { useAuth } from '@/contexts/AuthContext';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import dayjs from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';
import {
  getFormPreferences,
  IPassengerInformationField,
} from '@/services/form-preferences.service';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface BookingInformationFormProps {
  trip: ITrip;
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

const isSexEnum = (value: string): value is SEX => {
  return Object.values(SEX).includes(value as SEX);
};

export default function BookingInformationForm({
  trip,
  onNextStep,
  onPreviousStep,
}: BookingInformationFormProps): ReactElement {
  const { loggedInAccount, hasPrivilegedAccess } = useAuth();
  const form = Form.useFormInstance();
  const passengers = Form.useWatch(
    ['bookingTrips', 0, 'bookingTripPassengers'],
    form
  );
  const vehicles = Form.useWatch(
    ['bookingTrips', 0, 'bookingTripVehicles'],
    form
  );
  const [companionModalOpen, setCompanionModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [newEntityId, setNewEntityId] = useState(-1);
  const vehicleRates = trip?.rateTable?.rows?.filter((row) => row.vehicleType);
  const canBookVehicles = vehicleRates?.length;
  const [formPreferences, setFormPreferences] =
    useState<IPassengerInformationField[]>();

  useEffect(() => {
    if (trip) {
      loadFormPreferences();
    }
  }, [trip]);

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }

    if (loggedInAccount) {
      insertPassengerAtFirstIndex(loggedInAccount.passenger);
    } else {
      removeAllCompanions();
      removeAllRegisteredVehicles();
    }
  }, [loggedInAccount]);

  useEffect(() => {
    if (formPreferences) {
      // Set initial values for all fields based on preferences
      formPreferences.forEach((field) => {
        if (field.defaultValue) {
          // Always set the default value if it exists, regardless of enabled status
          const fieldPath = [
            'bookingTrips',
            0,
            'bookingTripPassengers',
            0,
            'passenger',
            field.field,
          ];

          // Special handling for sex field to ensure it works with EnumRadio
          if (field.field === 'sex') {
            // Convert first letter to uppercase for the SEX enum
            const sexValue =
              field.defaultValue.charAt(0).toUpperCase() +
              field.defaultValue.slice(1).toLowerCase();

            // Find the matching enum key
            const enumKey = Object.entries(SEX).find(
              ([key, value]) => value === sexValue
            )?.[0];

            if (enumKey) {
              form.setFields([
                {
                  name: fieldPath,
                  value: enumKey,
                  touched: false,
                  validating: false,
                },
              ]);
            } else {
              console.warn(
                `Invalid sex value: ${sexValue}. Must be one of: ${Object.values(
                  SEX
                ).join(', ')}`
              );
            }
          } else {
            form.setFields([
              {
                name: fieldPath,
                value: field.defaultValue,
                touched: false,
                validating: false,
              },
            ]);
          }
        }
      });
    }
  }, [formPreferences]);

  const loadFormPreferences = async () => {
    if (!trip?.srcPort?.id || !trip?.shippingLine?.id) {
      // console.log('Missing required IDs for form preferences');
      return;
    }

    const portId = trip.srcPort.id;
    const shippingLineId = trip.shippingLine.id;

    try {
      const preferences = await getFormPreferences(portId, shippingLineId);

      if (preferences) {
        setFormPreferences(preferences.data);
      } else {
        // console.log('No form preferences found for:', {
        //   portId,
        //   shippingLineId,
        // });
      }
    } catch (error) {
      console.error('Error loading form preferences:', error);
      // Form will use default preferences from the service
    }
  };

  const isFieldEnabled = (fieldName: string) => {
    if (!formPreferences) {
      // console.log(
      //   `No preferences found for ${fieldName}, defaulting to enabled`
      // );
      return true;
    }
    const field = formPreferences.find((f) => f.field === fieldName);
    const enabled = field?.enabled ?? true;
    return enabled;
  };

  const getFieldDefaultValue = (fieldName: string) => {
    if (!formPreferences) return undefined;
    const field = formPreferences.find((f) => f.field === fieldName);
    if (field?.defaultValue) {
      // console.log(`Using default value for ${fieldName}:`, field.defaultValue);
    }
    return field?.defaultValue;
  };

  const tripNamePath = ['bookingTrips', 0];

  const insertPassengerAtFirstIndex = (passenger?: IPassenger) => {
    if (passenger === undefined || passengers === undefined) {
      return;
    }

    if (passengers.length === 1 && passengers[0].firstName === undefined) {
      form.setFieldValue(
        [...tripNamePath, 'bookingTripPassengers', 0],
        toPassengerFormValue(trip.id, passenger)
      );
      return;
    }

    const newPassengerOrder = [passenger];

    for (const currentPassenger of passengers) {
      newPassengerOrder.push(currentPassenger);
    }

    form.resetFields();

    for (let i = 0; i < newPassengerOrder.length; i++) {
      form.setFieldValue(
        [...tripNamePath, 'bookingTripPassengers', i],
        toPassengerFormValue(trip.id, newPassengerOrder[i])
      );
    }
  };

  const removeAllCompanions = () => {
    if (passengers === undefined || passengers.length === 0) {
      return;
    }

    const nonCompanions = [];

    for (const passenger of passengers) {
      if (passenger.id <= 0) {
        nonCompanions.push(passenger);
      }
    }

    form.resetFields();

    for (let i = 0; i < nonCompanions.length; i++) {
      form.setFieldValue(
        [...tripNamePath, 'bookingTripPassengers', i, 'passenger'],
        nonCompanions[i]
      );
    }
  };

  const removeAllRegisteredVehicles = () => {
    if (vehicles === undefined || vehicles.length === 0) {
      return;
    }

    const nonRegisteredVehicles = [];

    for (const vehicle of vehicles) {
      if (vehicle.id <= 0) {
        nonRegisteredVehicles.push(vehicle);
      }
    }

    form.resetFields();

    for (let i = 0; i < nonRegisteredVehicles.length; i++) {
      form.setFieldValue(
        [...tripNamePath, 'bookingTripVehicles', i, 'vehicle'],
        nonRegisteredVehicles[i]
      );
    }
  };

  const addCompanions = (companions: IPassenger[]) => {
    setCompanionModalOpen(false);
    let nextIndex = passengers.length;
    companions.forEach((companion) => {
      form.setFieldValue(
        [...tripNamePath, 'bookingTripPassengers', nextIndex],
        toPassengerFormValue(trip.id, companion)
      );
      nextIndex++;
    });
  };

  const addRegisteredVehicles = (registeredVehicles: IVehicle[]) => {
    setVehicleModalOpen(false);
    let nextIndex = vehicles.length;
    registeredVehicles.forEach((vehicle) => {
      form.setFieldValue([...tripNamePath, 'bookingTripVehicles', nextIndex], {
        tripId: trip.id,
        vehicleId: vehicle.id,
        vehicle,
      });
      nextIndex++;
    });
  };

  const addNewPassenger = (addFn: any) => {
    const newPassenger = {
      preferredCabinId: undefined, // Ensure preferredCabinId is included
      ...getInitialPassengerFormValue(trip.id, newEntityId),
    };
    addFn(newPassenger);
    setNewEntityId(newEntityId - 1);
  };

  const addNewVehicle = (addFn: any) => {
    const newVehicle = getInitialVehicleFormValue(trip.id, newEntityId);
    addFn(newVehicle);
    setNewEntityId(newEntityId - 1);
  };

  const validateFieldsInCurrentStep = async () => {
    if (passengers === undefined || vehicles === undefined) {
      return;
    }
    try {
      // Only validate enabled fields
      const enabledFields = [
        'firstName',
        'lastName',
        'sex',
        'dateOfBirth',
        'age',
        'address',
        'nationality',
      ].filter((field) => isFieldEnabled(field));
  
      const namePaths: (string | number)[][] = [
        ...enabledFields.map((field) => [
          ...tripNamePath,
          'bookingTripPassengers',
          0,
          'passenger',
          field,
        ]),
        [...tripNamePath, 'bookingTripPassengers', 0, 'preferredCabinId'],
        [...tripNamePath, 'bookingTripVehicles'],
        ['voucherCode'],
        ['contactEmail'],
        ['contactMobile'],
        ['consigneeName'],
      ];
  
      await form.validateFields(namePaths, { recursive: true });
  
      if (onNextStep) {
        onNextStep();
      }
    } catch (formErrors) {
      console.error('Form validation errors:', formErrors);
    }
  };

  const openLoginModal = () => {
    const accountBtn: HTMLButtonElement | null =
      document.querySelector('#account-btn');
    accountBtn?.click();
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current > dayjs().endOf('day');
  };

  const atLeastOnePassengerOrVehicleValidator = (
    _: any,
    __: any
  ): Promise<void> => {
    if (passengers === undefined || vehicles === undefined) {
      return Promise.reject();
    }

    if (passengers.length === 0 && vehicles.length === 0) {
      return Promise.reject();
    }

    return Promise.resolve();
  };

  const renderPassengerField = (
    name: any,
    fieldName: string,
    label: string,
    required: boolean = true
  ): ReactElement | null => {
    const defaultValue = getFieldDefaultValue(fieldName);
    const isEnabled = isFieldEnabled(fieldName);

    if (!isEnabled) {
      // console.log(
      //   `Field ${fieldName} is disabled, setting default value if available`
      // );
    }

    switch (fieldName) {
      case 'firstName':
      case 'lastName':
      case 'address':
      case 'nationality':
        return (
          <Form.Item
            key={`${name.join('-')}-${fieldName}`}
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
            <Input
              disabled={!isEnabled || passengers?.[name[3]]?.passenger?.id > 0}
              placeholder={label}
            />
          </Form.Item>
        );
      case 'sex':
        // Convert first letter to uppercase for the SEX enum
        const defaultSexValue = defaultValue
          ? defaultValue.charAt(0).toUpperCase() +
            defaultValue.slice(1).toLowerCase()
          : undefined;

        // Find the matching enum key
        const enumKey = defaultSexValue
          ? Object.entries(SEX).find(
              ([key, value]) => value === defaultSexValue
            )?.[0]
          : undefined;

        return (
          <Form.Item
            key={`${name.join('-')}-${fieldName}`}
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
              disabled={!isEnabled || passengers?.[name[3]]?.passenger?.id > 0}
            />
          </Form.Item>
        );
      case 'dateOfBirth':
        return (
          <Form.Item
            key={`${name.join('-')}-${fieldName}`}
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
              disabled={!isEnabled || passengers?.[name[3]]?.passenger?.id > 0}
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
            key={`${name.join('-')}-${fieldName}`}
            name={[...name, fieldName]}
            label={label}
            colon={false}
            hidden={!isEnabled}
            initialValue={defaultValue}
          >
            <InputNumber<string>
              disabled={!isEnabled || passengers?.[name[3]]?.passenger?.id > 0}
              min='0'
              placeholder={label}
            />
          </Form.Item>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      <Title level={2}>Booking Information</Title>
      {loggedInAccount === undefined && (
        <Button
          type='link'
          onClick={() => openLoginModal()}
          style={{ whiteSpace: 'normal' }}
        >
          Have an account? Log in to book faster.
        </Button>
      )}
      <Form.List
        name={['bookingTrips', 0, 'bookingTripPassengers']}
        rules={[
          {
            message: 'Please add a passenger',
            validator: atLeastOnePassengerOrVehicleValidator,
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key}>
                {index === 0 && <Divider>Your Information</Divider>}
                {index > 0 && <Divider>Companion {index} Information</Divider>}
                {renderPassengerField(
                  [name, 'passenger'],
                  'firstName',
                  'First Name'
                )}
                {renderPassengerField(
                  [name, 'passenger'],
                  'lastName',
                  'Last Name'
                )}
                {renderPassengerField([name, 'passenger'], 'sex', 'Sex')}
                {renderPassengerField(
                  [name, 'passenger'],
                  'dateOfBirth',
                  'Date of Birth'
                )}
                {renderPassengerField([name, 'passenger'], 'age', 'Age')}
                {renderPassengerField(
                  [name, 'passenger'],
                  'address',
                  'Address'
                )}
                {renderPassengerField(
                  [name, 'passenger'],
                  'nationality',
                  'Nationality'
                )}
                <Form.Item
                  {...restField}
                  name={[name, 'preferredCabinId']} // Ensure it is stored correctly
                  label="Preferred Cabin"
                  colon={false}
                >
                  <Radio.Group>
                    <Radio value={undefined}>Any</Radio>
                    {trip?.availableCabins?.map(({ cabin }) => (
                      <Radio value={cabin?.id} key={cabin?.id}>
                        {cabin?.cabinType?.name}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
                {trip?.availableSeatTypes?.length && (
                  <Form.Item
                    {...restField}
                    name={[name, 'passenger', 'preferredSeatTypeId']}
                    label='Preferred Seat'
                    colon={false}
                  >
                    <Radio.Group>
                      <Radio value={undefined}>Any</Radio>
                      {trip?.availableSeatTypes?.map((seatType) => (
                        <Radio value={seatType?.id} key={seatType?.id}>
                          {seatType?.name}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                )}
                {hasPrivilegedAccess && (
                  <EnumRadio
                    _enum={DISCOUNT_TYPE}
                    nullChoiceLabel={'Adult'}
                    {...restField}
                    name={[name, 'passenger', 'discountType']}
                    label='Discount Type'
                    colon={false}
                  />
                )}
                {!hasPrivilegedAccess && vehicles?.length > 0 && (
                  <Form.Item
                    {...restField}
                    name={[name, 'drivesVehicleId']}
                    label='Driver of Vehicle'
                    colon={false}
                    rules={[
                      ({ getFieldValue }) => ({
                        async validator(_, value) {
                          const passengerId = getFieldValue([
                            'bookingTrips',
                            0,
                            'bookingTripPassengers',
                            name,
                            'passenger',
                            'id',
                          ]);
                          const drivesSameVehicle = passengers.find(
                            ({ drivesVehicleId, passenger }) =>
                              value &&
                              drivesVehicleId === value &&
                              passenger.id !== passengerId
                          );
                          const allVehiclesDriven = vehicles.every(
                            ({ vehicleId }) =>
                              passengers.some(
                                ({ drivesVehicleId }) =>
                                  drivesVehicleId === vehicleId
                              )
                          );
                          if (drivesSameVehicle) {
                            return Promise.reject(
                              'A vehicle can only be driven by one passenger.'
                            );
                          }
                          if (!value && !allVehiclesDriven) {
                            return Promise.reject('Please select a vehicle.');
                          }
                        },
                      }),
                    ]}
                  >
                    <Radio.Group>
                      <Radio value={undefined}>None</Radio>
                      {vehicles.map(({ vehicle }) => (
                        <Radio value={vehicle.id} key={vehicle.id}>
                          {vehicle.plateNo}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                )}
                {(hasPrivilegedAccess || index !== 0) && (
                  <Button
                    danger
                    style={{ float: 'right' }}
                    onClick={() => remove(name)}
                  >
                    Remove Passenger
                  </Button>
                )}
              </div>
            ))}

            {passengers?.length === 0 && vehicles?.length === 0 && (
              <p>
                <Text type='danger'>
                  At least one passenger or vehicle is required.
                </Text>
              </p>
            )}

            <Button type='dashed' onClick={() => addNewPassenger(add)} block>
              Add Companion
            </Button>
            {loggedInAccount &&
              loggedInAccount.passenger &&
              loggedInAccount.passenger.companions &&
              loggedInAccount.passenger.companions.length > 0 && (
                <Button
                  type='dashed'
                  onClick={() => setCompanionModalOpen(true)}
                  block
                >
                  Add Travel Buddies
                </Button>
              )}
            {loggedInAccount &&
              loggedInAccount.passenger &&
              loggedInAccount.passenger.companions &&
              loggedInAccount.passenger.companions.length > 0 && (
                <AddCompanionsModal
                  open={companionModalOpen}
                  companions={loggedInAccount.passenger.companions}
                  onSubmitCompanions={addCompanions}
                  onCancel={() => setCompanionModalOpen(false)}
                />
              )}
          </>
        )}
      </Form.List>
      <Form.List
        name={['bookingTrips', 0, 'bookingTripVehicles']}
        rules={[
          {
            message: 'Please add a vehicle',
            validator: atLeastOnePassengerOrVehicleValidator,
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key}>
                <Divider>Vehicle {index + 1} Information</Divider>
                <Form.Item
                  {...restField}
                  name={[name, 'vehicle', 'plateNo']}
                  label='Plate Number'
                  colon={false}
                  rules={[{ required: true, message: 'Missing plate number' }]}
                >
                  <Input
                    disabled={vehicles?.[index]?.vehicle?.id > 0}
                    placeholder='Plate Number'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'vehicle', 'modelName']}
                  label='Model Name'
                  colon={false}
                  rules={[{ required: true, message: 'Missing model name' }]}
                >
                  <Input
                    disabled={vehicles?.[index]?.vehicle?.id > 0}
                    placeholder='Toyota Innova, Lexus GX'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'vehicle', 'vehicleTypeId']}
                  label='Model Body'
                  colon={false}
                  rules={[
                    {
                      required: true,
                      message: 'Missing model body',
                    },
                  ]}
                >
                  <Select
                    showSearch
                    optionFilterProp='children'
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    disabled={vehicles?.[index]?.vehicle?.id > 0}
                    placeholder='Select an option...'
                    options={vehicleRates
                      ?.filter(
                        (rate) => hasPrivilegedAccess || rate.canBookOnline
                      )
                      ?.map(({ vehicleType, fare }) => ({
                        label: `${vehicleType?.name} · P${fare}`,
                        value: vehicleType?.id,
                      }))}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'vehicle', 'certificateOfRegistrationUrl']}
                  hidden={true}
                >
                  <Input
                    disabled={vehicles?.[index]?.vehicle?.id > 0}
                    placeholder='Certificate of Registration'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'vehicle', 'officialReceiptUrl']}
                  hidden={true}
                >
                  <Input
                    disabled={vehicles?.[index]?.vehicle?.id > 0}
                    placeholder='Official Receipt URL'
                  />
                </Form.Item>
                <Button
                  danger
                  style={{ float: 'right' }}
                  onClick={() => remove(name)}
                >
                  Remove Vehicle
                </Button>
              </div>
            ))}

            {canBookVehicles && (
              <Button type='dashed' onClick={() => addNewVehicle(add)} block>
                Add Vehicle/Cargo
              </Button>
            )}
            {loggedInAccount &&
              loggedInAccount.vehicles &&
              loggedInAccount.vehicles.length > 0 && (
                <Button
                  type='dashed'
                  onClick={() => setVehicleModalOpen(true)}
                  block
                >
                  Add Registered Vehicle
                </Button>
              )}
            {loggedInAccount &&
              loggedInAccount.vehicles &&
              loggedInAccount.vehicles.length > 0 && (
                <AddVehiclesModal
                  open={vehicleModalOpen}
                  vehicles={loggedInAccount.vehicles}
                  onSubmitVehicles={addRegisteredVehicles}
                  onCancel={() => setVehicleModalOpen(false)}
                />
              )}
          </>
        )}
      </Form.List>
      <div style={{ marginTop: '24px' }}>
        {!loggedInAccount && (
          <div>
            <Divider>Contact Information</Divider>
            <Form.Item
              name='contactEmail'
              label='Email Address'
              colon={false}
              rules={[
                { required: true, type: 'email', message: 'Missing email' },
              ]}
            >
              <Input
                placeholder='john@example.com'
                type='email'
                style={{ width: 256 }}
              />
            </Form.Item>
            <Form.Item
              name='contactMobile'
              label='Mobile Number'
              colon={false}
              rules={[{ required: true, message: 'Missing mobile number' }]}
            >
              <Input
                placeholder='09171234567'
                type='tel'
                style={{ width: 256 }}
              />
            </Form.Item>
          </div>
        )}
        <Divider>Other Information</Divider>

        {vehicles?.length > 0 && (
          <div>
            <Form.Item
              name='consigneeName'
              label='Consignee'
              colon={false}
              rules={[{ required: true, message: 'Missing consignee' }]}
            >
              {passengers.length > 0 && (
                <Radio.Group>
                  {passengers.map(({ passenger }: any) => (
                    <Radio
                      value={`${passenger?.firstName} ${passenger?.lastName}`}
                    >
                      {`
                        ${passenger?.firstName ?? ''} 
                        ${passenger?.lastName ?? ''}
                      `}
                    </Radio>
                  ))}
                </Radio.Group>
              )}
              {passengers.length === 0 && (
                <Input type='text' style={{ width: 256 }} />
              )}
            </Form.Item>
          </div>
        )}
        {hasPrivilegedAccess && (
          <Form.Item name='voucherCode' label='Special Voucher' colon={false}>
            <Radio.Group>
              <Radio value=''>None</Radio>
              <Radio value='COLLECT_BOOKING'>Collect Voucher</Radio>
            </Radio.Group>
          </Form.Item>
        )}

        <Form.Item label='Voucher Code' name='voucherCode' colon={false}>
          <Input />
        </Form.Item>

        {hasPrivilegedAccess && (
          <div>
            <Form.Item name='remarks' label='Remarks' colon={false}>
              <TextArea rows={3} />
            </Form.Item>
          </div>
        )}

        <Button type='primary' onClick={() => validateFieldsInCurrentStep()}>
          Next
        </Button>
      </div>
    </>
  );
}
