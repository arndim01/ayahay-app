import { useState, useEffect } from 'react';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';
import { TablePaginationConfig } from 'antd/es/table';

export function useServerPagination<T>(
  fetchFn: (
    request: PaginatedRequest
  ) => Promise<PaginatedResponse<T> | undefined>,
  shouldLoad: boolean
) {
  const [dataInPage, setDataInPage] = useState<T[] | undefined>();
  const [totalCount, setTotalCount] = useState<number>(0);
  const [paginationConfig, setPaginationConfig] = useState<PaginatedRequest>({
    page: 1,
  });

  const fetchData = async () => {
    if (shouldLoad === false) {
      return;
    }

    const response = await fetchFn(paginationConfig);
    if (response === undefined) {
      return;
    }
    setDataInPage(response.data);
    setTotalCount(response.total);
  };

  useEffect(() => {
    fetchData();
  }, [paginationConfig, shouldLoad]);

  const resetData = () => {
    setDataInPage([]);
    setTotalCount(0);
    setPaginationConfig({ page: 1 });
  };

  const antdPagination = {
    current: paginationConfig.page,
    pageSize: 10,
    total: totalCount,
  };

  const antdOnChange = (pagination: TablePaginationConfig, _: any, __: any) => {
    setPaginationConfig({
      page: pagination.current ?? 1,
    });
  };

  return {
    dataInPage,
    totalCount,
    paginationConfig,
    antdPagination,
    antdOnChange,
    resetData,
  };
}

interface Data<T> {
  data: T[];
  page: number;
}

export function useClientPagination<T>(dataToPaginate: T[], pageSize = 5) {
  const [allData, setAllData] = useState<Data<T>[]>();
  const [dataInPage, setDataInPage] = useState<T[]>();
  const [paginationConfig, setPaginationConfig] = useState<PaginatedRequest>({
    page: 1,
  });
  const totalCount = dataToPaginate.length;

  useEffect(() => {
    const finalData: Data<T>[] = [];
    let data: T[] = [];

    dataToPaginate.forEach((d, idx) => {
      const incrementOfPageSize = (Number(idx) + 1) % pageSize === 0;
      const lastElement = idx + 1 === totalCount;

      data.push({
        ...d,
      });

      if (incrementOfPageSize || lastElement) {
        finalData.push({
          data,
          page: Math.ceil((Number(idx) + 1) / pageSize),
        });
        data = [];
      }
    });

    setAllData(finalData);
    setDataInPage(finalData[0]?.data);
  }, []);

  useEffect(() => {
    if (allData === undefined) {
      return;
    }

    setDataInPage(allData[paginationConfig.page - 1].data);
  }, [paginationConfig]);

  const antdPagination = {
    current: paginationConfig.page,
    pageSize,
    total: totalCount,
  };

  const antdOnChange = (pagination: TablePaginationConfig, _: any, __: any) => {
    setPaginationConfig({
      page: pagination.current ?? 1,
    });
  };

  return {
    allData,
    dataInPage,
    totalCount,
    antdPagination,
    antdOnChange,
  };
}
