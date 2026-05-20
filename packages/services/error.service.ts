import axios, { AxiosError } from 'axios';
import { ApiError } from '@ayahay/http';

export function getAxiosError<T>(error: any): ApiError<T> | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  const errorResponse = (error as AxiosError<ApiError<T>>).response;

  if (errorResponse === undefined) {
    return undefined;
  }

  return errorResponse.data;
}
