import { Q } from "@jakub.knejzlik/ts-query";
import {
  QueryClient,
  QueryFunctionContext,
  QueryKey,
  useQueryClient,
} from "@tanstack/react-query";
import { AnyObject } from "antd/es/_util/type";
import {
  TableColumnStats,
  TableColumnStatsInput,
  TableData,
  TableQueryQueryState,
} from "../data-display/QueryTable";
import {
  QueryTableWithButtons,
  QueryTableWithButtonsProps,
} from "../data-display/QueryTableWithButtons";
import { OptionType } from "../data-entry/QuerySelect";
import {
  buildAntdColumnStatsQuery,
  buildAntdTableQuery,
} from "../../helpers/antd-query-builder";
import {
  createStaticDatabase,
  executeQueries,
} from "../functions/static-database";
import { EntityItem } from "../types/shared";
import { Entity } from "./entity";
import { EntityDataSource } from "./entity-datasource";

export type EntityListProps<
  T extends EntityItem,
  S extends OptionType,
> = Partial<QueryTableWithButtonsProps<T>> & {
  entity: Entity<T, S>;
  visibleColumns?: string[];
};

async function fetchDataByState<T extends AnyObject>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  state: TableQueryQueryState,
  datasource: EntityDataSource<T>,
  ctx: QueryFunctionContext
): Promise<TableData<T>> {
  if (datasource.listQueryFn) {
    return datasource.listQueryFn(state, ctx);
  }
  const listQueryFn = datasource.crud?.listQueryFn;
  if (listQueryFn) {
    const db = await queryClient.fetchQuery({
      queryKey,
      staleTime: 1000 * 60,
      queryFn: async () => {
        const list = await listQueryFn();
        return createStaticDatabase({ table: list });
      },
    });

    if (!db.tables["table"] || db.tables["table"].length === 0) {
      return { items: [], total: 0 };
    }
    const res = executeQueries(
      db.database,
      buildAntdTableQuery(Q.select().from("table"), state)
    );
    const [results, count] = res.data.results;
    return {
      items: (results ?? []) as T[],
      total: (count?.[0] as { total?: number }).total ?? 0,
    };
  }
  throw new Error("no listQueryFn or crud.listQueryFn provided");
}

async function fetchColumnStats<T extends AnyObject>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  input: TableColumnStatsInput<T>,
  datasource: EntityDataSource<T>
): Promise<TableColumnStats<T>> {
  if (datasource.listColumnStatsQueryFn) {
    return datasource.listColumnStatsQueryFn(input);
  }
  const listQueryFn = datasource.crud?.listQueryFn;
  if (listQueryFn) {
    const db = await queryClient.fetchQuery({
      queryKey,
      staleTime: 1000 * 60,
      queryFn: async () => {
        const list = await listQueryFn();
        return createStaticDatabase({ table: list });
      },
    });

    if (!db.tables["table"] || db.tables["table"].length === 0) {
      return { values: [], valuesTotal: 0 };
    }
    const res = executeQueries(
      db.database,
      buildAntdColumnStatsQuery(Q.select().from("table"), input)
    );
    const [results, count, minMax] = res.data.results;

    const { min, max } = (minMax?.[0] as { min?: T; max?: T }) ?? {};

    return {
      values: results?.map((item) => item["value"]) ?? [],
      valuesTotal: (count?.[0] as { total?: number }).total ?? 0,
      min,
      max,
    };
  }
  throw new Error("No listQueryFn provided");
}

export const EntityList = <T extends EntityItem, S extends OptionType>({
  entity,
  visibleColumns,
  ...props
}: EntityListProps<T, S>) => {
  const { list, dataSource } = entity.config;
  const { query, columnStatsQuery, buttons, columns, ...rest } = list ?? {};
  const queryClient = useQueryClient();

  const listQueryFn = dataSource.listQueryFn;
  const crudListQueryFn = dataSource.crud?.listQueryFn;
  const columnStatsQueryFn = dataSource.listColumnStatsQueryFn;
  const deleteMutationFn = dataSource.crud?.deleteMutationFn;

  return (
    (listQueryFn || crudListQueryFn) && (
      <QueryTableWithButtons
        query={{
          queryKey: entity.getListPageQueryKey(), //[rootRoute.to, "list"],
          queryFn: async (state, ctx): Promise<TableData<T>> => {
            return fetchDataByState<T>(
              queryClient,
              entity.getListPageQueryKey(),
              state,
              dataSource,
              ctx
            );
          },
          ...query,
        }}
        columnStatsQuery={
          (columnStatsQuery && columnStatsQueryFn) || crudListQueryFn
            ? {
                queryKey: [...entity.getListPageQueryKey(), "column-stats"],
                queryFn: (input) => {
                  return fetchColumnStats<T>(
                    queryClient,
                    entity.getListPageQueryKey(),
                    input,
                    dataSource
                  );
                },
                ...columnStatsQuery,
              }
            : undefined
        }
        buttons={buttons}
        deleteMutationFn={deleteMutationFn}
        columns={
          (visibleColumns === undefined
            ? columns
            : columns?.filter(
                (col) =>
                  col.key &&
                  (col.key === "buttons" ||
                    visibleColumns.includes(col.key.toString()))
              )) ?? []
        }
        {...rest}
        {...props}
      />
    )
  );
};
