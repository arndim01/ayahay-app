import React from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useClientPagination } from '@ayahay/hooks';

interface Data {
  key?: number;
  data: string;
}

interface NotCheckedInModalProps {
  data: Data[];
}

const column: ColumnsType<Data> = [
  {
    title: 'Not Checked-in',
    dataIndex: 'data',
    key: 'data',
  },
];

export function NotCheckedInModal({ data }: NotCheckedInModalProps) {
  const { dataInPage, antdPagination, antdOnChange } =
    useClientPagination<Data>(data);

  return (
    <article
      style={{ minWidth: '260px', maxHeight: '360px', overflowY: 'auto' }}
    >
      <Table
        columns={column}
        dataSource={dataInPage}
        pagination={antdPagination}
        onChange={antdOnChange}
        size='small'
      />
    </article>
  );
}
