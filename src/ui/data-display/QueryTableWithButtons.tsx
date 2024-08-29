import { DeleteOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Space } from "antd";
import { QueryTable, QueryTableColumns, QueryTableProps } from "./QueryTable";
import { MutationButton } from "../general/MutationButton";
import { EntityItem } from "../types/shared";

export interface QueryTableWithButtonsProps<T extends EntityItem>
  extends QueryTableProps<T> {
  buttons?: (item: T) => React.ReactNode;
  deleteMutationFn?: (item: T) => Promise<unknown>;
}

export const QueryTableWithButtons = <T extends EntityItem>({
  buttons,
  deleteMutationFn,
  ...rest
}: QueryTableWithButtonsProps<T>) => {
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
