import { EditOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Button } from "antd";
import {
  QueryTableWithButtons,
  QueryTableWithButtonsProps,
} from "../data-display/QueryTableWithButtons";
import { OptionType } from "../data-entry/QuerySelect";
import { EntityItem } from "../types/shared";
import { Entity } from "./entity";

export type EntityListProps<
  T extends EntityItem,
  S extends OptionType,
> = Partial<QueryTableWithButtonsProps<T>> & {
  entity: Entity<T, S>;
};

export const EntityList = <T extends EntityItem, S extends OptionType>({
  entity,
  ...props
}: EntityListProps<T, S>) => {
  const { rootRoute, list, deleteMutationFn, updateMutationFn } = entity.config;
  const { query, buttons, ...rest } = list;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootPath = rootRoute.to as any;
  return (
    <QueryTableWithButtons
      query={{
        queryKey: entity.getListPageQueryKey(), //[rootRoute.to, "list"],
        ...query,
      }}
      buttons={
        buttons || updateMutationFn
          ? (item) => (
              <>
                {buttons?.(item)}
                <Link
                  from={rootPath}
                  to={"./$id/edit" as string}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  params={{ id: (item as any).id }}
                >
                  <Button icon={<EditOutlined />} />
                </Link>
              </>
            )
          : undefined
      }
      deleteMutationFn={deleteMutationFn}
      {...rest}
      {...props}
    />
  );
};
