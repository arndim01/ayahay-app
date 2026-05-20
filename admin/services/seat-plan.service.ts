import { SEAT_PLAN_API } from '@ayahay/constants';
import { ISeatPlan } from '@ayahay/models';
import axios from '@ayahay/services/axios';

export async function createSeatPlan(seatPlan: ISeatPlan): Promise<void> {
  await axios.post(`${SEAT_PLAN_API}`, seatPlan);
}

export function uploadSeatPlanJson(
  file: File,
  onSuccess: () => void,
  onError?: () => void
): void {
  const reader = new FileReader();

  reader.addEventListener(
    'load',
    async () => {
      if (typeof reader.result !== 'string') {
        onError && onError();
        return;
      }

      try {
        const seatPlan: ISeatPlan = JSON.parse(reader.result);
        await createSeatPlan(seatPlan);
        onSuccess();
      } catch (e) {
        onError && onError();
      }
    },
    false
  );

  if (file) {
    reader.readAsText(file);
  }
}
