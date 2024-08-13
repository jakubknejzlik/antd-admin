import { useQuery } from "@tanstack/react-query";
import { Alert, Select, SelectProps } from "antd";

type OptionType = { value: string; label: React.ReactNode };

interface QuerySelectProps<T extends OptionType[]> extends SelectProps {
  query: Parameters<typeof useQuery<T>>[0];
}

export const QuerySelect = <T extends OptionType[]>({
  query,
  ...props
}: QuerySelectProps<T>) => {
  const { data, isLoading, error } = useQuery(query);

  return (
    <>
      {error && <Alert message={error.message} type="error" />}
      <Select loading={isLoading} options={data} {...props} />
    </>
  );
};
