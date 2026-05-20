import { FORM_PREFERENCES_API } from '../constants';
import axios from '@ayahay/services/axios';

export interface IPassengerInformationField {
  field: string;
  enabled: boolean;
  defaultValue?: string;
}

const DEFAULT_FORM_PREFERENCES: IPassengerInformationField[] = [
  { field: 'firstName', enabled: true },
  { field: 'lastName', enabled: true },
  { field: 'nationality', enabled: true },
  { field: 'sex', enabled: true },
  { field: 'dateOfBirth', enabled: true },
  { field: 'age', enabled: true },
];

export async function getFormPreferences(
  portId: number,
  shippingLineId: number
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const { data } = await axios.get<{
      shippingLineId: number;
      portId: number;
      data: IPassengerInformationField[];
    }>(
      `${apiUrl}${FORM_PREFERENCES_API}?portId=${portId}&shippingLineId=${shippingLineId}`
    );
    return data;
  } catch (e) {
    console.error('Failed to fetch form preferences:', e);
    // Return default preferences when API call fails
    return {
      shippingLineId,
      portId,
      data: DEFAULT_FORM_PREFERENCES,
    };
  }
}
