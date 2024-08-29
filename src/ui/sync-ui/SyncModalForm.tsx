import { Button, Flex, Form, FormProps, Modal, Space } from "antd";
import { PropsWithChildren, useState } from "react";
import { makeSyncUI } from "react-sync-ui";

type ModalFormState<T> = {
  values?: T;
  open: boolean;
  cancelled: boolean;
};

export const buildSyncModalForm = <
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends PropsWithChildren<FormProps<T>> = PropsWithChildren<FormProps<T>>,
>(
  buildProps?: P
) =>
  makeSyncUI<P | void, T | null>(({ data: input, resolve }) => {
    const { children, ...props } = { ...buildProps, ...input };
    const [state, setState] = useState<ModalFormState<T>>({
      open: true,
      cancelled: false,
    });
    const [form] = Form.useForm();

    return (
      <Modal
        open={state.open}
        closable={false}
        footer={null}
        onCancel={() =>
          setState((state) => ({ ...state, open: false, cancelled: true }))
        }
        afterOpenChange={async (open) => {
          if (!open) {
            if (state.cancelled || state.values === undefined) {
              resolve(null);
            } else if (state.values) {
              resolve(state.values);
            }
          }
        }}
      >
        <Form
          {...props}
          form={form}
          onFinish={(values) => {
            setState((state) => ({ ...state, open: false, values }));
          }}
          onInvalid={(error) => {
            console.error(error);
          }}
        >
          {children}
          <Form.Item>
            <Flex justify="flex-end">
              <Space>
                <Button
                  onClick={() => {
                    setState((state) => ({
                      ...state,
                      open: false,
                      cancelled: true,
                    }));
                  }}
                >
                  Cancel
                </Button>
                <Button htmlType="submit" type="primary">
                  OK
                </Button>
              </Space>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    );
  });
