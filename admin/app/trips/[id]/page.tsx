'use client';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { filter, find, isEmpty, map } from 'lodash';
import { Button, Form, Input, Modal, Select, Space, Table } from 'antd';
import { useRouter } from 'next/navigation';
import { IPassenger } from '@/../packages/models';
import { PlusOutlined } from '@ant-design/icons';
import styles from './page.module.scss';
import { getBookingPassengersByTripId } from '@/services/booking-passenger.service';

const PAGE_SIZE = 10;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};
const OPTIONS = [
  {
    value: 'id', //might change this to referenceNum in the future, will use ID as of now
    label: 'ID',
  },
  {
    value: 'firstName',
    label: 'First Name',
  },
  {
    value: 'lastName',
    label: 'Last Name',
  },
];

export default function BookingList({ params }: any) {
  const router = useRouter();
  const [allPassengersData, setAllPassengersData] = useState(
    [] as IPassenger[]
  );
  const [passengersData, setPassengersData] = useState([] as IPassenger[]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passengerData, setPassengerData] = useState({} as IPassenger);
  const [queryFilter, setQueryFilter] = useState([]);

  const onFinish = (values: any) => {
    if (isEmpty(values.queries)) {
      setPassengersData(allPassengersData);
      return;
    }
    setQueryFilter(values.queries);
  };

  const onClickConfirm = (passengerRecord: IPassenger) => {
    //id should be unique, thinking of adding referenceNum property? para yun lang gamitin, pwede syang UUID. For now ID muna
    setPassengerData(passengerRecord);
    setIsModalOpen(true);
  };

  const onClickYes = () => {
    //TO DO: Confirm passenger by adding today's date in "checkInDate"
    setIsModalOpen(false);
  };

  const onClickCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: 'Reference #',
      key: 'referenceNum',
      dataIndex: 'id',
    },
    {
      title: 'Full Name',
      key: 'firstName',
      render: (text: any, record: any) => (
        <span>
          {record.firstName} {record.lastName}
        </span>
      ),
    },
    {
      title: 'Occupation',
      key: 'occupation',
      dataIndex: 'occupation',
    },
    {
      title: 'Birthdate',
      key: 'birthdayIso',
      dataIndex: 'birthdayIso',
    },
    {
      key: 'action',
      render: (text: any, record: IPassenger) => (
        <Space size='middle'>
          <Button
            type='primary'
            size='large'
            onClick={() => onClickConfirm(record)}
          >
            Check In
          </Button>
        </Space>
      ),
    },
  ];

  // {/* shipId=${record.ship.id}&cabinType=${record.ship.cabins[0].type}&floor=${record.ship.cabins[0].name} */}
  //           {/* router.push(
  //               `/admin/details?shipId=${record.ship.id}&cabinType=${record.ship.cabins[0].type}`
  //             ) */}
  useEffect(() => {
    const bookingPassengers = getBookingPassengersByTripId(Number(params.id));

    const passengers = map(
      bookingPassengers,
      (bookingPassenger) => bookingPassenger?.passenger!
    );

    setAllPassengersData(passengers);
    setPassengersData(passengers);
  }, []);

  useLayoutEffect(() => {
    const filterData = queryFilter.reduce(
      (acc, curr: { type: string; value: string | number }) => {
        let value = curr.value;
        if (curr.type === 'id') {
          value = Number(curr.value);
        }
        return {
          ...acc,
          [curr.type]: value,
        };
      },
      {}
    );

    const filteredPassengers = filter(allPassengersData, { ...filterData });
    setPassengersData(filteredPassengers);
  }, [queryFilter]);

  return (
    <div>
      <div>
        <Form
          name='dynamic_form_item'
          // {...formItemLayoutWithOutLabel}
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.List name='queries'>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item required={false} key={field.key}>
                    <Space.Compact style={{ width: '100%' }}>
                      <Form.Item
                        name={[field.name, 'value']}
                        // label='ID'
                        rules={[
                          {
                            required: true,
                            message: 'Please provide a value',
                          },
                        ]}
                      >
                        <Input
                          addonBefore={
                            <Form.Item
                              name={[field.name, 'type']}
                              noStyle
                              rules={[
                                {
                                  required: true,
                                  message: 'Please choose filter type',
                                },
                              ]}
                            >
                              <Select options={OPTIONS} />
                            </Form.Item>
                          }
                          // style={{ width: '60%' }}
                        />
                      </Form.Item>
                      {/* {fields.length > 1 ? ( */}
                      <Button
                        type='primary'
                        onClick={() => remove(field.name)}
                        danger
                      >
                        Remove
                      </Button>
                      {/* ) : null} */}
                    </Space.Compact>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type='dashed'
                    onClick={() => add()}
                    style={{ width: '60%' }}
                    icon={<PlusOutlined />}
                  >
                    Add field
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div>
        <Table
          columns={columns}
          dataSource={passengersData}
          // className={styles.searchResult}
          pagination={false}
        ></Table>
      </div>
      <div>
        <Modal
          title='Confirm attendance?'
          open={isModalOpen}
          onOk={onClickYes}
          onCancel={onClickCancel}
        >
          <p>Name: {`${passengerData.firstName} ${passengerData.lastName}`} </p>
          <p>Reference Num: {passengerData.id} </p>
          <p>Birth Date: {passengerData.birthdayIso}</p>
        </Modal>
      </div>
      {/* {buttonClicked && <Seats rowData={rowData} />} */}
    </div>
  );
}
