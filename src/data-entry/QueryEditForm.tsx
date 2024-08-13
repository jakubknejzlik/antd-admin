import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "antd";
import { AnyObject } from "antd/es/_util/type";
import { PropsWithChildren } from "react";
import { QueryForm, QueryFormProps } from "./QueryForm";

export type QueryEditFormProps<
  T extends AnyObject | null,
  U extends AnyObject,
> = QueryFormProps<U> &
  PropsWithChildren<{
    query: Parameters<typeof useQuery<T>>[0];
  }>;

export const QueryEditForm = <T extends AnyObject | null, U extends AnyObject>({
  query,
  mutation,
  ...props
}: QueryEditFormProps<T, U>) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(query);

  if (error) {
    return <Alert message={error.message} type="error" />;
  }

  return (
    <>
      {data && (
        <QueryForm
          disabled={isLoading}
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
      )}
    </>
  );
};
