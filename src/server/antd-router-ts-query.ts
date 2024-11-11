import { resolveOptionalThunkAsync, ThunkAsync } from "ts-thunk";

import { Cond, Fn, Q, SelectQuery } from "@jakub.knejzlik/ts-query";
import {
  buildAntdColumnStatsQuery,
  buildAntdTableQuery,
} from "../helpers/antd-query-builder";
import {
  TableColumnStatsInput,
  TableQueryQueryState,
} from "../ui/data-display/QueryTable";
import { createAntdRoutes } from "./antd-router";
import { RunQueriesHandler } from "./types";

type CreateAntdTsQueryRouteOptions = {
  tableName: string;
  defaultQuery?: ThunkAsync<SelectQuery>;
  defaultSelectQuery?: ThunkAsync<SelectQuery>;
  runQueries: RunQueriesHandler;
};

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
}: CreateAntdTsQueryRouteOptions) => {
  return createAntdRoutes<T>({
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

      // let query = Q.select()
      //   .from(selectQuery)
      //   .addField(column, "value")
      //   .groupBy(column)
      //   .orderBy(column);

      // const queryWithoutPagination = query;
      // if (pagination) {
      //   query = query
      //     .limit(pagination.pageSize)
      //     .offset((pagination.current - 1) * pagination.pageSize);
      // } else {
      //   query = query.limit(100);
      // }

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

// export const createAntdTsQueryRoutes = <T>({
//   tableName,
//   defaultQuery,
//   defaultSelectQuery,
//   runQueries,
// }: CreateAntdTsQueryRouteOptions) => {
//   // procedure.input(z.object({ pagination: z.object({ current: z.number(), pageSize: z.number() }) }));
//   return {
//     table: t.procedure
//       .input(
//         z.object({
//           pagination: PaginationSchema,
//           sorter: z.array(
//             z.object({
//               field: z.union([z.string(), z.number()]),
//               order: z.enum(["ascend", "descend"]),
//             })
//           ),
//           filters: z.record(
//             z
//               .array(z.union([z.string(), z.boolean(), z.number(), z.bigint()]))
//               .nullable()
//           ),
//           columns: z.array(z.string()).optional(),
//           search: z.string().optional(),
//           groupBy: z.array(z.string()).optional(),
//         })
//       )
//       .query(async ({ input }) => {
//         console.log("table", input);
//         const { pagination, sorter, filters, columns, search } = input;

//         let sourceQuery = Q.select().from(
//           (await resolveOptionalThunkAsync(defaultQuery)) ??
//             Q.select().from(tableName)
//         );

//         for (const [field, values] of Object.entries(filters)) {
//           if (values === null || values.length === 0) {
//             continue;
//           }
//           // TODO: handle range filters better than length === 2 with specific value types (eg. introduce >, <, >=, <= for filtering)
//           if (
//             values.length === 2 &&
//             typeof values[0] === "number" &&
//             typeof values[1] === "number"
//           ) {
//             sourceQuery = sourceQuery.where(
//               Cond.between(field, values as [number, number])
//             );
//           } else if (
//             values.length === 2 &&
//             typeof values[0] === "string" &&
//             dayjs(values[0]).isValid() &&
//             typeof values[1] === "string" &&
//             dayjs(values[1]).isValid()
//           ) {
//             sourceQuery = sourceQuery.where(
//               Cond.between(field, values as [string, string])
//             );
//           } else {
//             sourceQuery = sourceQuery.where(Cond.in(field, values));
//           }
//         }

//         if (search && columns) {
//           sourceQuery = sourceQuery.where(getSearchConditions(columns, search));
//         }

//         let query = sourceQuery
//           .limit(pagination.pageSize)
//           .offset((pagination.current - 1) * pagination.pageSize);

//         if (columns) {
//           query = query.addField("id");
//           for (const column of columns) {
//             query = query.addField(column);
//           }
//         }
//         for (const { field, order } of sorter) {
//           query = query.orderBy(field, order === "ascend" ? "ASC" : "DESC");
//         }

//         console.log(query.toSQL());
//         const [results, count] = await runQueries<T>([
//           query,
//           Q.select().from(sourceQuery).addField("count(*)", "total"),
//         ]);
//         return {
//           items: results?.results ?? [],
//           total: (count?.results[0] as { total?: number }).total ?? 0,
//         };
//       }),
//     select: t.procedure
//       .input(
//         z.object({
//           search: z.string().optional(),
//           pagination: PaginationSchema.optional(),
//         })
//       )
//       .query(async ({ input }) => {
//         const { search, pagination } = input;
//         const selectQuery = Q.select().from(
//           (await resolveOptionalThunkAsync(defaultSelectQuery)) ??
//             (await resolveOptionalThunkAsync(defaultQuery)) ??
//             Q.select()
//               .from(tableName)
//               .addField("id", "value")
//               .addField("name", "label")
//         );
//         let query = selectQuery;

//         if (search) {
//           query = Q.select()
//             .from(query)
//             .where(getSearchConditions(["label"], search));
//         }

//         const queryWithoutPagination = query;
//         if (pagination) {
//           query = query
//             .limit(pagination.pageSize)
//             .offset((pagination.current - 1) * pagination.pageSize);
//         } else {
//           query = query.limit(100);
//         }

//         const [results, count] = await runQueries<{
//           value: string;
//           label: string;
//         }>([
//           query,
//           Q.select().from(queryWithoutPagination).addField("count(*)", "total"),
//         ]);

//         return {
//           items: results?.results ?? [],
//           total: (count?.results[0] as { total?: number }).total ?? 0,
//         };
//       }),
//     columnStats: t.procedure
//       .input(
//         z.object({
//           column: z.string(),
//           pagination: PaginationSchema.optional(),
//         })
//       )
//       .query(async ({ input }) => {
//         const { column, pagination } = input;
//         const selectQuery = Q.select().from(
//           (await resolveOptionalThunkAsync(defaultQuery)) ??
//             Q.select().from(tableName).addField(column)
//         );

//         let query = Q.select()
//           .from(selectQuery)
//           .addField(column, "value")
//           .groupBy(column)
//           .orderBy(column);

//         const queryWithoutPagination = query;
//         if (pagination) {
//           query = query
//             .limit(pagination.pageSize)
//             .offset((pagination.current - 1) * pagination.pageSize);
//         } else {
//           query = query.limit(100);
//         }

//         const [results, count, minMax] = await runQueries<{
//           value: unknown;
//         }>([
//           query,
//           Q.select().from(queryWithoutPagination).addField("count(*)", "total"),
//           Q.select()
//             .from(queryWithoutPagination)
//             .addField(Fn.min("value"), "min")
//             .addField(Fn.max("value"), "max"),
//         ]);

//         const { min, max } =
//           (minMax?.results[0] as { min?: unknown; max?: unknown }) ?? {};
//         return {
//           values: results?.results.map((item) => item.value) ?? [],
//           valuesTotal: (count?.results[0] as { total?: number }).total ?? 0,
//           min,
//           max,
//         };
//       }),
//   };
// };
