import { ITermsAndConditions } from '@ayahay/models';
import axios from '@ayahay/services/axios';
import { TERMS_AND_CONDITIONS_API } from '@ayahay/constants';

export async function getAllTermsAndConditions(): Promise<ITermsAndConditions[] | undefined> {
  try {
    const { data } = await axios.get(`${TERMS_AND_CONDITIONS_API}`);
    return data;
  } catch (error) {
    console.error('Error fetching Terms and Conditions:', error);
    return undefined;
  }
}

export async function getTermsAndConditionsById(id: number): Promise<ITermsAndConditions | undefined> {
  try {
    const { data } = await axios.get(`${TERMS_AND_CONDITIONS_API}/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching Terms and Conditions with id ${id}:`, error);
    return undefined;
  }
}

// Retrieve the Terms and Conditions for a specific Shipping Line
export async function getTermsAndConditionsForShippingLine(shippingLineId: number): Promise<ITermsAndConditions | undefined> {
  try {
    const { data } = await axios.get(`${TERMS_AND_CONDITIONS_API}/shipping-line/${shippingLineId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching Terms and Conditions for shipping line with id ${shippingLineId}:`, error);
    return undefined;
  }
}

// Retrieve the Terms and Conditions for a specific Shipping Line for Admin View
export async function getAdminShippingLineTermsAndConditions(shippingLineId: number): Promise<ITermsAndConditions | undefined> {
  try {
    const { data } = await axios.get(`${TERMS_AND_CONDITIONS_API}/admin/shipping-line/${shippingLineId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching Terms and Conditions for shipping line (admin) with id ${shippingLineId}:`, error);
    return undefined;
  }
}

export async function createTermsAndConditions(template: ITermsAndConditions): Promise<ITermsAndConditions> {
  try {
    const { data } = await axios.post(`${TERMS_AND_CONDITIONS_API}`, template);
    return data;
  } catch (error) {
    console.error('Error creating Terms and Conditions:', error);
    throw error; // Rethrow the error so the caller can handle it
  }
}

export async function updateTermsAndConditions(id: number, template: Partial<ITermsAndConditions>): Promise<ITermsAndConditions> {
  try {
    const { data } = await axios.put(`${TERMS_AND_CONDITIONS_API}/${id}`, template);
    return data;
  } catch (error) {
    console.error(`Error updating Terms and Conditions with id ${id}:`, error);
    throw error;
  }
}

export async function deleteTermsAndConditions(id: number): Promise<ITermsAndConditions | undefined> {
  try {
    const { data } = await axios.delete(`${TERMS_AND_CONDITIONS_API}/${id}`);
    return data;
  } catch (error) {
    console.error(`Error deleting Terms and Conditions with id ${id}:`, error);
    return undefined;
  }
}
