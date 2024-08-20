import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "antd";
import { PropsWithChildren } from "react";
import { QueryForm, QueryFormProps } from "./QueryForm";

export type QueryEditFormProps<T> = QueryFormProps<T> &
  PropsWithChildren<{
    query: Parameters<typeof useQuery<T | null>>[0];
  }>;

export const QueryEditForm = <T,>({
  query,
  mutation,
  ...props
}: QueryEditFormProps<T>) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(query);

  if (error) {
    return <Alert message={error.message} type="error" />;
  }

  return (
    <QueryForm
      key={data ? "loaded" : "loading"}
      disabled={isLoading || !data}
      loading={isLoading}
      initialValues={data ?? {}}
      mutation={{
        ...mutation,
        onSuccess: async (...args) => {
          await queryClient.invalidateQueries({ queryKey: query.queryKey });
          await mutation.onSuccess?.(...args);
        },
      }}
      {...props}
    />
  );
};
