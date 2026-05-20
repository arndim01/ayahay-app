import { IPassenger } from '@ayahay/models';

export const mockPassenger: IPassenger = {
  id: -4,
  firstName: 'John',
  lastName: 'Doe',
  occupation: 'Student',
  sex: 'Male',
  civilStatus: 'Single',
  birthdayIso: '1999/09/09',
  address: 'Quezon City',
  nationality: 'Filipino',
};

export const mockSon: IPassenger = {
  id: -3,
  firstName: 'Son',
  lastName: 'Santos',
  occupation: 'Student',
  sex: 'Male',
  civilStatus: 'Single',
  birthdayIso: '2018-05-05',
  address: 'Mandaluyong City',
  nationality: 'Filipino',
};

export const mockWife: IPassenger = {
  id: -2,
  firstName: 'Wife',
  lastName: 'Santos',
  occupation: 'Unemployed',
  sex: 'Female',
  civilStatus: 'Married',
  birthdayIso: '1999-05-05',
  address: 'Mandaluyong City',
  nationality: 'Filipino',
};

export const mockFather: IPassenger = {
  id: -1,
  firstName: 'Father',
  lastName: 'Santos',
  occupation: 'Employed',
  sex: 'Male',
  civilStatus: 'Married',
  birthdayIso: '1999-10-20',
  address: 'Mandaluyong City',
  nationality: 'Filipino',
  companions: [mockWife, mockSon],
};

export const mockPassengers: IPassenger[] = [
  mockPassenger,
  mockFather,
  mockWife,
  mockSon,
];
