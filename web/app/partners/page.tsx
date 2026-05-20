'use client';
import { Button, Carousel, Typography } from 'antd';
import styles from './page.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useShippingLineToRestrictAccess } from '@/hooks/shipping-line';
import { getShippingLines } from '@ayahay/services/shipping-line.service';

const { Title } = Typography;

export default function Partners() {
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL;
  const SHIPPING_LINE_LOGO = `${BASE_URL}/shipping_line_logo/`;
  useShippingLineToRestrictAccess('Partners');
  const ref = useRef();
  const [allShippingLines, setAllShippingLines] = useState(
    [] as any[]
  );

  useEffect(() => {
    const initializeShippingLines = async () => {
      let shippingLines = (await getShippingLines()) ?? [];

      // Filter out names containing "ayahay"
      const filteredShippingLines = shippingLines.filter(
        (line) => !line.name.toLowerCase().includes("ayahay")
      );

      // Manually add URLs based on `id`
      const shippingLineUrls: Record<number, string> = {
        1: "https://aznarshipping.ph/",
        2: "https://jomaliashipping.com/",
        4: "https://sunriser.ph/",
      };

      // Extend IShippingLine to include website manually
      const updatedShippingLines = filteredShippingLines.map((line) => ({
        ...line,
        website: shippingLineUrls[line.id] ?? "#",
      }));  

      setAllShippingLines(updatedShippingLines);
    };

    initializeShippingLines();
  }, []);
       
  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 30 }}>
        Partners
      </Title>
      <div>
        <Carousel draggable style={{ background: '#edf0fb' }} ref={ref}>
          {allShippingLines.map((line) => (
            <a key={line.id} href={line.website} target="_blank" rel="noopener noreferrer">
              <img
                className={styles["image"]}
                alt={line.name}
                src={`${SHIPPING_LINE_LOGO}${line?.logoFilename}`}
              />
            </a>
          ))}
        </Carousel>
        <div className={styles['buttons']}>
          <Button
            style={{ width: 80 }}
            onClick={() => {
              ref.current.prev();
            }}
          >
            Previous
          </Button>
          <Button
            style={{ width: 80 }}
            onClick={() => {
              ref.current.next();
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
