import { Button, Form, Input } from 'antd';
import { buttonStyle } from './Login';

interface ForgotPasswordProps {
  onFinishReset: (values: any) => Promise<void>;
  onClickBack: () => void;
}

export default function ForgotPassword({
  onFinishReset,
  onClickBack,
}: ForgotPasswordProps) {
  return (
    <Form
      name='forgot-password'
      className='forgot-password-form'
      onFinish={onFinishReset}
    >
      <Form.Item
        label='E-mail:'
        name='email'
        rules={[
          {
            type: 'email',
            message: 'The input is not valid E-mail!',
          },
          {
            required: true,
            message: 'Please input your E-mail!',
          },
        ]}
      >
        <Input placeholder='Enter email' />
      </Form.Item>

      <Form.Item>
        <Button key='back' onClick={onClickBack} style={buttonStyle}>
          Back
        </Button>
        <Button type='primary' htmlType='submit' style={buttonStyle}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
