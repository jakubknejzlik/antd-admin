import { Table, TableProps } from "antd";

import { TRPCClientErrorLike } from "@trpc/client";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { AnyClientTypes } from "@trpc/server/unstable-core-do-not-import";
import { AnyObject } from "antd/es/_util/type";

interface TrpcTableProps<TData extends AnyObject> extends TableProps<TData> {
  query: UseTRPCQueryResult<TData[], TRPCClientErrorLike<AnyClientTypes>>;
  transform?: (data: TData) => TData;
}

export const TrpcTable = <T extends AnyObject>({
  query,
  ...props
}: TrpcTableProps<T>) => {
  const { data, isLoading, error } = query;
  return (
    <Table
      dataSource={data}
      locale={{ emptyText: error?.message }}
      loading={isLoading}
      rowKey={"id"}
      {...props}
    />
  );
};
