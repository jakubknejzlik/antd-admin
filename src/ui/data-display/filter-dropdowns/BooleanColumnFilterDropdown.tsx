import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Select } from "antd";
import { FilterValue } from "antd/es/table/interface";

interface BooleanColumnFilterDropdownProps {
  value: FilterValue;
  onChange?: (value: FilterValue) => void;
}

export const BooleanColumnFilterDropdown = ({
  value,
  onChange,
}: BooleanColumnFilterDropdownProps) => {
  return (
    <Select
      style={{ width: "100%", minWidth: 100 }}
      options={[
        { value: true, label: <CheckOutlined /> },
        { value: false, label: <CloseOutlined /> },
      ]}
      value={value?.[0]}
      onChange={(value) => {
        onChange?.([value]);
      }}
      onClear={() => {
        onChange?.([]);
      }}
    />
  );
};
