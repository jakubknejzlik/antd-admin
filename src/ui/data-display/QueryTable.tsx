import { ReloadOutlined } from "@ant-design/icons";
import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
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

export type TableData<T> = {
  items: T[];
  total: number;
};

export type TableQueryQueryState = QueryTableState & { search?: string };

export type TableQueryQuery<T> = Omit<
  UseQueryOptions<TableData<T>, Error, TableData<T>, QueryKey>,
  "queryFn"
> & {
  queryFn: (
    state: TableQueryQueryState,
    ctx: QueryFunctionContext
  ) => Promise<TableData<T>>;
};

export type TableColumnStats<T> = {
  values: T[];
  valuesTotal: number;
  min?: T;
  max?: T;
};

export type TableColumnStatsInput<T extends EntityItem, C = keyof T> = {
  column: C;
  pagination: Required<Pick<TablePaginationConfig, "current" | "pageSize">>;
};

export type TableColumnStatsQuery<
  T extends EntityItem,
  V = any, // = T[C]
> = Omit<
  UseQueryOptions<TableColumnStats<V>, Error, TableColumnStats<V>, QueryKey>,
  "queryFn"
> & {
  queryFn: (input: TableColumnStatsInput<T>) => Promise<TableColumnStats<V>>;
};

export type QueryTableProps<T extends EntityItem> = Omit<
  TableProps<T>,
  "columns"
> & {
  query: TableQueryQuery<T>;
  columnStatsQuery?: TableColumnStatsQuery<T>;
  columns: QueryTableColumns<T>[];
  defaultState?: Partial<QueryTableState>;
  search?: string;
};

export const QueryTable = <T extends AnyObject>({
  query,
  columns,
  defaultState,
  search,
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
    queryKey: [...queryKey, state, search],
    queryFn: async (ctx) => {
      return queryFn({ ...state, search }, ctx);
    },
    placeholderData: (data) => data,
    ...restQuery,
  });

  const { pagination, loading, columnStatsQuery, ...rest } = props;
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
          return columnTypeForTableColumnType<T>(
            col.key?.toString(),
            col,
            state,
            columnStatsQuery
          );
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
