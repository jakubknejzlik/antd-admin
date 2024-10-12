import { CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Space } from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { PropsWithChildren } from "react";

interface ColumnFilterDropdownProps
  extends PropsWithChildren<FilterDropdownProps> {
  orientation?: "vertical" | "horizontal";
}

export const ColumnFilterDropdown = ({
  children,
  selectedKeys,
  setSelectedKeys,
  confirm,
  orientation = "horizontal",
}: ColumnFilterDropdownProps) => {
  return (
    <Space
      direction={orientation}
      split={
        <Divider
          type={orientation === "horizontal" ? "vertical" : "horizontal"}
          style={{ margin: 0 }}
        />
      }
      style={{ width: "100%", padding: 4 }}
    >
      <div className="p-2 pb-0">{children}</div>
      {orientation === "horizontal" && (
        <>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              confirm();
            }}
            icon={<CheckOutlined />}
          />
          <Button
            size="small"
            disabled={selectedKeys.length === 0}
            onClick={() => {
              setSelectedKeys([]);
              confirm();
            }}
            danger
            icon={<DeleteOutlined />}
          />
        </>
      )}
      {orientation === "vertical" && (
        <Flex justify="space-between" align="center" className="p-2 pt-0">
          <Button
            size="small"
            disabled={selectedKeys.length === 0}
            onClick={() => {
              setSelectedKeys([]);
              confirm();
            }}
            danger
            icon={<DeleteOutlined />}
          />
          <Button
            type="primary"
            size="small"
            onClick={() => {
              confirm();
            }}
            icon={<CheckOutlined />}
          />
        </Flex>
      )}
    </Space>
  );
};
