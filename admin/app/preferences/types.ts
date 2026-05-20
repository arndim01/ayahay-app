import { TabsProps } from 'antd';

export interface FormFieldPreference {
  field: string;
  enabled: boolean;
  defaultValue?: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: { value: string; label: string }[];
}

export interface Port {
  id: number;
  name: string;
  code: string;
}

export interface SavePreferenceData {
  portId: number;
  shippingLineId?: number;
  preferences: {
    field: string;
    enabled: boolean;
    defaultValue?: string;
  }[];
}

export const INITIAL_PREFERENCES: FormFieldPreference[] = [
  { field: 'firstName', enabled: true, label: 'First Name', type: 'text' },
  { field: 'lastName', enabled: true, label: 'Last Name', type: 'text' },
  {
    field: 'sex',
    enabled: true,
    defaultValue: '',
    label: 'Sex',
    type: 'select',
    options: [
      { value: '', label: 'None' },
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  { field: 'dateOfBirth', enabled: true, label: 'Date of Birth', type: 'date' },
  { field: 'age', enabled: true, label: 'Age', type: 'text' },
  { field: 'address', enabled: true, label: 'Address', type: 'text' },
  { field: 'nationality', enabled: true, label: 'Nationality', type: 'text' },
];

export interface PreferencesTabItem {
  key: string;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export type PreferencesTabItems = PreferencesTabItem[];

export interface BookingCutoff {
  id: number;
  shipping_line_id: number;
  origin: number;
  destination: number;
  cut_off_condition_type: string;
  cut_off_value: number;
  created_at: string;
  updated_at: string;
  shipping_line_name?: string;
  origin_port_name?: string;
  destination_port_name?: string;
  shippingLine?: {
    name: string;
  };
}

export interface ShippingLine {
  id: number;
  name: string;
}
