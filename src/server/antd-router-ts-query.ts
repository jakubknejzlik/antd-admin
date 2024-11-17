import { resolveOptionalThunkAsync, ThunkAsync } from "ts-thunk";

import { Cond, Q, SelectQuery } from "@jakub.knejzlik/ts-query";
import {
  buildAntdColumnStatsQuery,
  buildAntdTableQuery,
} from "../helpers/antd-query-builder";
import {
  TableColumnStatsInput,
  TableQueryQueryState,
} from "../ui/data-display/QueryTable";
import { CreateAntdRouteOptions, createAntdRoutes } from "./antd-router";
import { RunQueriesHandler } from "./types";

type CreateAntdTsQueryRouteOptions<T> = {
  tableName: string;
  defaultQuery?: ThunkAsync<SelectQuery>;
  defaultSelectQuery?: ThunkAsync<SelectQuery>;
  runQueries: RunQueriesHandler;
} & CreateAntdRouteOptions<T>;

const getSearchConditions = (columns: string[], search: string) => {
  const parts = search.split(" ");
  const or = [];
  for (const part of parts) {
    for (const column of columns) {
      or.push(Cond.like(column, `${part}%`));
      or.push(Cond.like(column, `% ${part}%`));
      or.push(Cond.like(column, `%-${part}%`));
      or.push(Cond.like(column, `%_${part}%`));
    }
  }
  return Cond.or(or);
};

export const createAntdTsQueryRoutes = <T>({
  tableName,
  defaultQuery,
  defaultSelectQuery,
  runQueries,
  ...rest
}: CreateAntdTsQueryRouteOptions<T>) => {
  return createAntdRoutes<T>({
    ...rest,
    tableHandlerFn: async (state) => {
      let sourceQuery = Q.select().from(
        (await resolveOptionalThunkAsync(defaultQuery)) ??
          Q.select().from(tableName)
      );
      const [results, count] = await runQueries<T>(
        buildAntdTableQuery(sourceQuery, state as TableQueryQueryState)
      );
      return {
        items: results?.results ?? [],
        total: (count?.results[0] as { total?: number }).total ?? 0,
      };
    },
    selectHandlerFn: async ({ search, pagination }) => {
      const selectQuery = Q.select().from(
        (await resolveOptionalThunkAsync(defaultSelectQuery)) ??
          (await resolveOptionalThunkAsync(defaultQuery)) ??
          Q.select()
            .from(tableName)
            .addField("id", "value")
            .addField("name", "label")
      );
      let query = selectQuery;

      if (search) {
        query = Q.select()
          .from(query)
          .where(getSearchConditions(["label"], search));
      }

      const queryWithoutPagination = query;
      if (pagination) {
        query = query
          .limit(pagination.pageSize)
          .offset((pagination.current - 1) * pagination.pageSize);
      } else {
        query = query.limit(100);
      }

      const [results, count] = await runQueries<{
        value: string;
        label: string;
      }>([
        query,
        Q.select().from(queryWithoutPagination).addField("count(*)", "total"),
      ]);

      return {
        items: results?.results ?? [],
        total: (count?.results[0] as { total?: number }).total ?? 0,
      };
    },
    columnStatsHandlerFn: async (input) => {
      const selectQuery = Q.select().from(
        (await resolveOptionalThunkAsync(defaultQuery)) ??
          Q.select().from(tableName).addField(input.column)
      );

      const [results, count, minMax] = await runQueries<{
        value: unknown;
      }>(
        buildAntdColumnStatsQuery(
          selectQuery,
          input as TableColumnStatsInput<any>
        )
      );

      const { min, max } =
        (minMax?.results[0] as { min?: unknown; max?: unknown }) ?? {};
      return {
        values: results?.results.map((item) => item.value) ?? [],
        valuesTotal: (count?.results[0] as { total?: number }).total ?? 0,
        min,
        max,
      };
    },
  });
};
