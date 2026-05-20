import { PASSENGER_API } from '@ayahay/constants';
import { IPassenger, RegisterForm } from '@ayahay/models';
import axios from '@ayahay/services/axios';

export function mapPassengerToDto(values: RegisterForm): IPassenger {
  const {
    firstName,
    lastName,
    occupation,
    sex,
    civilStatus,
    birthday,
    address,
    nationality,
  } = values;

  return {
    id: -1,
    firstName,
    lastName,
    occupation,
    sex,
    civilStatus,
    birthdayIso: new Date(birthday).toISOString(),
    address,
    nationality,
  };
}

export async function getPassenger(
  passengerId: number
): Promise<IPassenger | undefined> {
  try {
    const { data: passenger } = await axios.get<IPassenger>(
      `${PASSENGER_API}/${passengerId}`
    );
    return passenger;
  } catch (e) {
    console.error(e);
  }
}
