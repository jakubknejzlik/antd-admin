import { useMutation } from "@tanstack/react-query";
import {
  Button,
  ButtonProps,
  message,
  Popconfirm,
  PopconfirmProps,
} from "antd";

interface MutationButtonProps<T = unknown> extends ButtonProps {
  mutation: Parameters<typeof useMutation<T>>[0];
  popconfirm?: PopconfirmProps;
}

export const MutationButton = ({
  mutation,
  popconfirm,
  ...props
}: MutationButtonProps) => {
  const _mutation = useMutation(mutation);

  return (
    <Popconfirm
      title="Are You sure?"
      onConfirm={async () => {
        try {
          await _mutation.mutateAsync();
        } catch (err) {
          message.error(`${err}`);
        }
        // await query.refetch();
      }}
      {...popconfirm}
    >
      <Button loading={_mutation.isPending} {...props} />
    </Popconfirm>
  );
};
