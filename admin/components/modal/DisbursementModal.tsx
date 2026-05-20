import { Form, Modal, ModalProps, notification } from 'antd';
import dayjs from 'dayjs';
import Disbursements from '../form/Disbursements';
import {
  buildDisburementFromDisburmentForm,
  createDisbursements,
  deleteDisbursement,
  updateDisbursement,
} from '@/services/disbursement.service';
import { IDisbursement } from '@ayahay/models';
import { useEffect } from 'react';

interface DisbursementModalProps {
  tripId: number;
  trip: any;
  editDisbursement?: IDisbursement;
  isEdit: boolean;
  setDisbursementModalOpen: any;
  resetData: () => void;
}

export default function DisbursementModal({
  tripId,
  trip,
  editDisbursement,
  isEdit,
  setDisbursementModalOpen,
  resetData,
  onOk,
  ...modalProps
}: DisbursementModalProps & ModalProps) {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (!isEdit) {
      form.setFieldValue('disbursement', [
        {
          date: dayjs(trip.departureDateIso)
        },
      ]);
      return;
    }

    if (!editDisbursement) {
      return;
    }    

    form.setFieldValue('disbursement', [
      {
        date: dayjs(editDisbursement.dateIso),
        description: editDisbursement.description,
        officialReceipt: editDisbursement.officialReceipt,
        purpose: editDisbursement.purpose,
        paidTo: editDisbursement.paidTo,
        amount: editDisbursement.amount,
      },
    ]);
  }, [editDisbursement, isEdit]);

  const handleDisbursementSave = async () => {
    try {
      await form.validateFields();
      if (form.getFieldsValue().disbursement.length < 1) {
        return;
      }
    } catch {
      return;
    }

    try {
      const disbursements = buildDisburementFromDisburmentForm(
        form,
        tripId
      );

      if (isEdit && form.isFieldsTouched()) {
        if (!editDisbursement) {
          return;
        }
        await updateDisbursement(editDisbursement.id, disbursements[0]);
      } else {
        await createDisbursements(disbursements);
      }

      form.resetFields();
      setDisbursementModalOpen(false);
      api.success({
        message: 'Success',
        description: 'Disbursement saved successfully.',
      });
      resetData();
    } catch {
      api.error({
        message: 'Failed',
        description: 'Something went wrong.',
      });
    }
  };

  const handleDisbursementDelete = async () => {
    try {
      if (isEdit && editDisbursement) {
        await deleteDisbursement(editDisbursement.id)
      } else {
        return;
      }

      form.resetFields();
      setDisbursementModalOpen(false);
      api.success({
        message: 'Success',
        description: 'Disbursements deleted successfully.',
      });
      resetData();
    } catch {
      api.error({
        message: 'Failed',
        description: 'Something went wrong.',
      });
    }
  }

  return (
    <Modal
      onOk={handleDisbursementSave}
      okText='Save'
      closeIcon={true}
      cancelText='Close'
      onCancel={() => {
        setDisbursementModalOpen(false);
      }}
      {...modalProps}
    >
      <Form
        form={form}
        initialValues={{
          disbursement: [{ date: dayjs(trip.departureDateIso) }],
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      >
        {contextHolder}
        <Disbursements tripDate={trip.departureDateIso} isEdit={isEdit} handleDisbursementDelete={handleDisbursementDelete} />
      </Form>
    </Modal>
  );
}
