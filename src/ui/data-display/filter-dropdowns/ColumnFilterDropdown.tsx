import { Button, Divider, Flex, Space } from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { PropsWithChildren } from "react";

export const ColumnFilterDropdown = ({
  children,
  selectedKeys,
  setSelectedKeys,
  confirm,
}: PropsWithChildren<FilterDropdownProps>) => {
  return (
    <Space direction="vertical" split={<Divider className="m-0" />}>
      <div className="p-2 pb-0">{children}</div>
      <Flex justify="space-between" align="center" className="p-2 pt-0">
        <Button
          type="link"
          size="small"
          disabled={selectedKeys.length === 0}
          onClick={() => {
            setSelectedKeys([]);
          }}
        >
          Reset
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            confirm();
          }}
        >
          OK
        </Button>
      </Flex>
    </Space>
  );
};
