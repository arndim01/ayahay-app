import dayjs, { Dayjs } from 'dayjs';

export const isWithinTimeInterval = (time: Dayjs): boolean => {
  //30 minutes lifetime
  const difference = dayjs().diff(time, 'minute');
  return difference <= 30;
};
