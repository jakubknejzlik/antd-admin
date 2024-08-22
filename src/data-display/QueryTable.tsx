import { ReloadOutlined } from "@ant-design/icons";
import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Space,
  Table,
  TablePaginationConfig,
  TableProps,
} from "antd";
import { FilterValue } from "antd/es/table/interface";
import { useState } from "react";
import { columnTypeForTableColumnType, TableColumn } from "./QueryTableColumns";
import { AnyObject } from "antd/es/_util/type";
import { EntityItem } from "../types/shared";

export type QueryTableColumns<RecordType> = TableColumn<RecordType>;

type QueryTableSortOrder = "ascend" | "descend";

export type QueryTableState = {
  pagination: Required<Pick<TablePaginationConfig, "current" | "pageSize">>;
  filters: Record<string, FilterValue | null>;
  sorter: Array<{
    field: string;
    order: QueryTableSortOrder;
  }>;
  columns: string[];
};

type TableData<T> = {
  items: T[];
  total: number;
};

export type TableQueryQuery<T> = Omit<
  UseQueryOptions<TableData<T>, Error, TableData<T>, QueryKey>,
  "queryFn"
> & {
  queryFn: (state: QueryTableState) => Promise<TableData<T>>;
};

export type QueryTableProps<T extends EntityItem> = Omit<
  TableProps<T>,
  "columns"
> & {
  query: TableQueryQuery<T>;
  columns: QueryTableColumns<T>[];
  defaultState?: Partial<QueryTableState>;
};

export const QueryTable = <T extends AnyObject>({
  query,
  columns,
  defaultState,
  ...props
}: QueryTableProps<T>) => {
  const [state, setState] = useState<QueryTableState>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sorter: [],
    ...defaultState,
    columns: columns
      .map((col) => ("dataIndex" in col ? col.dataIndex?.toString() : null))
      .filter((x): x is string => !!x),
  });
  const { queryFn, queryKey, ...restQuery } = query;
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: [...queryKey, state],
    queryFn: async () => {
      return queryFn(state);
    },
    placeholderData: (data) => data,
    ...restQuery,
  });

  const { pagination, loading, ...rest } = props;
  return (
    <Table<T>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dataSource={data?.items ?? []}
      locale={{
        emptyText: error && (
          <Alert
            type="error"
            message={
              <Space>
                {error?.message}
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => refetch()}
                />
              </Space>
            }
          />
        ),
      }}
      loading={loading || isFetching}
      rowKey={(row) => `${row["id"]}`}
      columns={[
        ...columns.map((col) => {
          return columnTypeForTableColumnType<T>(col, state);
        }),
      ]}
      onChange={(pagination, filters, sorter) => {
        setState((_state) => ({
          ..._state,
          pagination: {
            ...state.pagination,
            ...pagination,
          },
          filters,
          sorter: (Array.isArray(sorter) ? sorter : [sorter])
            .filter((s) => s.order !== undefined)
            .map((s) => ({
              field: s.field as string,
              order: s.order as QueryTableSortOrder,
            })),
        }));
      }}
      pagination={{ ...state.pagination, ...pagination, total: data?.total }}
      {...rest}
    />
  );
};
