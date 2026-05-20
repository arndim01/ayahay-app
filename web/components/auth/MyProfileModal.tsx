import { getAccount, updateAccount } from '@/services/account.service';
import { getPassenger } from '@/services/passenger.service';
import { IAccount, IPassenger } from '@ayahay/models';
import { App, Button, Form, Modal, Switch } from 'antd';
import dayjs from 'dayjs';
import { User } from 'firebase/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface MyProfileModalProps {
  open: boolean;
  onCancel: () => void;
  currentUser: any;
  loggedInAccount: IAccount | null | undefined;
  verifyEmail: (user: User) => Promise<void>;
}

export default function MyProfileModal({
  open,
  onCancel,
  currentUser,
  loggedInAccount,
  verifyEmail,
}: MyProfileModalProps) {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const [passenger, setPassenger] = useState<IPassenger | undefined>();
  const [account, setAccount] = useState<IAccount | undefined>();

  useEffect(() => {
    if (loggedInAccount === null || loggedInAccount === undefined) {
      return;
    }
    if (loggedInAccount.role === 'Passenger') {
      fetchPassenger(loggedInAccount.passengerId!);
      fetchAccount(loggedInAccount.id);
    }
  }, [loggedInAccount]);

  const fetchPassenger = async (passengerId: number) => {
    setPassenger(await getPassenger(passengerId));
  };

  const fetchAccount = async (accountId: string) => {
    setAccount(await getAccount(accountId));
  };

  const onSaveChanges = async (values: any) => {
    if (
      form.isFieldTouched('emailConsent') &&
      loggedInAccount &&
      values.emailConsent !== account?.emailConsent
    ) {
      try {
        await updateAccount({
          emailConsent: values.emailConsent,
        });
        await fetchAccount(loggedInAccount.id);
        notification.success({
          message: 'Saved Changes',
          description: 'Your changes have been saved successfully.',
        });
      } catch (e) {
        notification.error({
          message: 'Changes not saved',
          description: `Something went wrong.`,
        });
      }
      onCancel();
    }
  };

  return (
    <Modal
      title='My Profile'
      open={open}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      footer={null}
      destroyOnClose={true}
    >
      {currentUser && (
        <div>
          E-mail: {currentUser.email} is&nbsp;
          {currentUser.emailVerified ? (
            <span>verified</span>
          ) : (
            <>
              <span style={{ color: 'red' }}>not yet verified</span>,
              please&nbsp;
              <Link
                href='/'
                onClick={() => verifyEmail(currentUser!)}
                style={{ textDecoration: 'underline' }}
              >
                verify email now
              </Link>
            </>
          )}
        </div>
      )}

      {loggedInAccount?.role === 'Passenger' && passenger && (
        <div>
          <p>First name: {passenger.firstName}</p>
          <p>Last name: {passenger.lastName}</p>
          <p>Occupation: {passenger.occupation}</p>
          <p>Sex: {passenger.sex}</p>
          <p>Civil status: {passenger.civilStatus}</p>
          <p>Birthday: {dayjs(passenger.birthdayIso).format('MMM D, YYYY')}</p>
          <p>Address: {passenger.address}</p>
          <p>Nationality: {passenger.nationality}</p>
          <Form form={form} name='my-profile' onFinish={onSaveChanges}>
            <div style={{ display: 'flex' }}>
              <Form.Item name='emailConsent' valuePropName='checked'>
                <Switch
                  checkedChildren='Yes'
                  unCheckedChildren='No'
                  defaultChecked={account?.emailConsent}
                />
              </Form.Item>
              <span style={{ padding: 5 }}>Receive e-mails from Ayahay</span>
            </div>
            <Form.Item>
              <Button type='primary' htmlType='submit'>
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );
}
