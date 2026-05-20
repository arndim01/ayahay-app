'use client';
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { App, Button, Typography, Upload } from 'antd';
import React from 'react';
import { useAuthGuard } from '@/hooks/auth';
import { uploadSeatPlanJson } from '@/services/seat-plan.service';

const { Title } = Typography;
const { Dragger } = Upload;

export default function UploadSeatPlanPage() {
  useAuthGuard(['SuperAdmin', 'ShippingLineAdmin']);
  const { notification } = App.useApp();

  const onUpload = (options: any) => {
    const { file, onProgress, onSuccess } = options;
    onProgress({ percent: 50 });
    setTimeout(() => {
      onProgress({ percent: 100 });
      uploadSeatPlanJson(
        file,
        () => {
          onSuccess();
          notification.success({
            message: 'Successfully uploaded a seat plan.',
          });
        },
        () => {
          notification.error({
            message: 'Something went wrong.',
          });
        }
      );
    }, 1000);
  };

  return (
    <div style={{ padding: '32px' }}>
      <Title level={1}>Upload Vessel Map</Title>
      <Dragger
        name='file'
        multiple={true}
        showUploadList={{
          showPreviewIcon: false,
          showDownloadIcon: false,
          showRemoveIcon: false,
        }}
        customRequest={onUpload}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>
          Click or drag vessel map .json file to this area to upload
        </p>
        <Button
          download
          href='/templates/seat-plan.json'
          onClick={(e) => e.stopPropagation()}
          type='primary'
          shape='round'
          icon={<DownloadOutlined />}
        >
          Download Template
        </Button>
        <p className='ant-upload-hint'></p>
      </Dragger>
    </div>
  );
}
