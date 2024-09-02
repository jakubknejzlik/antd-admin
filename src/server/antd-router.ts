import { resolveOptionalThunkAsync, ThunkAsync } from "ts-thunk";
import { z } from "zod";

import { Cond, Q, SelectQuery } from "@jakub.knejzlik/ts-query";
import { initTRPC } from "@trpc/server";
import { RunQueriesHandler } from "./types";

type CreateAntdRouteOptions = {
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

const t = initTRPC.create();

export const createAntdRoutes = <T>({
  tableName,
  defaultQuery,
  defaultSelectQuery,
  runQueries,
}: CreateAntdRouteOptions) => {
  // procedure.input(z.object({ pagination: z.object({ current: z.number(), pageSize: z.number() }) }));
  return {
    table: t.procedure
      .input(
        z.object({
          pagination: z.object({
            current: z.number(),
            pageSize: z.number(),
          }),
          sorter: z.array(
            z.object({
              field: z.union([z.string(), z.number()]),
              order: z.enum(["ascend", "descend"]),
            })
          ),
          filters: z.record(
            z
              .array(z.union([z.string(), z.boolean(), z.number(), z.bigint()]))
              .nullable()
          ),
          columns: z.array(z.string()).optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const { pagination, sorter, filters, columns, search } = input;

        let sourceQuery = Q.select().from(
          (await resolveOptionalThunkAsync(defaultQuery)) ??
            Q.select().from(tableName)
        );

        for (const [field, values] of Object.entries(filters)) {
          if (values === null || values.length === 0) {
            continue;
          }
          sourceQuery =
            sourceQuery.where(Cond.in(field, values)) ??
            Q.select().from(tableName);
        }

        if (search && columns) {
          sourceQuery = sourceQuery.where(getSearchConditions(columns, search));
        }

        let query = sourceQuery
          .limit(pagination.pageSize)
          .offset((pagination.current - 1) * pagination.pageSize);

        if (columns) {
          query = query.addField("id");
          for (const column of columns) {
            query = query.addField(column);
          }
        }
        for (const { field, order } of sorter) {
          query = query.orderBy(field, order === "ascend" ? "ASC" : "DESC");
        }

        const [results, count] = await runQueries<T>([
          query,
          Q.select().from(sourceQuery).addField("count(*)", "total"),
        ]);
        return {
          items: results?.results ?? [],
          total: (count?.results[0] as { total?: number }).total ?? 0,
        };
      }),
    select: t.procedure
      .input(z.object({ search: z.string().optional() }))
      .query(async ({ input }) => {
        const selectQuery = Q.select().from(
          (await resolveOptionalThunkAsync(defaultSelectQuery)) ??
            (await resolveOptionalThunkAsync(defaultQuery)) ??
            Q.select()
              .from(tableName)
              .addField("id", "value")
              .addField("name", "label")
        );
        let query = selectQuery.limit(100);

        if (input.search) {
          query = Q.select()
            .from(query)
            .where(getSearchConditions(["label"], input.search));
        }

        const [results, count] = await runQueries<{
          value: string;
          label: string;
        }>([query, Q.select().from(query).addField("count(*)", "total")]);

        return {
          items: results?.results ?? [],
          total: (count?.results[0] as { total?: number }).total ?? 0,
        };
      }),
  };
};
