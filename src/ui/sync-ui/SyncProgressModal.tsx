import { Modal, ModalProps, Progress, Spin } from "antd";
import { useState } from "react";
import { makeSyncUI } from "react-sync-ui";

type ProgressCallback = (progress: number) => void;

interface ProgressModalProps extends ModalProps {
  task: (callback: ProgressCallback) => Promise<void>;
}

export const syncProgressModal = makeSyncUI<ProgressModalProps, void>(
  ({ data: input, resolve, reject }) => {
    const [progress, setProgress] = useState<number | null>(null);
    const { task, ...props } = input;

    return (
      <Modal
        open={true}
        footer={null}
        closable={false}
        afterOpenChange={async (open) => {
          if (open) {
            try {
              const result = await task((newProgress) =>
                setProgress(newProgress)
              );
              //   return right await if there's no progress displayed
              if (progress === null) return resolve(result);
              setProgress(1);
              await setTimeout(() => resolve(result), 500);
            } catch (err) {
              reject(err);
            }
          }
        }}
        {...props}
      >
        {progress !== null ? (
          <Progress percent={Math.round(progress * 10000) / 100} />
        ) : (
          <Spin size="large" />
        )}
      </Modal>
    );
  }
);
