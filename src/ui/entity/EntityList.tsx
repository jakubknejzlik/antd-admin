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
  const { list, deleteMutationFn } = entity.config;
  const { query, columnStatsQuery, buttons, columns, ...rest } = list;

  return (
    <QueryTableWithButtons
      query={{
        queryKey: entity.getListPageQueryKey(), //[rootRoute.to, "list"],
        ...query,
      }}
      columnStatsQuery={
        columnStatsQuery
          ? {
              queryKey: [...entity.getListPageQueryKey(), "column-stats"],
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
  );
};
