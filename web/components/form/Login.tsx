import { Button, Form, Input } from 'antd';

interface LoginProps {
  onFinishLogin: (values: any) => Promise<void>;
  onClickReset: () => void;
}

export const buttonStyle = {
  width: '100%',
  height: '35px',
};

export default function Login({ onFinishLogin, onClickReset }: LoginProps) {
  return (
    <Form
      name='normal-login'
      onFinish={onFinishLogin}
      style={{ marginTop: 15 }}
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
      <Form.Item
        label='Password:'
        name='password'
        rules={[{ required: true, message: 'Please input your Password!' }]}
      >
        <Input.Password type='password' placeholder='Enter password' />
      </Form.Item>
      <Form.Item>
        <Button type='link' onClick={onClickReset} style={{ padding: 0 }}>
          Forgot password?
        </Button>
      </Form.Item>

      <Form.Item>
        <Button type='primary' htmlType='submit' style={buttonStyle}>
          Log in
        </Button>
      </Form.Item>
    </Form>
  );
}
