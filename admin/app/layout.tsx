'use client';
import './globals.css';
import AdminHeader from '@/components/AdminHeader';
import { Jost } from 'next/font/google';
import { App, ConfigProvider, Layout } from 'antd';
import { AuthProvider } from '../contexts/AuthContext';
import AdminSider from '@/components/AdminSider';
import { Content } from 'antd/es/layout/layout';
import QABanner from '@/components/banner/QABanner';
import { FeatureProvider } from '../contexts/FeatureContext';
import dynamic from 'next/dynamic';

const jost = Jost({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={jost.className}>
      <head>
        <title>Ayahay Admin</title>
      </head>
      <body>
        <AuthProvider>
          <ConfigProvider
            theme={{
              token: {
                fontFamily: jost.style.fontFamily,
              },
            }}
          >
            <App>
              <Layout hasSider>
                <Layout className='body'>
                  <QABanner/>
                  <AdminHeader />
                  <Content style={{ backgroundColor: 'white' }}>
                    <FeatureProvider>
                      {children}
                    </FeatureProvider>
                  </Content>
                </Layout>
                <AdminSider />
              </Layout>
            </App>
          </ConfigProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
