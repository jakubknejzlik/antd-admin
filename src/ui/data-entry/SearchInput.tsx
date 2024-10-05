import { Input } from "antd";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

interface SearchInputProps {
  value?: string;
  onChange?: (value?: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  const [searchValue, setSearchValue] = useDebouncedValue<string | undefined>(
    value,
    300,
    (search) => {
      onChange?.(search);
    }
  );
  return (
    <Input
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      allowClear
    />
  );
};
