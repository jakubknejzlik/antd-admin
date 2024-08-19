import { DeleteOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Space } from "antd";
import { AnyObject } from "antd/es/_util/type";
import {
  QueryTable,
  QueryTableProps,
  QueryTableColumns,
} from "../data-display/QueryTable";
import { MutationButton } from "../general/MutationButton";

export type EntityListItem = AnyObject & { id: string };

export interface EntityListProps<T extends EntityListItem>
  extends QueryTableProps<T> {
  buttons?: (item: T) => React.ReactNode;
  deleteMutationFn?: (item: T) => Promise<unknown>;
}

export const EntityList = <T extends EntityListItem>({
  buttons,
  deleteMutationFn,
  ...rest
}: EntityListProps<T>) => {
  const queryClient = useQueryClient();

  const { columns, ...props } = rest;

  return (
    <QueryTable
      size="small"
      columns={[
        ...columns,
        (buttons || deleteMutationFn) &&
          ({
            key: "buttons",
            width: 20,
            render: (_, item) => (
              <Space>
                {buttons?.(item)}
                {deleteMutationFn && (
                  <MutationButton
                    mutation={{
                      mutationFn: async () => {
                        await deleteMutationFn(item);
                      },
                      onSuccess: () => {
                        queryClient.invalidateQueries({
                          queryKey: props.query.queryKey,
                        });
                      },
                    }}
                    icon={<DeleteOutlined />}
                    danger
                  />
                )}
              </Space>
            ),
          } as QueryTableColumns<T>),
      ].filter((x): x is QueryTableColumns<T> => !!x)}
      {...props}
    />
  );
};
