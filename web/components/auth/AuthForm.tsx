'use client';
import React, { useState } from 'react';
import { Avatar, Button, Dropdown, MenuProps, Modal, message } from 'antd';
import {
  FacebookFilled,
  GoogleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { LoginForm, RegisterForm } from '@ayahay/models';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'firebase/auth';
import Register from '../form/Register';
import Login from '../form/Login';
import ForgotPassword from '../form/ForgotPassword';
import styles from './AuthForm.module.scss';
import MyProfileModal from './MyProfileModal';

export default function AuthForm() {
  const {
    currentUser,
    loggedInAccount,
    loading,
    sendEmailVerification,
    logout,
    register,
    resetPassword,
    signIn,
    signInWithFacebook,
    signInWithGoogle,
  } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const onClick = () => {
    if (!currentUser) {
      logIn();
    } else {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const logIn = () => {
    setIsLoginModalOpen(true);
  };

  const logOut = () => {
    logout();
    setDropdownOpen(false);
  };

  const verifyEmail = async (user: User) => {
    try {
      await sendEmailVerification(user);
      message.success({
        type: 'success',
        content:
          'Email sent! Check your inbox and click the link to verify your email.',
        duration: 5,
      });
    } catch {
      message.error({
        type: 'error',
        content: 'Email failed to send. Please try again later.',
        duration: 5,
      });
    }
  };

  const myProfile = () => {
    setIsProfileModalOpen(true);
    setDropdownOpen(false);
  };

  const onFinishLogin = async (values: LoginForm) => {
    const { email, password } = values;
    try {
      await signIn(email, password);
      setIsLoginModalOpen(false);
    } catch (error) {
      message.error({
        type: 'error',
        content: 'E-mail or password is incorrect.',
        duration: 5,
      });
      console.error(error);
    }
  };

  const onFinishReset = async (values: LoginForm) => {
    const { email } = values;
    const result = await resetPassword(email);
    if (result) {
      setIsResetModalOpen(false);
      message.success({
        type: 'success',
        content: 'Email sent! Check your inbox to reset your password.',
        duration: 5,
      });
    } else {
      message.error({
        type: 'error',
        content:
          'Email failed to send. Make sure you inputted the correct email address.',
        duration: 5,
      });
    }
  };

  const onFinishRegister = async (values: RegisterForm) => {
    const { email, password } = values;
    try {
      const token = await register(email, password, values);
      if (token) {
        setIsRegisterModalOpen(false);
      }
    } catch (error: any) {
      let content = 'Register account error.';
      const accountExistsError = 'auth/email-already-in-use';
      if (error.message === accountExistsError) {
        content = 'Account already exists.';
      }

      message.error({
        type: 'error',
        content,
        duration: 5,
      });
    }
  };

  const onGoogleSSOLogin = async () => {
    try {
      await signInWithGoogle();
      setIsLoginModalOpen(false);
    } catch (error) {
      message.error({
        type: 'error',
        content: 'Something went wrong.',
        duration: 5,
      });
      console.error(error);
    }
  };

  const onFacebookSSOLogin = async () => {
    try {
      await signInWithFacebook();
      setIsLoginModalOpen(false);
    } catch (error) {
      message.error({
        type: 'error',
        content: 'Something went wrong.',
        duration: 5,
      });
      console.error(error);
    }
  };

  const onClickReset = () => {
    setIsLoginModalOpen(false);
    setIsResetModalOpen(true);
  };

  const onClickRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const onClickBack = () => {
    setIsResetModalOpen(false);
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const onClickCancel = () => {
    setIsLoginModalOpen(false);
    setIsResetModalOpen(false);
    setIsRegisterModalOpen(false);
    setIsProfileModalOpen(false);
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <button
          style={{ all: 'unset', width: '100%' }}
          onClick={() => myProfile()}
        >
          My Profile
        </button>
      ),
    },
    {
      key: '2',
      label: (
        <button
          style={{ all: 'unset', width: '100%' }}
          onClick={() => logOut()}
        >
          Log Out
        </button>
      ),
    },
  ];

  const label = loading
    ? 'Loading...'
    : currentUser && loggedInAccount
    ? `Welcome, ${
        loggedInAccount.passenger?.firstName ?? currentUser.email?.split('@')[0]
      }`
    : 'Log In';
  return (
    <div>
      <Dropdown menu={{ items }} open={!!currentUser && dropdownOpen}>
        <Button
          type='text'
          size='large'
          style={{ height: 'auto' }}
          onClick={onClick}
        >
          <span style={{ marginRight: '12px', fontSize: '14px' }}>{label}</span>
          <Avatar icon={<UserOutlined />} />
        </Button>
      </Dropdown>
      <Modal
        title='Hey there!'
        open={isLoginModalOpen}
        onCancel={onClickCancel}
        footer={null}
        destroyOnClose={true}
      >
        Don't have an account?{' '}
        <Button type='link' onClick={onClickRegister} style={{ padding: 0 }}>
          Register now!
        </Button>
        <div className={styles['text']}>Log in with</div>
        <div className={styles['sso-buttons']}>
          <GoogleOutlined
            className={styles['sso-button']}
            onClick={onGoogleSSOLogin}
          />
          <FacebookFilled
            className={styles['sso-button']}
            onClick={onFacebookSSOLogin}
          />
        </div>
        <div style={{ textAlign: 'center' }}>or</div>
        <Login onFinishLogin={onFinishLogin} onClickReset={onClickReset} />
      </Modal>
      <Modal
        title='Forgot Your Password?'
        open={isResetModalOpen}
        onCancel={onClickCancel}
        footer={null}
        destroyOnClose={true}
      >
        <ForgotPassword
          onFinishReset={onFinishReset}
          onClickBack={onClickBack}
        />
      </Modal>
      <Modal
        title='Register'
        open={isRegisterModalOpen}
        onCancel={onClickCancel}
        footer={null}
        destroyOnClose={true}
      >
        <Register
          onFinishRegister={onFinishRegister}
          onClickBack={onClickBack}
        />
      </Modal>
      <MyProfileModal
        open={isProfileModalOpen}
        onCancel={onClickCancel}
        currentUser={currentUser}
        loggedInAccount={loggedInAccount}
        verifyEmail={verifyEmail}
      />
    </div>
  );
}
