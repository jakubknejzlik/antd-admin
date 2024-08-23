import { Input, Modal, ModalProps } from "antd";
import { useState } from "react";
import { makeSyncUI } from "react-sync-ui";

interface ProgressModalProps extends ModalProps {
  defaultValue?: string;
}

export const syncPromptModal = makeSyncUI<ProgressModalProps, string | null>(
  ({ data: input, resolve }) => {
    const { defaultValue, ...props } = input;
    const [value, setValue] = useState<string | undefined>(defaultValue);
    const [open, setOpen] = useState(true);

    return (
      <Modal
        open={open}
        closable={false}
        onOk={() => setOpen(false)}
        okButtonProps={{ disabled: value === null }}
        onCancel={() => setOpen(false)}
        afterOpenChange={async (open) => {
          if (!open) {
            if (value === undefined) {
              resolve(null);
            } else {
              resolve(value);
            }
          }
        }}
        {...props}
      >
        <Input
          autoFocus
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
        />
      </Modal>
    );
  }
);
