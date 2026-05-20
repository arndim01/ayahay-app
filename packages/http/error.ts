export interface ApiError<T> {
  statusCode: number;
  message: T;
  error: string;
}

export interface FieldError {
  /**
   * we're trying to copy Ant Design's NamePath
   * an error with fieldName ['passengers', 1, 'name']
   * means there's an error with the name of the
   * passenger at index 1 in the passengers array
   */
  fieldName: (string | number)[];
  message: string;
}
