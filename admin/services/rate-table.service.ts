import { RATE_TABLES_API } from '@ayahay/constants';
import { IRateTable } from '@ayahay/models';
import axios from '@ayahay/services/axios';

export async function getRateTablesByShippingLineIdAndName(
  srcPortName: string,
  destPortName: string,
  shipName: string | undefined
): Promise<IRateTable[] | undefined> {
  if (!shipName) {
    return;
  }

  const { data } = await axios.get<IRateTable[]>(
    `${RATE_TABLES_API}/srcPort/${srcPortName}/destPort/${destPortName}/ship/${shipName}`
  );

  return data;
}
