import { ISerializable } from "@jakub.knejzlik/ts-query";
import { Alert, Select, SelectProps } from "antd";
import { useRunQuery } from "../hooks/RunQuery";

interface QuerySelectProps<T = unknown> extends SelectProps<T> {
  query: ISerializable;
}

export const QuerySelect = ({ query, ...props }: QuerySelectProps) => {
  const { data, isLoading, error } = useRunQuery({
    query,
  });

  return (
    <>
      {error && <Alert message={error.message} type="error" />}
      <Select
        loading={isLoading}
        options={
          data?.results?.map((x) => ({
            label: `${x["label"]}`,
            value: `${x["value"]}`,
          })) ?? []
        }
        {...props}
      />
    </>
  );
};
