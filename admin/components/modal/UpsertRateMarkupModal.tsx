import { Form, InputNumber, Modal, ModalProps, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { IAccount, IRateTableMarkup } from '@ayahay/models';
import React, { useEffect } from 'react';
import { buildRateTableMarkupFromForm } from '@ayahay/services/rate-table.service';
import { InfoCircleOutlined } from '@ant-design/icons';

interface UpsertRateMarkupModalProps {
  originalMarkup: IRateTableMarkup;
  loggedInAccount: IAccount;
  onCreateRateMarkup: (rateMarkup: IRateTableMarkup) => Promise<void>;
  onUpdateRateMarkup: (rateMarkup: IRateTableMarkup) => Promise<void>;
}

const { Title } = Typography;

export default function UpsertRateMarkupModal({
  originalMarkup,
  loggedInAccount,
  onCreateRateMarkup,
  onUpdateRateMarkup,
  onOk,
  ...modalProps
}: UpsertRateMarkupModalProps & ModalProps) {
  const [form] = useForm();

  useEffect(() => {
    form.setFieldsValue({
      id: originalMarkup.id,
      rateTableId: originalMarkup.rateTableId,
      travelAgencyId: originalMarkup.travelAgencyId,
      clientId: originalMarkup.clientId,
      markupFlat: originalMarkup.markupFlat,
      markupPercent: originalMarkup.markupPercent * 100,
      markupMaxFlat: originalMarkup.markupMaxFlat,
      commission_flat: originalMarkup.commission_flat,
      commission_percent: originalMarkup.commission_percent * 100,
    });
  }, [originalMarkup]);

  const onOkModal = async () => {
    try {
      await form.validateFields();

      const updatedRateTableMarkup = buildRateTableMarkupFromForm(form);
      if (updatedRateTableMarkup.id) {
        await onUpdateRateMarkup(updatedRateTableMarkup);
      } else {
        await onCreateRateMarkup(updatedRateTableMarkup);
      }
    } catch {}
  };

  return (
    <Modal onOk={onOkModal} okText='Confirm' closeIcon={true} {...modalProps}>
      <Title level={2} style={{ fontSize: '20px', marginBottom: '20px' }}>
        Update Markup for {originalMarkup.travelAgency?.name}
      </Title>
      <Form form={form} layout='vertical'>
        <Form.Item
          label='Flat Markup'
          name='markupFlat'
          colon={false}
          rules={[{ required: true, message: 'Please input a valid number' }]}
          tooltip={{
            title: `Only the travel agency can modify this field.`,
            icon: <InfoCircleOutlined />,
          }}
        >
          <InputNumber
            min={0}
            addonBefore='₱'
            controls={false}
            disabled={loggedInAccount.role !== 'TravelAgencyAdmin'}
          />
        </Form.Item>
        <Form.Item
          label='Percentage Markup'
          name='markupPercent'
          colon={false}
          rules={[{ required: true, message: 'Please input a valid number' }]}
          tooltip={{
            title: `This value is multiplied to the ticket price before discounts and markups are applied. Only the travel agency can modify this field.`,
            icon: <InfoCircleOutlined />,
          }}
        >
          <InputNumber
            min={0}
            max={100}
            addonAfter='%'
            controls={false}
            disabled={loggedInAccount.role !== 'TravelAgencyAdmin'}
          />
        </Form.Item>
        <Form.Item
          label='Commission Flat'
          name='commission_flat'
          colon={false}
          rules={[{ required: true, message: 'Please input a valid number' }]}
          tooltip={{
            title: `Only the shipping line admin can modify this field.`,
            icon: <InfoCircleOutlined />,
          }}
        >
          <InputNumber
            min={0}
            addonBefore='₱'
            controls={false}
            disabled={loggedInAccount.role !== 'ShippingLineAdmin'}
          />
        </Form.Item>
        <Form.Item
          label='Commission Percent'
          name='commission_percent'
          colon={false}
          rules={[{ required: true, message: 'Please input a valid number' }]}
          tooltip={{
            title: `This value is multiplied to the ticket price before discounts and markups are applied. Only the Shipping line admin can modify this field.`,
            icon: <InfoCircleOutlined />,
          }}
        >
          <InputNumber
            min={0}
            max={100}
            addonAfter='%'
            controls={false}
            disabled={loggedInAccount.role !== 'ShippingLineAdmin'}
          />
        </Form.Item>
        <Form.Item
          label='Max Markup'
          name='markupMaxFlat'
          colon={false}
          rules={[{ required: true, message: 'Please input a valid number' }]}
          tooltip={{
            title: `If the calculated markup exceeds this value, this value will be the final markup. Only the shipping line can modify this field.`,
            icon: <InfoCircleOutlined />,
          }}
        >
          <InputNumber
            min={0}
            addonBefore='₱'
            controls={false}
            disabled={loggedInAccount.role !== 'ShippingLineAdmin'}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
