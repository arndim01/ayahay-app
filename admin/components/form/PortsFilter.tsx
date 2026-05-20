import { Button, Form } from 'antd';
import PortAutoComplete from '@ayahay/components/form/PortAutoComplete';
import { DebouncedFunc } from 'lodash';
import styles from './PortsFilter.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface PortsFilterProps {
  debounceSearch: DebouncedFunc<() => void>;
}

export default function PortsFilter({ debounceSearch }: PortsFilterProps) {
  const form = Form.useFormInstance();
  const { loggedInAccount } = useAuth();
  const srcPortId = Form.useWatch('srcPortId', form);
  const destPortId = Form.useWatch('destPortId', form);

  // Reset destination port when origin changes to prevent invalid combinations
  useEffect(() => {
    if (srcPortId && destPortId) {
      // If origin changed, reset destination to avoid invalid combinations
      form.setFieldValue('destPortId', undefined);
      debounceSearch();
    }
  }, [srcPortId]);

  // Only pass shippingLineId if it's not null
  const shippingLineIdProp = loggedInAccount?.shippingLineId
    ? { shippingLineId: loggedInAccount.shippingLineId }
    : {};

  return (
    <>
      <PortAutoComplete
        excludePortId={destPortId}
        size='medium'
        labelCol={{ span: 25 }}
        colon={true}
        name='srcPortId'
        label='Origin Port'
        className={styles['input']}
        {...shippingLineIdProp}
      />
      <PortAutoComplete
        excludePortId={srcPortId}
        size='medium'
        labelCol={{ span: 25 }}
        colon={true}
        name='destPortId'
        label='Destination Port'
        className={styles['input']}
        isDestination={true}
        originPortId={srcPortId ? Number(srcPortId) : undefined}
        {...shippingLineIdProp}
      />
      <Button
        onClick={() => {
          form.resetFields(['srcPortId', 'destPortId']);
          debounceSearch();
        }}
        className={styles['clear-btn']}
      >
        Clear Ports
      </Button>
    </>
  );
}
