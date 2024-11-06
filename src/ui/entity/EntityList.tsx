import { TableData } from "../data-display/QueryTable";
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
  visibleColumns?: string[];
};

export const EntityList = <T extends EntityItem, S extends OptionType>({
  entity,
  visibleColumns,
  ...props
}: EntityListProps<T, S>) => {
  const { list, dataSource } = entity.config;
  const { query, columnStatsQuery, buttons, columns, ...rest } = list;

  const listQueryFn = dataSource.listQueryFn;
  const crudListQueryFn = dataSource.crud?.listQueryFn;
  const columnStatsQueryFn = dataSource.listColumnStatsQueryFn;
  const deleteMutationFn = dataSource.crud?.deleteMutationFn;

  return (
    (listQueryFn || crudListQueryFn) && (
      <QueryTableWithButtons
        query={{
          queryKey: entity.getListPageQueryKey(), //[rootRoute.to, "list"],
          queryFn: async (args): Promise<TableData<T>> => {
            if (crudListQueryFn) {
              const items = await crudListQueryFn();
              return { items, total: items.length };
            }
            return listQueryFn!(args);
          },
          ...query,
        }}
        columnStatsQuery={
          columnStatsQuery && columnStatsQueryFn
            ? {
                queryKey: [...entity.getListPageQueryKey(), "column-stats"],
                queryFn: columnStatsQueryFn,
                ...columnStatsQuery,
              }
            : undefined
        }
        buttons={buttons}
        deleteMutationFn={deleteMutationFn}
        columns={
          visibleColumns === undefined
            ? columns
            : columns.filter(
                (col) =>
                  col.key &&
                  (col.key === "buttons" ||
                    visibleColumns.includes(col.key.toString()))
              )
        }
        {...rest}
        {...props}
      />
    )
  );
};
