'use client';
import './globals.css';
import WebHeader from '@/components/WebHeader';
import { Jost } from 'next/font/google';
import { App, ConfigProvider, Layout } from 'antd';
import React from 'react';
import { Content } from 'antd/es/layout/layout';
import WebFooter from '@/components/WebFooter';
import WebSider from '@/components/WebSider';
import AuthContextProvider from '@/contexts/AuthContext';
import { useShippingLineForWhiteLabel } from '@/hooks/shipping-line';
import QABanner from '@/components/banner/QABanner';

const jost = Jost({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shippingLine = useShippingLineForWhiteLabel();

  return (
    <html lang='en' className={jost.className}>
      <head>
        <title>{shippingLine?.name ?? 'Ayahay'}</title>
        <meta
          name='description'
          content='Hasul nga proseso? Kalas ug oras? Walay kasiguradohan makakuha ug ticket? Book now at Ayahay.com. Kay ang pagsakay dapay, ayahay!'
        />
        {shippingLine ? (
          <link rel='icon' href={`assets/favicon/${shippingLine.name}.ico`} />
        ) : (
          <link rel='icon' href={`assets/favicon/ayahay.ico`} />
        )}
      </head>
      <body>
        <AuthContextProvider>
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
                 {/* <QABanner /> */}
                  <WebHeader />
                  <Content style={{ backgroundColor: 'white' }}>
                    {children}
                  </Content>
                  <WebFooter />
                </Layout>
                <WebSider />
              </Layout>
            </App>
          </ConfigProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
