import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Alert, Select, SelectProps } from "antd";
import { useState } from "react";

export type OptionType = { value: string; label: React.ReactNode };

type SelectData<T> = {
  items: T[];
  total: number;
};

export type SelectTableState = {
  search?: string;
};

type SelectQueryQuery<T extends OptionType> = Omit<
  UseQueryOptions<SelectData<T>, Error, SelectData<T>, QueryKey>,
  "queryFn"
> & {
  queryFn: (state: SelectTableState) => Promise<SelectData<T>>;
};

export interface QuerySelectProps<T extends OptionType> extends SelectProps {
  query: SelectQueryQuery<T>;
  defaultState?: Partial<SelectTableState>;
}

export const QuerySelect = <T extends OptionType>({
  query,
  defaultState,
  ...props
}: QuerySelectProps<T>) => {
  const [state, setState] = useState<SelectTableState>({ ...defaultState });

  const { queryFn, queryKey, ...queryRest } = query;
  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKey, state],
    queryFn: () => {
      return queryFn(state);
    },
    ...queryRest,
  });

  return (
    <>
      {error && <Alert message={error.message} type="error" />}
      <Select
        loading={isLoading}
        options={data?.items}
        searchValue={state.search}
        showSearch
        onSearch={(search) => {
          setState((state) => ({ ...state, search }));
        }}
        filterOption={false}
        {...props}
      />
    </>
  );
};
