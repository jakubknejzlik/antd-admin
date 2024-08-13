import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Space, Table, TableProps } from "antd";
import { AnyObject } from "antd/es/_util/type";
import { columnTypeForTableColumnType, TableColumn } from "./QueryTableColumns";
import { ReloadOutlined } from "@ant-design/icons";

type TableColumns<RecordType> = TableColumn<RecordType>;

type QueryTableProps<T extends AnyObject> = Omit<TableProps<T>, "columns"> & {
  query: Parameters<typeof useQuery<T[]>>[0];
  // | ReturnType<typeof queryOptions<Data[]>>;
  columns: TableColumns<T>[];
};

export const QueryTable = <T extends AnyObject>({
  query,
  columns,
  ...props
}: QueryTableProps<T>) => {
  const { data, isFetching, error, refetch } = useQuery(query);
  return (
    <Table
      dataSource={data}
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
      loading={isFetching}
      rowKey={(row) => `${row["id"]}`}
      columns={columns.map((col) => {
        return columnTypeForTableColumnType<T>(col);
      })}
      onChange={(pagination, filters, sorter, extra) => {
        console.log("???", pagination, filters, sorter, extra);
      }}
      {...props}
    />
  );
};
