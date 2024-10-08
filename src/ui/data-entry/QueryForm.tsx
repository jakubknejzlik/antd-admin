import { useMutation } from "@tanstack/react-query";
import { TRPCError } from "@trpc/server";
import { Button, Form, FormProps, message } from "antd";
import { PropsWithChildren } from "react";

export type QueryFormProps<T> = FormProps<T> &
  PropsWithChildren<{
    mutation: Parameters<typeof useMutation<T | void, TRPCError, T>>[0];
    loading?: boolean;
  }>;

export const QueryForm = <T,>({
  mutation,
  children,
  loading,
  ...props
}: QueryFormProps<T>) => {
  const _mutation = useMutation(mutation);

  return (
    <Form
      layout="vertical"
      onFinish={async (values) => {
        try {
          await _mutation.mutateAsync(values);
        } catch (error) {
          message.error((error as Error).message);
        }
      }}
      {...props}
    >
      {children}
      <Form.Item>
        <Button
          loading={loading || _mutation.isPending}
          type="primary"
          htmlType="submit"
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
