import { whiteLabelLinks } from '@/services/nav.service';
import { IShippingLine } from '@ayahay/models';
import { getShippingLine } from '@ayahay/services/shipping-line.service';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useShippingLineForWhiteLabel() {
  const [shippingLine, setShippingLine] = useState<IShippingLine | undefined>();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SHIPPING_LINE_ID) {
      fetchShippingLine();
    }
  }, []);

  const fetchShippingLine = async () => {
    const { id, name } = await getShippingLine(
      Number(process.env.NEXT_PUBLIC_SHIPPING_LINE_ID)
    );
    setShippingLine({ id, name });
  };

  return shippingLine;
}

export function useShippingLineToRestrictAccess(link: string) {
  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_SHIPPING_LINE_ID &&
      !whiteLabelLinks.some((e) => e.label === link)
    ) {
      redirect('/404');
    }
  }, []);
}
