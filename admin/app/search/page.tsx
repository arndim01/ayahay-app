'use client';
import styles from './page.module.scss';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsProps, Typography, Input, Empty } from 'antd';
import { useSearchParams } from 'next/navigation';
import BookingPassengerResults from './bookingPassengerResults';
import BookingVehicleResults from './bookingVehicleResults';
import { useAuthGuard } from '@/hooks/auth';

const { Title } = Typography;
const { Search } = Input;

enum SearchModel {
  Passenger = 'Passenger',
  Vehicle = 'Vehicle',
}

const minQueryLength = 2;

export default function SearchPage() {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [resultsQuery, setResultsQuery] = useState('');
  const [searchModel, setSearchModel] =
    useState<keyof typeof SearchModel>('Passenger');

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());

    setQuery(params.query ?? '');
    setResultsQuery(params.query ?? '');
    if (params.model && params.model in SearchModel) {
      setSearchModel(params.model as keyof typeof SearchModel);
    }
  };

  useEffect(onPageLoad, []);

  const performSearch = () => {
    setResultsQuery(query);
    updateUrl();
  };

  const updateUrl = () => {
    const searchQuery: Record<string, string> = {
      query,
      model: searchModel,
    };
    const queryParams = new URLSearchParams(searchQuery);
    const updatedUrl = `${window.location.origin}${
      window.location.pathname
    }?${queryParams.toString()}`;
    window.history.replaceState({ path: updatedUrl }, '', updatedUrl);
  };

  const onChangeTab = (tabKey: string) => {
    setSearchModel(tabKey as keyof typeof SearchModel);
  };

  const tabs: TabsProps['items'] = [
    {
      key: 'Passenger',
      label: 'Passengers',
      children: <BookingPassengerResults query={resultsQuery} />,
    },
    {
      key: 'Vehicle',
      label: 'Vehicles',
      children: <BookingVehicleResults query={resultsQuery} />,
    },
  ];

  return (
    <div className={styles['main-container']} style={{ padding: '24px' }}>
      <Search
        placeholder='Search for booking...'
        onSearch={() => performSearch()}
        size='large'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ paddingBottom: '16px' }}
      />
      {resultsQuery.trim().length < minQueryLength && (
        <Empty description='Enter a search query with at least two (2) characters.' />
      )}
      <div
        style={{
          display:
            resultsQuery.trim().length >= minQueryLength ? 'block' : 'none',
        }}
      >
        <Title level={1}>Search Results for &quot;{resultsQuery}&quot;</Title>
        <Tabs activeKey={searchModel} items={tabs} onChange={onChangeTab} />
      </div>
    </div>
  );
}
