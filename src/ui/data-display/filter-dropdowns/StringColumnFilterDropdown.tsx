import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";

interface StringColumnFilterDropdownProps {
  value: React.Key[];
  onChange?: (value: React.Key[]) => void;
}

export const StringColumnFilterDropdown = ({
  value,
  onChange,
}: StringColumnFilterDropdownProps) => {
  //   const [_value, setValue] = useState(value);
  return (
    <Input
      value={value?.[0]}
      onChange={(e) => {
        onChange?.([e.target.value]);
      }}
      onClear={() => {
        onChange?.([]);
      }}
      prefix={<SearchOutlined />}
      placeholder="Search"
    />
  );
};
